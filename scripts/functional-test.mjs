// Functional API test: exercises every route (happy path, validation, authorization) and checks
// database state afterwards.
//
// Usage: node scripts/functional-test.mjs http://localhost:PORT --db mixtape_validation_<name> [--container X]
//
// Localhost-only and throwaway-database-only: refuses any other base URL, and any database whose name
// does not start with "mixtape_validation_". Requires the target to run with ALLOW_PUBLIC_SIGNUP unset
// (accounts are created through the invite flow) and with the NEXTAUTH_SECRET passed as
// FUNCTIONAL_NEXTAUTH_SECRET (used only to craft forged/expired tokens in the hostile-input tests).
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const base = (args[0] || '').replace(/\/$/, '');
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const db = opt('db');
const container = opt('container', 'mixtape-dev-postgres');
const mailhog = opt('mailhog', 'http://localhost:8025');
const psqlUrl = process.env.SMOKE_PSQL_URL;

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) { console.error('Refusing: base URL must be localhost.'); process.exit(2); }
if (!db || !db.startsWith('mixtape_validation_')) { console.error('Refusing: --db must start with mixtape_validation_.'); process.exit(2); }
if (psqlUrl) {
  const u = new URL(psqlUrl);
  const allowedHosts = ['localhost', '127.0.0.1', 'postgres', process.env.SMOKE_ALLOW_PG_HOST].filter(Boolean);
  if (!allowedHosts.includes(u.hostname) || !u.pathname.slice(1).startsWith('mixtape_validation_')) {
    console.error('Refusing: SMOKE_PSQL_URL must point at a local/CI postgres host and a mixtape_validation_* database.');
    process.exit(2);
  }
}

const results = [];
const record = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`); };
const info = (name, detail) => console.log(`INFO  ${name}  [${detail}]`);
const section = (t) => console.log(`\n--- ${t}`);

function psql(sql) {
  const [cmd, argv] = psqlUrl
    ? ['psql', [psqlUrl, '-tAc', sql]]
    : ['docker', ['exec', container, 'psql', '-U', 'postgres', '-d', db, '-tAc', sql]];
  return execFileSync(cmd, argv, { encoding: 'utf8' }).trim();
}
const q = (s) => s.replace(/'/g, "''");

class Jar {
  cookies = new Map();
  absorb(res) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(';'); const eq = pair.indexOf('=');
      const name = pair.slice(0, eq).trim(); const value = pair.slice(eq + 1).trim();
      if (value === '' || /max-age=0/i.test(line)) this.cookies.delete(name); else this.cookies.set(name, value);
    }
  }
  header() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '); }
}

let client = 1;
async function call(method, path, { jar, json, raw, headers = {}, cookie } = {}) {
  const h = { ...headers };
  if (!h['x-forwarded-for']) h['x-forwarded-for'] = `198.51.100.${(client++ % 250) + 1}`;
  if (cookie) h.cookie = cookie; else if (jar?.cookies.size) h.cookie = jar.header();
  let body;
  if (raw !== undefined) { body = raw; h['content-type'] = h['content-type'] ?? 'application/json'; }
  else if (json !== undefined) { h['content-type'] = 'application/json'; body = JSON.stringify(json); }
  const res = await fetch(base + path, { method, headers: h, body, redirect: 'manual' });
  jar?.absorb(res);
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, headers: res.headers, data, text };
}

async function login(email, password) {
  const jar = new Jar();
  const c = await call('GET', '/api/auth/csrf', { jar });
  await call('POST', '/api/auth/callback/credentials', { jar, raw: new URLSearchParams({ csrfToken: c.data.csrfToken, email, password, json: 'true' }).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const s = await call('GET', '/api/auth/session', { jar });
  return { jar, session: s.data };
}
const csrfOf = async (s) => (await call('GET', '/api/csrf', { jar: s.jar })).data.csrfToken;

async function lastMailTo(address, tries = 10) {
  for (let i = 0; i < tries; i++) {
    const r = await (await fetch(`${mailhog}/api/v2/search?kind=to&query=${encodeURIComponent(address)}`)).json();
    if (r.total > 0) return r.items[0];
    await new Promise((r2) => setTimeout(r2, 500));
  }
  return null;
}
const qpDecode = (s) => s.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

const run = randomBytes(4).toString('hex');
const pw = `Func!Test#${run}Zz`;
const rootEmail = 'tim@levesques.net';
const adminEmail = `func-admin-${run}@example.test`;
const u1Email = `func-u1-${run}@example.test`;
const u2Email = `func-u2-${run}@example.test`;

console.log(`\n== Functional test against ${base} (run ${run}) ==`);

