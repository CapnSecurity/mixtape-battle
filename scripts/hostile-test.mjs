// Hostile-input test: fuzzes every mutating route and forges session tokens.
//
// Usage: FUNCTIONAL_NEXTAUTH_SECRET=<secret of the target> \
//        node scripts/hostile-test.mjs http://localhost:PORT --db mixtape_validation_<name>
//
// Localhost-only and throwaway-database-only (same guards as the smoke test). The target must run with
// ALLOW_PUBLIC_SIGNUP unset. `songs/add` is intentionally not fuzzed: valid-looking payloads make the app
// query third-party metadata APIs.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const base = (args[0] || '').replace(/\/$/, '');
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const db = opt('db');
const container = opt('container', 'mixtape-dev-postgres');
const psqlUrl = process.env.SMOKE_PSQL_URL;
const secret = process.env.FUNCTIONAL_NEXTAUTH_SECRET;
const cookieName = opt('cookie-name', '__Secure-next-auth.session-token');

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
  const [cmd, argv] = psqlUrl ? ['psql', [psqlUrl, '-tAc', sql]] : ['docker', ['exec', container, 'psql', '-U', 'postgres', '-d', db, '-tAc', sql]];
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
  if (!h['x-forwarded-for']) h['x-forwarded-for'] = `198.51.${Math.floor(client / 250) % 250}.${(client++ % 250) + 1}`;
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
  return { jar, session: (await call('GET', '/api/auth/session', { jar })).data };
}
const csrfOf = async (s) => (await call('GET', '/api/csrf', { jar: s.jar })).data.csrfToken;

const run = randomBytes(4).toString('hex');
const pw = `Hostile!Test#${run}Zz`;
const adminEmail = `host-admin-${run}@example.test`;
const memberEmail = `host-member-${run}@example.test`;
console.log(`\n== Hostile-input test against ${base} (run ${run}) ==`);

// ------------------------------------------------------------------ setup
const { hashSync } = require('bcryptjs');
psql(`INSERT INTO "User"(id,email,password,"isAdmin") VALUES ('host-admin-${run}','${q(adminEmail)}','${hashSync(pw, 10)}',true)`);
psql(`INSERT INTO "Song"(title,artist,genre,decade,"updatedAt") VALUES ('Hostile Song A','Artist','Rock',1990,now()),('Hostile Song B','Artist','Rock',1990,now())`);
const [sA, sB] = psql(`SELECT id FROM "Song" ORDER BY id DESC LIMIT 2`).split('\n').map(Number).reverse();
const admin = await login(adminEmail, pw);
const adminCsrf = await csrfOf(admin);
await call('POST', '/api/invite', { jar: admin.jar, json: { email: memberEmail, csrfToken: adminCsrf } });
const tok = psql(`SELECT token FROM "Invite" WHERE email='${q(memberEmail)}'`);
await call('POST', '/api/invite/accept', { json: { token: tok, password: pw } });
const member = await login(memberEmail, pw);
const memberCsrf = await csrfOf(member);
const memberId = member.session.user.id;
await call('POST', '/api/practice', { jar: member.jar, json: { songId: sA, csrfToken: memberCsrf } });
const practiceId = psql(`SELECT id FROM "PracticeListItem" WHERE "userId"='${memberId}' LIMIT 1`);
await call('POST', '/api/setlist/add', { jar: admin.jar, json: { songId: sA, csrfToken: adminCsrf } });
const entryId = psql(`SELECT id FROM "SetlistEntry" LIMIT 1`);
const countsBefore = psql(`SELECT (SELECT count(*) FROM "User")||','||(SELECT count(*) FROM "Song")`);
record('setup: admin, member, songs, practice item and setlist entry ready', !!practiceId && !!entryId && admin.session?.user && member.session?.user);