// ------------------------------------------------------------------ setup
section('setup (throwaway database only)');
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync(pw, 10);
for (const [id, email] of [['func-root', rootEmail], ['func-admin', adminEmail]]) {
  psql(`INSERT INTO "User"(id,email,password,"isAdmin") VALUES ('${id}-${run}','${q(email)}','${hash}',true) ON CONFLICT (email) DO UPDATE SET password='${hash}', "isAdmin"=true`);
}
const songs = [
  ['Yellow', 'Coldplay', 'Rock', 2000], ['Fortunate Son', 'Creedence Clearwater Revival', 'Rock', 1960],
  ['Tennessee Whiskey', 'Chris Stapleton', 'Country', 2010], ['Summer of 69', 'Bryan Adams', 'Rock', 1980],
  ['Hotel California', 'Eagles', 'Rock', 1970], ['Jolene', 'Dolly Parton', 'Country', 1970],
  ['Take Me Home', 'John Denver', 'Folk', 1970], ['Sultans of Swing', 'Dire Straits', 'Rock', 1970],
];
for (const [t, a, g, d] of songs) psql(`INSERT INTO "Song"(title,artist,genre,decade,"updatedAt") VALUES ('${q(t)}','${q(a)}','${g}',${d},now())`);
const songIds = psql(`SELECT id FROM "Song" ORDER BY id`).split('\n').map(Number);
const [s1, s2, s3, s4, s5, s6] = songIds;
record('seeded 8 songs', songIds.length === 8);

const root = await login(rootEmail, pw);
const admin = await login(adminEmail, pw);
record('root and admin accounts can log in', root.session?.user?.email === rootEmail && admin.session?.user?.email === adminEmail);
const rootCsrf = await csrfOf(root);
const adminCsrf = await csrfOf(admin);

for (const email of [u1Email, u2Email]) {
  await call('POST', '/api/invite', { jar: admin.jar, json: { email, csrfToken: adminCsrf } });
  const token = psql(`SELECT token FROM "Invite" WHERE email='${q(email)}' ORDER BY "createdAt" DESC LIMIT 1`);
  const r = await call('POST', '/api/invite/accept', { json: { token, password: pw } });
  record(`member ${email.split('@')[0]} created through the invite flow`, r.status === 200, String(r.status));
}
const u1 = await login(u1Email, pw); const u2 = await login(u2Email, pw);
const u1Csrf = await csrfOf(u1); const u2Csrf = await csrfOf(u2);
const u1Id = u1.session.user.id; const u2Id = u2.session.user.id;

// ------------------------------------------------------------------ public/utility routes
section('utility routes');
const csrfNoAuth = await call('GET', '/api/csrf');
record('GET /api/csrf without a session is redirected/blocked', csrfNoAuth.status !== 200, String(csrfNoAuth.status));
const inviteValidateBad = await call('GET', '/api/invite/validate?token=nope');
record('GET /api/invite/validate with a bad token returns ok:false', inviteValidateBad.data?.ok === false);
const inviteValidateNone = await call('GET', '/api/invite/validate');
record('GET /api/invite/validate with no token returns ok:false', inviteValidateNone.data?.ok === false);
const verifyBad = await call('GET', '/api/auth/verify-reset-token?token=nope');
record('verify-reset-token: unknown token is 404', verifyBad.status === 404, String(verifyBad.status));
const verifyNone = await call('GET', '/api/auth/verify-reset-token');
record('verify-reset-token: missing token is 400', verifyNone.status === 400, String(verifyNone.status));
const diag = await call('GET', '/api/auth/diag');
info('GET /api/auth/diag on this build (diag branch not merged: expect 404)', String(diag.status));

// ------------------------------------------------------------------ songs
section('songs');
const list = await call('GET', '/api/songs', { jar: u1.jar });
record('GET /api/songs lists all seeded songs', list.status === 200 && list.data.length >= 8, `${list.data?.length}`);
const leakKeys = ['password', 'email', 'isAdmin'];
record('song list exposes no user fields', !leakKeys.some((k) => JSON.stringify(list.data).includes(`"${k}"`)));

const addBad = [
  ['empty title', { title: '', artist: 'X' }], ['missing artist', { title: 'X' }],
  ['title too long', { title: 'x'.repeat(500), artist: 'A' }], ['non-string title', { title: 123, artist: 'A' }],
];
for (const [label, body] of addBad) {
  const r = await call('POST', '/api/songs/add', { jar: u1.jar, json: { ...body, csrfToken: u1Csrf } });
  record(`songs/add rejects ${label}`, r.status === 400, String(r.status));
}
const addDup = await call('POST', '/api/songs/add', { jar: u1.jar, json: { title: 'Yellow', artist: 'Coldplay', album: 'Parachutes', releaseDate: 2000, csrfToken: u1Csrf } });
record('songs/add rejects an exact duplicate (409)', addDup.status === 409, String(addDup.status));
const addNoCsrf = await call('POST', '/api/songs/add', { jar: u1.jar, json: { title: 'Z', artist: 'Z' } });
record('songs/add without CSRF is rejected', addNoCsrf.status === 403, String(addNoCsrf.status));

const edit = await call('PATCH', `/api/songs/${s1}/edit`, { jar: admin.jar, json: { title: 'Yellow (Edited)', artist: 'Coldplay', album: 'Parachutes', releaseDate: 2000, genre: 'Rock', csrfToken: adminCsrf } });
record('admin can edit a song', edit.status === 200, String(edit.status));
record('edit persisted', psql(`SELECT title FROM "Song" WHERE id=${s1}`) === 'Yellow (Edited)');
const editBad = await call('PATCH', `/api/songs/${s1}/edit`, { jar: admin.jar, json: { title: '', artist: '', csrfToken: adminCsrf } });
record('edit rejects empty title/artist', editBad.status === 400, String(editBad.status));
const editMissing = await call('PATCH', '/api/songs/999999/edit', { jar: admin.jar, json: { title: 'a', artist: 'b', csrfToken: adminCsrf } });
record('edit of a missing song does not succeed', editMissing.status >= 400, String(editMissing.status));
const editMember = await call('PATCH', `/api/songs/${s1}/edit`, { jar: u1.jar, json: { title: 'hacked', artist: 'hacked', csrfToken: u1Csrf } });
record('member cannot edit a song', editMember.status === 401 || editMember.status === 403, String(editMember.status));

const links = await call('POST', '/api/songs/update-links', { jar: admin.jar, json: { songId: s2, youtubeUrl: 'https://music.youtube.com/watch?v=abc', songsterrUrl: 'https://www.songsterr.com/a/x', ultimateGuitarUrl: '', lyricsUrl: 'https://genius.com/x', csrfToken: adminCsrf } });
record('admin can update resource links', links.status === 200, String(links.status));
record('links persisted (empty becomes null)', psql(`SELECT youtube||'|'||coalesce(\"ultimateGuitar\",'NULL') FROM "Song" WHERE id=${s2}`) === 'https://music.youtube.com/watch?v=abc|NULL');
const linksBad = await call('POST', '/api/songs/update-links', { jar: admin.jar, json: { songId: s2, youtubeUrl: 'javascript:alert(document.domain)', csrfToken: adminCsrf } });
record('update-links rejects a javascript: URL', linksBad.status === 400, String(linksBad.status));
const linksData = await call('POST', '/api/songs/update-links', { jar: admin.jar, json: { songId: s2, lyricsUrl: 'data:text/html,<script>alert(1)</script>', csrfToken: adminCsrf } });
record('update-links rejects a data: URL', linksData.status === 400, String(linksData.status));
record('rejected links were not stored', !/javascript:|data:/.test(psql(`SELECT coalesce(youtube,'')||coalesce(lyrics,'') FROM "Song" WHERE id=${s2}`)));

// ------------------------------------------------------------------ comments
section('comments');
const cNone = await call('POST', `/api/songs/${s1}/comments`, { jar: u1.jar, json: { content: '   ', csrfToken: u1Csrf } });
record('comment: whitespace-only is rejected', cNone.status === 400, String(cNone.status));
const cLong = await call('POST', `/api/songs/${s1}/comments`, { jar: u1.jar, json: { content: 'x'.repeat(1001), csrfToken: u1Csrf } });
record('comment: >1000 characters is rejected', cLong.status === 400, String(cLong.status));
const cType = await call('POST', `/api/songs/${s1}/comments`, { jar: u1.jar, json: { content: { a: 1 }, csrfToken: u1Csrf } });
record('comment: non-string content is rejected', cType.status === 400, String(cType.status));
const cSong = await call('POST', '/api/songs/999999/comments', { jar: u1.jar, json: { content: 'hi', csrfToken: u1Csrf } });
record('comment: unknown song is 404', cSong.status === 404, String(cSong.status));
const cId = await call('POST', '/api/songs/abc/comments', { jar: u1.jar, json: { content: 'hi', csrfToken: u1Csrf } });
record('comment: non-numeric song id is 400', cId.status === 400, String(cId.status));
const cOk = await call('POST', `/api/songs/${s1}/comments`, { jar: u1.jar, json: { content: 'Nice tune', csrfToken: u1Csrf } });
record('comment: valid comment is created', cOk.status === 201, String(cOk.status));
const cList = await call('GET', `/api/songs/${s1}/comments`, { jar: u2.jar });
record('comment list contains it', cList.status === 200 && cList.data.some((c) => c.content === 'Nice tune'));
record('comment list does not expose author email or password', !/"email"|"password"/.test(JSON.stringify(cList.data)));
const adminDelOther = await call('DELETE', `/api/songs/${s1}/comments/${cOk.data.id}`, { jar: admin.jar, headers: { 'x-csrf-token': adminCsrf } });
record('admin can delete any comment', adminDelOther.status === 200, String(adminDelOther.status));
const delGone = await call('DELETE', `/api/songs/${s1}/comments/${cOk.data.id}`, { jar: admin.jar, headers: { 'x-csrf-token': adminCsrf } });
record('deleting an already-deleted comment is 404', delGone.status === 404, String(delGone.status));