// ------------------------------------------------------------------ fuzz tables
const endpoints = [
  { m: 'POST', p: '/api/practice', who: 'member', body: { songId: sB, priority: 3, notes: 'n' } },
  { m: 'PATCH', p: `/api/practice/${practiceId}`, who: 'member', body: { status: 'LEARNING', priority: 3, notes: 'n' } },
  { m: 'POST', p: `/api/songs/${sA}/readiness`, who: 'member', body: { status: 'SOLID' } },
  { m: 'POST', p: `/api/songs/${sA}/comments`, who: 'member', body: { content: 'hello' } },
  { m: 'POST', p: `/api/songs/${sA}/practice`, who: 'admin', body: { markPracticed: true, keyNotes: 'k', tuningNotes: 't' } },
  { m: 'PATCH', p: `/api/songs/${sA}/edit`, who: 'admin', body: { title: 'T', artist: 'A', album: 'Al', releaseDate: 1999, genre: 'Rock' } },
  { m: 'POST', p: '/api/songs/update-links', who: 'admin', body: { songId: sA, youtubeUrl: 'https://y.example', songsterrUrl: '', ultimateGuitarUrl: '', lyricsUrl: '' } },
  { m: 'POST', p: '/api/setlist/add', who: 'admin', body: { songId: sB, notes: 'n' } },
  { m: 'POST', p: '/api/setlist/reorder', who: 'admin', body: { order: [{ songId: sA, position: 1 }] } },
  { m: 'PATCH', p: `/api/setlist/${entryId}`, who: 'admin', body: { notes: 'n' } },
  { m: 'POST', p: '/api/auth/update-username', who: 'member', body: { username: 'abc' } },
  { m: 'POST', p: '/api/auth/set-password', who: 'none', body: { resetToken: 'x'.repeat(64), password: 'Aa1!aaaaaa' }, noCsrf: true },
  { m: 'POST', p: '/api/invite', who: 'admin', body: { email: 'fuzz@example.test' } },
  { m: 'POST', p: '/api/invite/accept', who: 'none', body: { token: 'x'.repeat(64), password: 'Aa1!aaaaaa' }, noCsrf: true },
  { m: 'POST', p: '/api/auth/signup', who: 'none', body: { email: 'a@example.test', password: 'Aa1!aaaaaa' }, noCsrf: true },
  { m: 'POST', p: '/api/admin/toggle-admin', who: 'admin', body: { email: adminEmail }, destructive: true },
  { m: 'POST', p: '/api/admin/delete-user', who: 'admin', body: { email: adminEmail }, destructive: true },
  { m: 'POST', p: '/api/admin/send-password-reset', who: 'admin', body: { email: 'nobody@example.test' } },
  { m: 'POST', p: '/api/csp-report', who: 'none', body: { 'csp-report': { 'blocked-uri': 'x' } }, noCsrf: true },
];
const big = 'x'.repeat(100_000);
const values = [null, 0, -1, 9007199254740993, 1.5, true, '', big, {}, [], { $gt: '' }, [[[]]], "' OR 1=1 --", '"; DROP TABLE "User"; --', '<script>alert(1)</script>', '../../../etc/passwd', 'a\u0000b', '%00%0d%0a', 'a\r\nBcc: x@example.test', '😀'.repeat(50), '${7*7}', '{{7*7}}', 'javascript:alert(1)'];

const leakRe = /(\sat\s+\S+\s+\(|node_modules|\/app\/|PrismaClient|Invalid `prisma|P20\d\d|ECONN|stack|SELECT .* FROM|syntax error at or near)/i;
const fivexx = []; const leaks = []; let sent = 0;
function judge(label, r) {
  sent++;
  if (r.status >= 500) fivexx.push(`${r.status} ${label}`);
  const body = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
  if (leakRe.test(body ?? '')) leaks.push(`${label} :: ${String(body).slice(0, 80)}`);
}
// Group 5xx findings by route (and field) so a systemic cause is obvious.
function summarize(list) {
  const groups = new Map();
  for (const l of list) {
    const key = l.replace(/\}=.*$/, '}').replace(/ <.*$/, ' <malformed body>');
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${String(n).padStart(3)} x ${k}`);
}
const ctx = (who) => ({ member: { jar: member.jar, csrf: memberCsrf }, admin: { jar: admin.jar, csrf: adminCsrf }, none: { jar: undefined, csrf: undefined } })[who];