// ------------------------------------------------------------------ battle
section('battle');
const next = await call('GET', '/api/battle/next', { jar: u1.jar });
record('battle/next returns two different songs', next.status === 200 && next.data.a?.id !== next.data.b?.id && next.data.a && next.data.b, `${next.data?.a?.id} vs ${next.data?.b?.id}`);
const [wId, lId] = [next.data.a.id, next.data.b.id];
const eloBefore = psql(`SELECT elo FROM "Song" WHERE id=${wId}`);
const vote = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: wId, loserId: lId, csrfToken: u1Csrf } });
record('battle/submit records a vote', vote.status === 200 && vote.data.ok === true, String(vote.status));
record('winner ELO went up, loser ELO went down', Number(psql(`SELECT elo FROM "Song" WHERE id=${wId}`)) > Number(eloBefore) && Number(psql(`SELECT elo FROM "Song" WHERE id=${lId}`)) < 1500);
record('vote row stored with the voter id', psql(`SELECT count(*) FROM "BattleVote" WHERE "userId"='${u1Id}'`) === '1');
const quick = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: wId, loserId: lId, csrfToken: u1Csrf } });
record('voting again within 2 s is throttled (429)', quick.status === 429, String(quick.status));
await new Promise((r) => setTimeout(r, 2200));
const skip = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: s3, loserId: s4, skipped: true, csrfToken: u1Csrf } });
record('skipping a pair works', skip.status === 200, String(skip.status));
record('skipped songs are recorded', Number(psql(`SELECT count(*) FROM "BattleSkip" WHERE "userId"='${u1Id}'`)) >= 1);
const nextAfterSkip = await call('GET', '/api/battle/next', { jar: u1.jar });
record('skipped songs are excluded from the next pairing', nextAfterSkip.status === 204 || ![nextAfterSkip.data?.a?.id, nextAfterSkip.data?.b?.id].some((id) => id === s3 || id === s4));
await new Promise((r) => setTimeout(r, 2200));
const badIds = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: 999991, loserId: 999992, csrfToken: u1Csrf } });
record('battle/submit with unknown song ids is a 4xx', badIds.status >= 400 && badIds.status < 500, String(badIds.status));
await new Promise((r) => setTimeout(r, 2200));
const badTypes = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: 'a', loserId: { x: 1 }, csrfToken: u1Csrf } });
record('battle/submit with non-numeric ids is a 4xx (not 5xx)', badTypes.status >= 400 && badTypes.status < 500, String(badTypes.status));
await new Promise((r) => setTimeout(r, 2200));
const same = await call('POST', '/api/battle/submit', { jar: u1.jar, json: { winnerId: s5, loserId: s5, csrfToken: u1Csrf } });
record('battle/submit with the same song on both sides is rejected', same.status >= 400 && same.status < 500, String(same.status));

// ------------------------------------------------------------------ preferences
section('preferences');
const prefGet0 = await call('GET', '/api/preferences', { jar: u1.jar });
record('preferences GET works before any save', prefGet0.status === 200, String(prefGet0.status));
const prefOk = await call('POST', '/api/preferences', { jar: u1.jar, json: { genres: ['Rock'], decades: [1970, 1980], artists: ['Eagles'], csrfToken: u1Csrf } });
record('preferences POST saves', prefOk.status === 200, String(prefOk.status));
const prefGet = await call('GET', '/api/preferences', { jar: u1.jar });
record('preferences round-trip', JSON.stringify(prefGet.data?.preferences?.genres ?? prefGet.data?.genres) === '["Rock"]', JSON.stringify(prefGet.data).slice(0, 80));
const prefOther = await call('GET', '/api/preferences', { jar: u2.jar });
record("another user does not see u1's preferences", !JSON.stringify(prefOther.data).includes('Eagles'));
for (const [label, body] of [['non-array genres', { genres: 'Rock', decades: [], artists: [] }], ['decade out of range', { genres: [], decades: [1500], artists: [] }], ['decade not a number', { genres: [], decades: ['1970'], artists: [] }]]) {
  const r = await call('POST', '/api/preferences', { jar: u1.jar, json: { ...body, csrfToken: u1Csrf } });
  record(`preferences rejects ${label}`, r.status === 400, String(r.status));
}

// ------------------------------------------------------------------ practice (woodshed)
section('practice / woodshed');
const pAdd = await call('POST', '/api/practice', { jar: u1.jar, json: { songId: s5, priority: 4, notes: 'learn solo', csrfToken: u1Csrf } });
const pid = pAdd.data?.id ?? pAdd.data?.item?.id;
record('practice: add a song', (pAdd.status === 200 || pAdd.status === 201) && !!pid, `${pAdd.status} ${pid}`);
const pAddDup = await call('POST', '/api/practice', { jar: u1.jar, json: { songId: s5, csrfToken: u1Csrf } });
record('practice: adding the same song twice does not create a duplicate', Number(psql(`SELECT count(*) FROM "PracticeListItem" WHERE "userId"='${u1Id}' AND "songId"=${s5}`)) === 1, String(pAddDup.status));
const pBadSong = await call('POST', '/api/practice', { jar: u1.jar, json: { songId: 999999, csrfToken: u1Csrf } });
record('practice: unknown song is 404', pBadSong.status === 404, String(pBadSong.status));
const pList = await call('GET', '/api/practice', { jar: u1.jar });
record('practice: list contains the item', JSON.stringify(pList.data).includes(pid));
const pLearn = await call('PATCH', `/api/practice/${pid}`, { jar: u1.jar, json: { status: 'LEARNING', priority: 5, notes: 'updated', csrfToken: u1Csrf } });
record('practice: update status/priority/notes', pLearn.status === 200, String(pLearn.status));
record('practice: update persisted', psql(`SELECT status||'|'||priority FROM "PracticeListItem" WHERE id='${pid}'`) === 'LEARNING|5');
await call('PATCH', `/api/practice/${pid}`, { jar: u1.jar, json: { status: 'BOGUS', priority: 99, csrfToken: u1Csrf } });
record('practice: invalid status/priority are ignored, not stored', psql(`SELECT status||'|'||priority FROM "PracticeListItem" WHERE id='${pid}'`) === 'LEARNING|5');
const pConf = await call('PATCH', `/api/practice/${pid}`, { jar: u1.jar, json: { status: 'CONFIDENT', csrfToken: u1Csrf } });
record('practice: CONFIDENT sets readiness SOLID', pConf.status === 200 && psql(`SELECT status FROM "SongReadiness" WHERE "userId"='${u1Id}' AND "songId"=${s5}`) === 'SOLID');
const pMissing = await call('PATCH', '/api/practice/does-not-exist', { jar: u1.jar, json: { status: 'LEARNING', csrfToken: u1Csrf } });
record('practice: unknown id is 404', pMissing.status === 404, String(pMissing.status));
const pDelOther = await call('DELETE', `/api/practice/${pid}`, { jar: u2.jar, json: { csrfToken: u2Csrf } });
record("practice: another user cannot delete it", pDelOther.status === 403, String(pDelOther.status));
const pDel = await call('DELETE', `/api/practice/${pid}`, { jar: u1.jar, json: { csrfToken: u1Csrf } });
record('practice: owner can delete', pDel.status === 200, String(pDel.status));
record('practice: item is gone', psql(`SELECT count(*) FROM "PracticeListItem" WHERE id='${pid}'`) === '0');

// ------------------------------------------------------------------ readiness + admin practice notes
section('readiness and practice notes');
for (const st of ['SOLID', 'NEEDS_WORK', 'NOT_READY']) {
  const r = await call('POST', `/api/songs/${s6}/readiness`, { jar: u1.jar, json: { status: st, csrfToken: u1Csrf } });
  record(`readiness: set ${st}`, r.status === 200, String(r.status));
}
record('readiness: stored per user (one row)', psql(`SELECT count(*) FROM "SongReadiness" WHERE "userId"='${u1Id}' AND "songId"=${s6}`) === '1');
await call('POST', `/api/songs/${s6}/readiness`, { jar: u2.jar, json: { status: 'SOLID', csrfToken: u2Csrf } });
const rGet = await call('GET', `/api/songs/${s6}/readiness`, { jar: u1.jar });
record('readiness: GET aggregates both users', rGet.status === 200 && JSON.stringify(rGet.data).length > 10, JSON.stringify(rGet.data).slice(0, 90));
const rBad = await call('POST', `/api/songs/${s6}/readiness`, { jar: u1.jar, json: { status: 'MAYBE', csrfToken: u1Csrf } });
record('readiness: invalid status is 400', rBad.status === 400, String(rBad.status));
const rMissing = await call('POST', '/api/songs/999999/readiness', { jar: u1.jar, json: { status: 'SOLID', csrfToken: u1Csrf } });
record('readiness: unknown song is 404', rMissing.status === 404, String(rMissing.status));
const notes = await call('POST', `/api/songs/${s6}/practice`, { jar: admin.jar, json: { markPracticed: true, keyNotes: 'E minor', tuningNotes: 'Drop D', csrfToken: adminCsrf } });
record('admin can mark practiced and save notes', notes.status === 200, String(notes.status));
record('notes and practiced date persisted', psql(`SELECT "keyNotes"||'|'||("lastPracticedAt" IS NOT NULL) FROM "Song" WHERE id=${s6}`) === 'E minor|true');
const notesMember = await call('POST', `/api/songs/${s6}/practice`, { jar: u1.jar, json: { markPracticed: true, csrfToken: u1Csrf } });
record('member cannot save practice notes (403)', notesMember.status === 403, String(notesMember.status));