section('malformed bodies and structural mutations');
for (const e of endpoints) {
  const c = ctx(e.who);
  const hdrs = c.csrf && !e.noCsrf ? { 'x-csrf-token': c.csrf } : {};
  const shapes = [['truncated JSON', '{"a":'], ['empty body', ''], ['null', 'null'], ['array', '[]'], ['string', '"x"'], ['number', '1'], ['bad content-type', '{"a":1}', { 'content-type': 'text/plain' }], ['big nested', JSON.stringify({ a: JSON.parse('['.repeat(2000) + ']'.repeat(2000)) })]];
  for (const [name, raw, extra] of shapes) {
    const r = await call(e.m, e.p, { jar: c.jar, raw, headers: { ...hdrs, ...(extra ?? {}) } });
    judge(`${e.m} ${e.p} <${name}>`, r);
  }
}
record(`structural mutations: no 5xx and no leaked internals (${sent} requests)`, fivexx.length === 0 && leaks.length === 0, `5xx=${fivexx.length} leaks=${leaks.length}`);
for (const f of summarize(fivexx)) info('5xx', f);
for (const l of leaks.slice(0, 6)) info('LEAK', l);

section('field-level mutations (one field at a time, valid CSRF)');
const fiveBefore = fivexx.length; const leaksBefore = leaks.length; const sentBefore = sent;
for (const e of endpoints) {
  const c = ctx(e.who);
  for (const field of Object.keys(e.body)) {
    for (const v of values) {
      const body = { ...e.body, [field]: v };
      if (c.csrf && !e.noCsrf) body.csrfToken = c.csrf;
      const r = await call(e.m, e.p, { jar: c.jar, json: body });
      judge(`${e.m} ${e.p} {${field}}=${typeof v === 'string' ? JSON.stringify(v.slice(0, 18)) : JSON.stringify(v)?.slice(0, 18)}`, r);
    }
  }
}
record(`field mutations: no 5xx and no leaked internals (${sent - sentBefore} requests)`, fivexx.length === fiveBefore && leaks.length === leaksBefore, `5xx=${fivexx.length - fiveBefore} leaks=${leaks.length - leaksBefore}`);
for (const f of summarize(fivexx.slice(fiveBefore))) info('5xx', f);
for (const l of leaks.slice(leaksBefore, leaksBefore + 6)) info('LEAK', l);

section('path and query parameter abuse');
const pathCases = [
  ['GET', '/api/songs/abc/comments'], ['GET', '/api/songs/99999999999999999999/comments'], ['GET', '/api/songs/-1/comments'], ['GET', '/api/songs/1e3/comments'],
  ['GET', '/api/songs/%00/comments'], ['GET', '/api/songs/..%2f..%2fetc%2fpasswd/comments'], ['GET', '/api/songs/%27%20OR%201=1--/readiness'],
  ['GET', `/api/invite/validate?token=${encodeURIComponent("' OR 1=1 --")}`], ['GET', `/api/invite/validate?token=${'a'.repeat(5000)}`],
  ['GET', '/api/auth/verify-reset-token?token[]=a&token[]=b'], ['GET', `/api/auth/verify-reset-token?token=${encodeURIComponent('%00')}`],
  ['DELETE', '/api/practice/%00'], ['DELETE', "/api/practice/' OR 1=1"], ['PATCH', '/api/setlist/NaN'], ['PATCH', '/api/songs/NaN/edit'],
  ['POST', '/api/songs/NaN/readiness'], ['POST', '/api/songs/9007199254740993/readiness'],
];
const pb = fivexx.length; const lb = leaks.length;
for (const [m, p] of pathCases) {
  const c = p.includes('/readiness') || p.includes('/comments') || p.includes('/practice') ? { jar: member.jar, csrf: memberCsrf } : { jar: admin.jar, csrf: adminCsrf };
  const r = await call(m, p, { jar: c.jar, json: m === 'GET' ? undefined : { csrfToken: c.csrf, status: 'SOLID', notes: 'x', title: 'a', artist: 'b' } });
  judge(`${m} ${p.slice(0, 60)}`, r);
}
record(`path/query abuse: no 5xx and no leaked internals (${pathCases.length} requests)`, fivexx.length === pb && leaks.length === lb, `5xx=${fivexx.length - pb} leaks=${leaks.length - lb}`);
for (const f of fivexx.slice(pb)) info('5xx', f.slice(0, 90));