// ------------------------------------------------------------------ setlist
section('setlist');
const slAdd1 = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: s1, notes: 'opener', csrfToken: adminCsrf } });
const slAdd2 = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: s2, csrfToken: adminCsrf } });
const slAdd3 = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: s3, csrfToken: adminCsrf } });
record('setlist: admin adds three songs', [slAdd1, slAdd2, slAdd3].every((r) => r.status === 200), [slAdd1, slAdd2, slAdd3].map((r) => r.status).join(','));
record('setlist: positions are 1,2,3', psql(`SELECT string_agg(position::text, ',' ORDER BY position) FROM "SetlistEntry"`) === '1,2,3');
const slDup = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: s1, csrfToken: adminCsrf } });
record('setlist: duplicate is rejected', slDup.status === 400, String(slDup.status));
const slMissing = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: 999999, csrfToken: adminCsrf } });
record('setlist: unknown song is 404', slMissing.status === 404, String(slMissing.status));
const slType = await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: '5', csrfToken: adminCsrf } });
record('setlist: non-numeric songId is 400', slType.status === 400, String(slType.status));
const slGet = await call('GET', '/api/setlist', { jar: u1.jar });
record('setlist: members can read it, ordered by position', slGet.status === 200 && slGet.data.entries.map((e) => e.position).join(',') === '1,2,3');
const slReorder = await call('POST', '/api/setlist/reorder', { jar: admin.jar, json: { order: [{ songId: s3, position: 1 }, { songId: s1, position: 2 }, { songId: s2, position: 3 }], csrfToken: adminCsrf } });
record('setlist: reorder works', slReorder.status === 200, String(slReorder.status));
record('setlist: new order persisted', psql(`SELECT string_agg("songId"::text, ',' ORDER BY position) FROM "SetlistEntry"`) === `${s3},${s1},${s2}`);
const slReorderBad = await call('POST', '/api/setlist/reorder', { jar: admin.jar, json: { order: [{ songId: 'x', position: 1 }], csrfToken: adminCsrf } });
record('setlist: invalid reorder item is 400', slReorderBad.status === 400, String(slReorderBad.status));
const slReorderNotArray = await call('POST', '/api/setlist/reorder', { jar: admin.jar, json: { order: 'nope', csrfToken: adminCsrf } });
record('setlist: non-array order is 400', slReorderNotArray.status === 400, String(slReorderNotArray.status));
const entryId = psql(`SELECT id FROM "SetlistEntry" WHERE "songId"=${s1}`);
const slNote = await call('PATCH', `/api/setlist/${entryId}`, { jar: admin.jar, json: { notes: 'second song', csrfToken: adminCsrf } });
record('setlist: update entry notes', slNote.status === 200 && psql(`SELECT notes FROM "SetlistEntry" WHERE id=${entryId}`) === 'second song', String(slNote.status));
const slNoteBad = await call('PATCH', '/api/setlist/abc', { jar: admin.jar, json: { notes: 'x', csrfToken: adminCsrf } });
record('setlist: non-numeric entry id is 400', slNoteBad.status === 400, String(slNoteBad.status));
const slNoteMissing = await call('PATCH', '/api/setlist/999999', { jar: admin.jar, json: { notes: 'x', csrfToken: adminCsrf } });
record('setlist: unknown entry is 404', slNoteMissing.status === 404, String(slNoteMissing.status));
const slRemove = await call('POST', '/api/setlist/remove', { jar: admin.jar, json: { songId: s3, csrfToken: adminCsrf } });
record('setlist: remove works and positions are compacted', slRemove.status === 200 && psql(`SELECT string_agg(position::text, ',' ORDER BY position) FROM "SetlistEntry"`) === '1,2');
const slRemoveAgain = await call('POST', '/api/setlist/remove', { jar: admin.jar, json: { songId: s3, csrfToken: adminCsrf } });
record('setlist: removing a song not in the list is 404', slRemoveAgain.status === 404, String(slRemoveAgain.status));
for (const [m, p, b] of [['POST', '/api/setlist/add', { songId: s4 }], ['POST', '/api/setlist/remove', { songId: s1 }], ['POST', '/api/setlist/reorder', { order: [] }], ['PATCH', `/api/setlist/${entryId}`, { notes: 'x' }]]) {
  const r = await call(m, p, { jar: u1.jar, json: { ...b, csrfToken: u1Csrf } });
  record(`setlist: member cannot ${m} ${p.replace(/\d+$/, ':id')}`, r.status === 401 || r.status === 403, String(r.status));
}

// ------------------------------------------------------------------ account routes
section('account: username and password');
const unOk = await call('POST', '/api/auth/update-username', { jar: u1.jar, json: { username: 'Rocker_1', csrfToken: u1Csrf } });
record('update-username: valid name saved', unOk.status === 200 && psql(`SELECT name FROM "User" WHERE id='${u1Id}'`) === 'Rocker_1', String(unOk.status));
for (const [label, body] of [['too long (>8)', { username: 'ninechars' }], ['illegal characters', { username: 'a b<>' }], ['non-string', { username: 42 }], ['missing', {}]]) {
  const r = await call('POST', '/api/auth/update-username', { jar: u1.jar, json: { ...body, csrfToken: u1Csrf } });
  record(`update-username rejects ${label} with a 4xx`, r.status >= 400 && r.status < 500, String(r.status));
}
const unClear = await call('POST', '/api/auth/update-username', { jar: u1.jar, json: { username: '', csrfToken: u1Csrf } });
record('update-username: empty string clears the name', unClear.status === 200 && psql(`SELECT coalesce(name,'NULL') FROM "User" WHERE id='${u1Id}'`) === 'NULL', String(unClear.status));
const unNoCsrf = await call('POST', '/api/auth/update-username', { jar: u1.jar, json: { username: 'x' } });
record('update-username without CSRF is rejected', unNoCsrf.status === 403, String(unNoCsrf.status));

const spNoCsrf = await call('POST', '/api/auth/set-password', { jar: u2.jar, json: { password: `New!Pass#${run}Aa` } });
record('set-password (session) without CSRF is rejected', spNoCsrf.status === 403, String(spNoCsrf.status));
const spWeak = await call('POST', '/api/auth/set-password', { jar: u2.jar, json: { password: 'weak', csrfToken: u2Csrf } });
record('set-password: weak password is 400', spWeak.status === 400, String(spWeak.status));
const newPw = `New!Pass#${run}Aa`;
const spOk = await call('POST', '/api/auth/set-password', { jar: u2.jar, json: { password: newPw, csrfToken: u2Csrf } });
record('set-password: strong password accepted', spOk.status === 200, String(spOk.status));
const oldLogin = await login(u2Email, pw);
const newLogin = await login(u2Email, newPw);
record('after change: old password no longer works', !oldLogin.session?.user);
record('after change: new password works', newLogin.session?.user?.email === u2Email);
const spNoSession = await call('POST', '/api/auth/set-password', { json: { password: newPw, csrfToken: 'a.b.c' } });
record('set-password without a session is rejected', spNoSession.status >= 300 && spNoSession.status !== 200, String(spNoSession.status));

// ------------------------------------------------------------------ password reset by email (MailHog)
section('password reset by email');
const resetReq = await call('POST', '/api/admin/send-password-reset', { jar: admin.jar, json: { email: u1Email, csrfToken: adminCsrf } });
record('admin can request a reset email', resetReq.status === 200, String(resetReq.status));
const mail = await lastMailTo(u1Email);
record('reset email reached MailHog', !!mail);
const mailBody = qpDecode(mail?.Content?.Body ?? '');
const resetToken = /[?&]token=([0-9a-f]{64})/.exec(mailBody)?.[1];
record('reset email contains a 64-hex token link to /settings', !!resetToken && /\/settings\?token=/.test(mailBody));
const verifyOk = await call('GET', `/api/auth/verify-reset-token?token=${resetToken}`);
record('verify-reset-token returns the account email for a valid token', verifyOk.status === 200 && verifyOk.data?.email === u1Email, String(verifyOk.status));
const resetPw = `Reset!Pass#${run}Cc`;
const resetWeak = await call('POST', '/api/auth/set-password', { json: { resetToken, password: 'weak' } });
record('reset: weak password rejected, token stays valid', resetWeak.status === 400 && (await call('GET', `/api/auth/verify-reset-token?token=${resetToken}`)).status === 200, String(resetWeak.status));
const resetDo = await call('POST', '/api/auth/set-password', { json: { resetToken, password: resetPw } });
record('reset: strong password accepted with the token', resetDo.status === 200, String(resetDo.status));
const reuse = await call('POST', '/api/auth/set-password', { json: { resetToken, password: `Other!Pass#${run}Dd` } });
record('reset: token cannot be reused', reuse.status === 400, String(reuse.status));
record('reset: verify now says already used', (await call('GET', `/api/auth/verify-reset-token?token=${resetToken}`)).status === 400);
const afterReset = await login(u1Email, resetPw);
record('reset: user can log in with the new password', afterReset.session?.user?.email === u1Email);
const expiredTok = randomBytes(32).toString('hex');
psql(`INSERT INTO "PasswordReset"(id,email,token,"expiresAt") VALUES ('exp-${run}','${q(u1Email)}','${expiredTok}', now() - interval '1 hour')`);
const expRes = await call('POST', '/api/auth/set-password', { json: { resetToken: expiredTok, password: `Exp!Pass#${run}Ee` } });
record('reset: expired token is rejected', expRes.status === 400, String(expRes.status));
const resetUnknown = await call('POST', '/api/admin/send-password-reset', { jar: admin.jar, json: { email: `nobody-${run}@example.test`, csrfToken: adminCsrf } });
record('reset for an unknown address returns the same ok (no enumeration)', resetUnknown.status === 200 && resetUnknown.data?.ok === true, String(resetUnknown.status));

// ------------------------------------------------------------------ admin routes
section('admin');
const users = await call('GET', '/api/admin/users', { jar: admin.jar });
record('admin/users lists accounts with only id/email/isAdmin', users.status === 200 && users.data.users.every((u) => Object.keys(u).sort().join() === 'email,id,isAdmin'));
const promote = await call('POST', '/api/admin/toggle-admin', { jar: admin.jar, json: { email: u1Email, csrfToken: adminCsrf } });
record('toggle-admin promotes a member', promote.status === 200 && psql(`SELECT "isAdmin" FROM "User" WHERE id='${u1Id}'`) === 't', String(promote.status));
const demote = await call('POST', '/api/admin/toggle-admin', { jar: admin.jar, json: { email: u1Email, csrfToken: adminCsrf } });
record('toggle-admin demotes again', demote.status === 200 && psql(`SELECT "isAdmin" FROM "User" WHERE id='${u1Id}'`) === 'f', String(demote.status));
const selfDemote = await call('POST', '/api/admin/toggle-admin', { jar: admin.jar, json: { email: adminEmail, csrfToken: adminCsrf } });
record('toggle-admin: an admin cannot demote themselves', selfDemote.status === 400, String(selfDemote.status));
const toggleMissing = await call('POST', '/api/admin/toggle-admin', { jar: admin.jar, json: { email: `ghost-${run}@example.test`, csrfToken: adminCsrf } });
record('toggle-admin: unknown user is 404', toggleMissing.status === 404, String(toggleMissing.status));
const toggleNoEmail = await call('POST', '/api/admin/toggle-admin', { jar: admin.jar, json: { csrfToken: adminCsrf } });
record('toggle-admin: missing email is 400', toggleNoEmail.status === 400, String(toggleNoEmail.status));