section('oversized payloads');
const huge = 'x'.repeat(3 * 1024 * 1024);
const hugeComment = await call('POST', `/api/songs/${sA}/comments`, { jar: member.jar, json: { content: huge, csrfToken: memberCsrf } });
record('3 MB comment is rejected without a 5xx', hugeComment.status >= 400 && hugeComment.status < 500, String(hugeComment.status));
const hugeCsp = await call('POST', '/api/csp-report', { raw: huge });
record('3 MB CSP report is rejected with 413', hugeCsp.status === 413, String(hugeCsp.status));
const alive = await call('GET', '/login');
record('server is still healthy after all hostile input', alive.status === 200, String(alive.status));
record('database integrity: user/song counts unchanged by fuzzing (except the one destructive-safe path)', psql(`SELECT (SELECT count(*) FROM "User")||','||(SELECT count(*) FROM "Song")`) === countsBefore, `${psql(`SELECT (SELECT count(*) FROM "User")||','||(SELECT count(*) FROM "Song")`)} vs ${countsBefore}`);
record('no HTML/script or javascript: strings were stored in link columns', psql(`SELECT count(*) FROM "Song" WHERE youtube ~* '^(javascript|data):' OR lyrics ~* '^(javascript|data):' OR songsterr ~* '^(javascript|data):' OR "ultimateGuitar" ~* '^(javascript|data):'`) === '0');
record('admin account still intact and admin', psql(`SELECT "isAdmin" FROM "User" WHERE email='${q(adminEmail)}'`) === 't');

// ------------------------------------------------------------------ forged / tampered sessions
section('forged, expired and tampered session tokens');
const protectedProbes = [['GET', '/api/songs'], ['GET', '/api/admin/users'], ['GET', '/dashboard'], ['GET', '/admin']];
const rejected = (r) => r.status === 307 || r.status === 401 || r.status === 403;
async function probe(label, cookieValue, expectAccess = false) {
  const outcome = [];
  for (const [m, p] of protectedProbes) outcome.push((await call(m, p, { cookie: `${cookieName}=${cookieValue}` })).status);
  const ok = expectAccess ? outcome.every((s) => s === 200) : outcome.every((s) => s === 307 || s === 401 || s === 403);
  record(label, ok, outcome.join(','));
}
const realCookie = member.jar.cookies.get(cookieName) ?? '';
record('captured the member session cookie for tampering', realCookie.length > 100, `${realCookie.length} chars`);
const flip = (s) => s.slice(0, -3) + (s.slice(-3) === 'AAA' ? 'BBB' : 'AAA');
await probe('tampered session cookie (last bytes changed) is rejected', flip(realCookie));
await probe('truncated session cookie is rejected', realCookie.slice(0, realCookie.length / 2));
await probe('garbage session cookie is rejected', 'not-a-jwt');
await probe('empty session cookie is rejected', '');
await probe('JWT-looking unsigned token (alg none) is rejected', `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ id: 'x', email: adminEmail, isAdmin: true, exp: 9999999999 })).toString('base64url')}.`);
if (secret) {
  const { encode } = require('next-auth/jwt');
  const adminClaims = { id: `host-admin-${run}`, email: adminEmail, isAdmin: true, sub: `host-admin-${run}` };
  const wrong = await encode({ token: adminClaims, secret: 'a-different-secret-value-of-sufficient-length-12345' });
  await probe('admin token signed with the WRONG secret is rejected', wrong);
  const expired = await encode({ token: { ...adminClaims, iat: Math.floor(Date.now() / 1000) - 7200, exp: Math.floor(Date.now() / 1000) - 3600 }, secret, maxAge: -3600 });
  await probe('admin token signed with the right secret but EXPIRED is rejected', expired);
  const good = await encode({ token: { ...adminClaims, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }, secret });
  const asAdmin = await call('GET', '/api/admin/users', { cookie: `${cookieName}=${good}` });
  info('SECRET COMPROMISE (rotate NEXTAUTH_SECRET if it was ever exposed): a token minted with the real secret is accepted as admin', `GET /api/admin/users -> ${asAdmin.status}`);
  record('a token minted with the real secret is accepted (proves the secret is the root of trust)', asAdmin.status === 200, String(asAdmin.status));
} else {
  info('forged-token tests with the real secret skipped', 'set FUNCTIONAL_NEXTAUTH_SECRET');
}

const failed = results.filter((r) => !r.ok);
console.log(`\n== ${results.length - failed.length}/${results.length} checks passed; ${sent} hostile requests sent ==`);
process.exit(failed.length ? 1 : 0);