const inviteBad = await call('POST', '/api/invite', { jar: admin.jar, json: { email: 12345, csrfToken: adminCsrf } });
record('invite: non-string email is 400', inviteBad.status === 400, String(inviteBad.status));
const inviteMail = await call('POST', '/api/invite', { jar: admin.jar, json: { email: `crlf@example.test\r\nBcc: attacker@example.test`, csrfToken: adminCsrf } });
record('invite: CRLF header-injection attempt in the address is not sent as a 2xx', inviteMail.status >= 400, String(inviteMail.status));

const eloSet = psql(`UPDATE "Song" SET elo=1730 WHERE id=${s4}; SELECT 1`);
const resetElo = await call('POST', '/api/admin/reset-elo', { jar: admin.jar, json: { csrfToken: adminCsrf } });
record('reset-elo sets every song back to 1500', resetElo.status === 200 && psql(`SELECT count(*) FROM "Song" WHERE elo<>1500`) === '0', String(resetElo.status));

const delSongAdmin = await call('DELETE', '/api/songs/delete', { jar: admin.jar, json: { songId: s8(), csrfToken: adminCsrf } });
function s8() { return songIds[7]; }
record('delete-song: a non-root admin is refused', delSongAdmin.status === 401, String(delSongAdmin.status));
const delSongRoot = await call('DELETE', '/api/songs/delete', { jar: root.jar, json: { songId: s8(), csrfToken: rootCsrf } });
record('delete-song: root account can delete', delSongRoot.status === 200 && psql(`SELECT count(*) FROM "Song" WHERE id=${s8()}`) === '0', String(delSongRoot.status));
const delSongNoId = await call('DELETE', '/api/songs/delete', { jar: root.jar, json: { csrfToken: rootCsrf } });
record('delete-song: missing id is 400', delSongNoId.status === 400, String(delSongNoId.status));

const delSelf = await call('POST', '/api/admin/delete-user', { jar: admin.jar, json: { email: adminEmail, csrfToken: adminCsrf } });
record('delete-user: an admin cannot delete their own account', delSelf.status === 400, String(delSelf.status));
const delMissing = await call('POST', '/api/admin/delete-user', { jar: admin.jar, json: { email: `ghost-${run}@example.test`, csrfToken: adminCsrf } });
record('delete-user: unknown user is 404', delMissing.status === 404, String(delMissing.status));
const delNoEmail = await call('POST', '/api/admin/delete-user', { jar: admin.jar, json: { csrfToken: adminCsrf } });
record('delete-user: missing email is 400', delNoEmail.status === 400, String(delNoEmail.status));
const u2SessionBefore = await call('GET', '/api/songs', { jar: newLogin.jar });
const delUser = await call('POST', '/api/admin/delete-user', { jar: admin.jar, json: { email: u2Email, csrfToken: adminCsrf } });
record('delete-user: deletes the account and cascades its data', delUser.status === 200 && psql(`SELECT (SELECT count(*) FROM "User" WHERE id='${u2Id}')+(SELECT count(*) FROM "SongReadiness" WHERE "userId"='${u2Id}')`) === '0', String(delUser.status));
record('deleted user cannot log in again', !(await login(u2Email, newPw)).session?.user);
const u2SessionAfter = await call('GET', '/api/songs', { jar: newLogin.jar });
info('KNOWN RISK R2: deleted user\'s existing session still works until the JWT expires', `before=${u2SessionBefore.status} after=${u2SessionAfter.status}`);

// ------------------------------------------------------------------ sign-out
section('sign-out');
const out = new Jar();
const lg = await login(adminEmail, pw);
const csrfTok = (await call('GET', '/api/auth/csrf', { jar: lg.jar })).data.csrfToken;
await call('POST', '/api/auth/signout', { jar: lg.jar, raw: new URLSearchParams({ csrfToken: csrfTok, json: 'true' }).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
const afterOut = await call('GET', '/api/auth/session', { jar: lg.jar });
record('sign-out clears the session', !afterOut.data?.user);
const protectedAfterOut = await call('GET', '/api/songs', { jar: lg.jar });
record('protected routes redirect after sign-out', protectedAfterOut.status === 307, String(protectedAfterOut.status));

const failed = results.filter((r) => !r.ok);
console.log(`\n== ${results.length - failed.length}/${results.length} checks passed ==`);
process.exit(failed.length ? 1 : 0);
