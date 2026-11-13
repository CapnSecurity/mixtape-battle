// Black-box smoke test for authentication, authorization and security headers.
//
// Usage: node scripts/smoke-test.mjs <baseUrl> --db mixtape_validation_<name> [--public-signup] [--hops N]
//   --public-signup  target runs with ALLOW_PUBLIC_SIGNUP=true (default expects it closed)
//   --hops N         target runs with TRUSTED_PROXY_HOPS=N (default 1)
//   --container X    Postgres container used for the throwaway-DB helpers (default mixtape-dev-postgres)
//
// Creates throwaway users through the public API. The optional --db helper promotes one
// user to admin and seeds one song via `docker exec psql`; it refuses any database whose
// name does not start with "mixtape_validation_" so it can never touch real data.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const args = process.argv.slice(2);
const base = (args[0] || '').replace(/\/$/, '');
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const db = opt('db');
const container = opt('container', 'mixtape-dev-postgres');
const mailhog = opt('mailhog', 'http://localhost:8025');

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
  console.error('Refusing to run: base URL must be http://localhost[:port] or 127.0.0.1.');
  process.exit(2);
}
if (db && !db.startsWith('mixtape_validation_')) {
  console.error('Refusing to run: --db must start with "mixtape_validation_".');
  process.exit(2);
}

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};
const info = (name, detail) => console.log(`INFO  ${name}  [${detail}]`);

function psql(sql) {
  if (!db) throw new Error('--db is required for this step');
  return execFileSync('docker', ['exec', container, 'psql', '-U', 'postgres', '-d', db, '-tAc', sql], {
    encoding: 'utf8',
  }).trim();
}

class Jar {
  cookies = new Map();
  absorb(res) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(';');
      const eq = pair.indexOf('=');
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === '' || /max-age=0/i.test(line)) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
  header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

// Each request simulates a distinct client unless a test pins one, so setup traffic does not
// exhaust the per-IP auth rate limit that the dedicated rate-limit check exercises.
let simulatedClient = 1;
async function call(method, path, { jar, json, form, headers = {} } = {}) {
  const h = { ...headers };
  if (!h['x-forwarded-for']) h['x-forwarded-for'] = `198.51.100.${(simulatedClient++ % 250) + 1}`;
  if (jar?.cookies.size) h.cookie = jar.header();
  let body;
  if (json !== undefined) {
    h['content-type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    h['content-type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(form).toString();
  }
  const res = await fetch(base + path, { method, headers: h, body, redirect: 'manual' });
  jar?.absorb(res);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, headers: res.headers, data };
}

async function login(email, password, headers = {}) {
  const jar = new Jar();
  const csrf = await call('GET', '/api/auth/csrf', { jar });
  const res = await call('POST', '/api/auth/callback/credentials', {
    jar,
    headers,
    form: { csrfToken: csrf.data.csrfToken, email, password, json: 'true' },
  });
  const session = await call('GET', '/api/auth/session', { jar });
  return { jar, res, session: session.data };
}

const run = randomBytes(4).toString('hex');
const password = `Sm0ke!Test#${run}Zz`;
const adminEmail = `smoke-admin-${run}@example.test`;
const userEmail = `smoke-user-${run}@example.test`;
const otherEmail = `smoke-other-${run}@example.test`;
const inviteeEmail = `smoke-invitee-${run}@example.test`;
const concurrentEmail = `smoke-concurrent-${run}@example.test`;
const expiredEmail = `smoke-expired-${run}@example.test`;
const hops = Number(opt('hops', '1'));

console.log(`\n== Smoke test against ${base} (run ${run}) ==\n`);

// ---- Public pages and headers ----
const home = await call('GET', '/');
record('GET / returns 200', home.status === 200, String(home.status));
const hdr = (r, name) => r.headers.get(name) ?? '';
const hsts = hdr(home, 'strict-transport-security');
record('HSTS present, conservative (no includeSubDomains/preload)', /max-age=\d+/.test(hsts) && !/includesubdomains|preload/i.test(hsts), hsts);
record('X-Content-Type-Options is nosniff', hdr(home, 'x-content-type-options') === 'nosniff');
record('X-Frame-Options is DENY', hdr(home, 'x-frame-options') === 'DENY');
record('Referrer-Policy is set', /strict-origin-when-cross-origin/.test(hdr(home, 'referrer-policy')));
record('Permissions-Policy denies camera/microphone/geolocation', /camera=\(\)/.test(hdr(home, 'permissions-policy')) && /microphone=\(\)/.test(hdr(home, 'permissions-policy')) && /geolocation=\(\)/.test(hdr(home, 'permissions-policy')));
const cspRo = hdr(home, 'content-security-policy-report-only');
record('CSP is Report-Only with frame-ancestors none and no wildcard sources', /frame-ancestors 'none'/.test(cspRo) && !/\s\*[\s;]/.test(' ' + cspRo + ' '), cspRo.slice(0, 40));
record('CSP is not enforced yet (no enforcing header)', hdr(home, 'content-security-policy') === '');
record('CSP does not allow unsafe-eval in production', !/unsafe-eval/.test(cspRo));
record('x-powered-by header is not disclosed', hdr(home, 'x-powered-by') === '');
info('public page cache-control', hdr(home, 'cache-control') || '(absent)');
const loginPage = await call('GET', '/login');
record('GET /login returns 200', loginPage.status === 200, String(loginPage.status));

// ---- Unauthenticated access is blocked server-side ----
for (const [m, p] of [
  ['GET', '/api/songs'],
  ['GET', '/api/practice'],
  ['GET', '/api/admin/users'],
  ['GET', '/admin'],
  ['GET', '/woodshed'],
]) {
  const r = await call(m, p);
  record(`unauthenticated ${m} ${p} is redirected to login`, r.status === 307 && (r.headers.get('location') || '').includes('/login'), String(r.status));
}
const health = await call('GET', '/api/health');
info('GET /api/health unauthenticated', String(health.status));

// ---- Account creation and login ----
// Default (ALLOW_PUBLIC_SIGNUP unset): signup must be refused and accounts come from invites.
// With --public-signup the target is expected to have ALLOW_PUBLIC_SIGNUP=true.
const publicSignup = args.includes('--public-signup');
const probeEmail = `smoke-probe-${run}@example.test`;
const probe = await call('POST', '/api/auth/signup', { json: { email: probeEmail, password } });
let admin;
let adminCsrf;
if (publicSignup) {
  record('public signup works when ALLOW_PUBLIC_SIGNUP=true', probe.status === 200, String(probe.status));
  for (const email of [adminEmail, userEmail, otherEmail]) {
    await call('POST', '/api/auth/signup', { json: { email, password } });
  }
  if (db) psql(`UPDATE "User" SET "isAdmin"=true WHERE email='${adminEmail}'`);
} else {
  record('public signup is rejected by default', probe.status === 403, String(probe.status));
  if (db) {
    record('rejected signup created no user', psql(`SELECT count(*) FROM "User" WHERE email='${probeEmail}'`) === '0');
    // Bootstrap an admin directly in the throwaway database (the first user cannot be invited).
    const { createRequire } = await import('node:module');
    const bcrypt = createRequire(import.meta.url)('bcryptjs');
    const hash = bcrypt.hashSync(password, 10);
    psql(`INSERT INTO "User"(id, email, password, "isAdmin") VALUES ('smoke-${run}', '${adminEmail}', '${hash}', true)`);
  }
}
if (db) psql(`INSERT INTO "Song"(title, artist, "updatedAt") VALUES ('Smoke Song', 'Smoke Artist', now())`);
const songId = db ? Number(psql(`SELECT id FROM "Song" ORDER BY id DESC LIMIT 1`)) : 1;

admin = await login(adminEmail, password);
adminCsrf = (await call('GET', '/api/csrf', { jar: admin.jar })).data.csrfToken;

if (db) {
  // Invite flow (must work in both signup modes): admin invites -> token redeemed once ->
  // password policy enforced. In closed mode this is also how the test users are created.
  const toInvite = publicSignup ? [inviteeEmail] : [userEmail, otherEmail, inviteeEmail];
  for (const email of toInvite) {
    const inv = await call('POST', '/api/invite', { jar: admin.jar, json: { email, csrfToken: adminCsrf } });
    record(`admin can invite ${email.split('@')[0]}`, inv.status === 200, String(inv.status));
  }
  const tokenFor = (email) => psql(`SELECT token FROM "Invite" WHERE email='${email}' ORDER BY "createdAt" DESC LIMIT 1`);
  const weak = await call('POST', '/api/invite/accept', { json: { token: tokenFor(inviteeEmail), password: 'weak' } });
  record('invite acceptance enforces password policy', weak.status === 400, String(weak.status));
  const bogus = await call('POST', '/api/invite/accept', { json: { token: 'not-a-real-token', password } });
  record('invalid invite token is rejected', bogus.status === 400, String(bogus.status));
  for (const email of toInvite) {
    const t = tokenFor(email);
    const ok = await call('POST', '/api/invite/accept', { json: { token: t, password } });
    record(`valid invite creates account for ${email.split('@')[0]}`, ok.status === 200, String(ok.status));
    const again = await call('POST', '/api/invite/accept', { json: { token: t, password } });
    record('invite token cannot be redeemed twice', again.status === 400, String(again.status));
  }
  const invitee = await login(inviteeEmail, password);
  record('invited user can authenticate', invitee.session?.user?.email === inviteeEmail, invitee.session?.user?.email ?? 'none');

  // Expired invite: create through the API, then age it in the throwaway database.
  await call('POST', '/api/invite', { jar: admin.jar, json: { email: expiredEmail, csrfToken: adminCsrf } });
  psql(`UPDATE "Invite" SET "expiresAt"=now() - interval '1 hour' WHERE email='${expiredEmail}'`);
  const expired = await call('POST', '/api/invite/accept', { json: { token: tokenFor(expiredEmail), password } });
  record('expired invite is rejected', expired.status === 400, String(expired.status));
  record('expired invite created no user', psql(`SELECT count(*) FROM "User" WHERE email='${expiredEmail}'`) === '0');
  const validateExpired = await call('GET', `/api/invite/validate?token=${tokenFor(expiredEmail)}`);
  record('expired invite fails validation endpoint', validateExpired.data?.ok === false);

  // Concurrent redemption of one token must create exactly one account and succeed exactly once.
  await call('POST', '/api/invite', { jar: admin.jar, json: { email: concurrentEmail, csrfToken: adminCsrf } });
  const ct = tokenFor(concurrentEmail);
  const burst = await Promise.all(
    Array.from({ length: 8 }, () => call('POST', '/api/invite/accept', { json: { token: ct, password } }))
  );
  const wins = burst.filter((r) => r.status === 200).length;
  record('concurrent invite redemption succeeds exactly once', wins === 1, burst.map((r) => r.status).join(','));
  record('concurrent redemption created exactly one account', psql(`SELECT count(*) FROM "User" WHERE email='${concurrentEmail}'`) === '1');
}

const bad = await login(userEmail, 'definitely-wrong');
record('wrong password does not create a session', !bad.session?.user, JSON.stringify(bad.session));

const user = await login(userEmail, password);
record('admin login creates session', admin.session?.user?.email === adminEmail, admin.session?.user?.email ?? 'none');
record('user login creates session', user.session?.user?.email === userEmail, user.session?.user?.email ?? 'none');
record('session reflects isAdmin only for promoted account', admin.session?.user?.isAdmin === true && !user.session?.user?.isAdmin);
info('session cookie names', [...user.jar.cookies.keys()].join(', '));

// ---- CSRF tokens ----
const anonCsrf = await call('GET', '/api/csrf');
record('GET /api/csrf requires a session', anonCsrf.status !== 200, String(anonCsrf.status));
const csrf = async (s) => (await call('GET', '/api/csrf', { jar: s.jar })).data.csrfToken;
const userCsrf = await csrf(user);
record('authenticated user receives CSRF token', typeof userCsrf === 'string' && userCsrf.split('.').length === 3);

// ---- Authenticated reads ----
const songs = await call('GET', '/api/songs', { jar: user.jar });
record('authenticated GET /api/songs returns data', songs.status === 200 && Array.isArray(songs.data), String(songs.status));

// ---- Caching: authenticated and sensitive responses must never be shareable ----
const noStore = (r) => /no-store/.test(r.headers.get('cache-control') || '') && /private/.test(r.headers.get('cache-control') || '');
record('GET /api/songs is private, no-store', noStore(songs), songs.headers.get('cache-control') ?? '(none)');
const csrfRes = await call('GET', '/api/csrf', { jar: user.jar });
record('GET /api/csrf is private, no-store', noStore(csrfRes), csrfRes.headers.get('cache-control') ?? '(none)');
const sessionRes = await call('GET', '/api/auth/session', { jar: user.jar });
record('GET /api/auth/session is not publicly cacheable', /no-store|private|no-cache/.test(sessionRes.headers.get('cache-control') || ''), sessionRes.headers.get('cache-control') ?? '(none)');
for (const p of ['/dashboard', '/admin', '/settings', '/woodshed', '/songs/1', '/results']) {
  const r = await call('GET', p, { jar: user.jar });
  record(`authenticated page ${p} is private, no-store`, r.status === 200 && noStore(r), `${r.status} ${r.headers.get('cache-control') ?? '(none)'}`);
}
const unauthRedirect = await call('GET', '/dashboard');
record('unauthenticated redirect is not publicly cacheable', noStore(unauthRedirect), unauthRedirect.headers.get('cache-control') ?? '(none)');
const adminUsersAsUser = await call('GET', '/api/admin/users', { jar: user.jar });
record('non-admin GET /api/admin/users is rejected', adminUsersAsUser.status === 401 || adminUsersAsUser.status === 403, String(adminUsersAsUser.status));
const adminUsersAsAdmin = await call('GET', '/api/admin/users', { jar: admin.jar });
record('admin GET /api/admin/users succeeds', adminUsersAsAdmin.status === 200, String(adminUsersAsAdmin.status));
const leaked = JSON.stringify(adminUsersAsAdmin.data);
record('admin user list does not expose password hashes', !/\$2[aby]\$/.test(leaked) && !/"password"/.test(leaked));

// ---- Non-admin cannot reach privileged mutations (even with a valid CSRF token) ----
const privileged = [
  ['POST', '/api/admin/toggle-admin', { email: userEmail }],
  ['POST', '/api/admin/delete-user', { email: otherEmail }],
  ['POST', '/api/admin/reset-elo', {}],
  ['POST', '/api/admin/send-password-reset', { email: otherEmail }],
  ['POST', '/api/invite', { email: 'x@example.test' }],
  ['POST', '/api/setlist/add', { songId }],
  ['POST', '/api/songs/update-links', { songId, youtubeUrl: 'https://example.test' }],
  ['PATCH', `/api/songs/${songId}/edit`, { title: 'hacked', artist: 'hacked' }],
  ['DELETE', '/api/songs/delete', { songId }],
];
for (const [m, p, b] of privileged) {
  const r = await call(m, p, { jar: user.jar, json: { ...b, csrfToken: userCsrf } });
  record(`non-admin ${m} ${p} is rejected`, r.status === 401 || r.status === 403, String(r.status));
}
const songAfter = db ? psql(`SELECT title FROM "Song" WHERE id=${songId}`) : 'Smoke Song';
record('privileged attempts did not modify data', songAfter === 'Smoke Song', songAfter);

// ---- Admin mutations require a CSRF token ----
const noCsrf = await call('POST', '/api/admin/reset-elo', { jar: admin.jar, json: {} });
record('admin mutation without CSRF token is rejected', noCsrf.status === 403, String(noCsrf.status));
const forged = await call('POST', '/api/admin/reset-elo', { jar: admin.jar, json: { csrfToken: 'a.b.c' } });
record('admin mutation with forged CSRF token is rejected', forged.status === 403, String(forged.status));
const okAdmin = await call('POST', '/api/admin/reset-elo', { jar: admin.jar, json: { csrfToken: adminCsrf } });
record('admin mutation with valid CSRF token succeeds', okAdmin.status === 200, String(okAdmin.status));

// ---- Object-level authorization (IDOR) on practice items ----
const created = await call('POST', '/api/practice', { jar: user.jar, json: { songId, csrfToken: userCsrf } });
const itemId = created.data?.id ?? created.data?.item?.id;
record('user can create own practice item', created.status === 200 || created.status === 201, `${created.status} id=${itemId}`);
if (itemId) {
  const other = await login(otherEmail, password);
  const otherCsrf = await csrf(other);
  const patch = await call('PATCH', `/api/practice/${itemId}`, { jar: other.jar, json: { status: 'MASTERED', csrfToken: otherCsrf } });
  const del = await call('DELETE', `/api/practice/${itemId}`, { jar: other.jar, json: { csrfToken: otherCsrf } });
  record("another user cannot modify someone else's practice item", patch.status === 403 || patch.status === 404, String(patch.status));
  record("another user cannot delete someone else's practice item", del.status === 403 || del.status === 404, String(del.status));
  const own = await call('GET', '/api/practice', { jar: other.jar });
  record("another user's practice list excludes the item", !JSON.stringify(own.data).includes(itemId), String(own.status));
}

// ---- Comments: CSRF, stored XSS handling and ownership ----
const payload = '<img src=x onerror=alert(1)>';
const noCsrfComment = await call('POST', `/api/songs/${songId}/comments`, { jar: user.jar, json: { content: 'no token' } });
record('comment POST without CSRF token is rejected', noCsrfComment.status === 403, String(noCsrfComment.status));
const forgedComment = await call('POST', `/api/songs/${songId}/comments`, { jar: user.jar, json: { content: 'forged', csrfToken: 'a.b.c' }, headers: { origin: 'https://evil.example' } });
record('comment POST with forged CSRF token is rejected', forgedComment.status === 403, String(forgedComment.status));
const comment = await call('POST', `/api/songs/${songId}/comments`, { jar: user.jar, json: { content: payload, csrfToken: userCsrf } });
record('comment POST with valid CSRF token succeeds', comment.status === 201, String(comment.status));
info('comment containing HTML stored as-is (React escapes on render)', JSON.stringify(comment.data?.content ?? ''));
if (comment.data?.id) {
  const other = await login(otherEmail, password);
  const otherCsrfForComment = await csrf(other);
  const delNoToken = await call('DELETE', `/api/songs/${songId}/comments/${comment.data.id}`, { jar: user.jar });
  record('comment DELETE without CSRF token is rejected', delNoToken.status === 403, String(delNoToken.status));
  const del = await call('DELETE', `/api/songs/${songId}/comments/${comment.data.id}`, { jar: other.jar, headers: { 'x-csrf-token': otherCsrfForComment } });
  record("another user cannot delete someone else's comment", del.status === 403, String(del.status));
  const delOwn = await call('DELETE', `/api/songs/${songId}/comments/${comment.data.id}`, { jar: user.jar, headers: { 'x-csrf-token': userCsrf } });
  record('author can delete own comment with CSRF token', delOwn.status === 200, String(delOwn.status));
}

// ---- Password reset email goes to MailHog ----
const reset = await call('POST', '/api/admin/send-password-reset', { jar: admin.jar, json: { email: userEmail, csrfToken: adminCsrf } });
record('admin password reset request accepted', reset.status === 200, String(reset.status));
try {
  await new Promise((r) => setTimeout(r, 1000));
  const mail = await (await fetch(`${mailhog}/api/v2/search?kind=to&query=${encodeURIComponent(userEmail)}`)).json();
  record('reset email captured by MailHog', mail.total >= 1, `messages=${mail.total}`);
} catch (e) {
  info('MailHog check skipped', String(e.message));
}

// ---- Rate limiting and proxy trust (kept last: it consumes the per-client "auth" buckets) ----
// The limiter keys on the Nth entry from the RIGHT of X-Forwarded-For (N = TRUSTED_PROXY_HOPS, passed
// here as --hops). Entries to the left are client-controlled, so they must not influence the bucket.
const xffFor = (client, forgedLeft = '203.0.113.9') => [forgedLeft, client, ...Array(hops - 1).fill('10.0.0.1')].join(', ');
const failedLogin = async (xff, i) => {
  const jar = new Jar();
  const c = await call('GET', '/api/auth/csrf', { jar });
  return call('POST', '/api/auth/callback/credentials', {
    jar,
    headers: { 'x-forwarded-for': xff },
    form: { csrfToken: c.data.csrfToken, email: userEmail, password: 'wrong-' + i, json: 'true' },
  });
};

const pinned = [];
for (let i = 0; i < 8; i++) pinned.push((await failedLogin(xffFor('192.0.2.50', `203.0.113.${i + 1}`), i)).status);
record(`failed logins from one client are limited even with forged left-most X-Forwarded-For (hops=${hops})`, pinned.slice(5).every((s) => s === 429), pinned.join(','));
const spoof = await failedLogin(xffFor('192.0.2.50', `203.0.113.${Math.floor(Math.random() * 200) + 20}`), 99);
record('forging X-Forwarded-For cannot reset an exhausted limit', spoof.status === 429, String(spoof.status));

const distinct = [];
for (let i = 0; i < 7; i++) distinct.push((await failedLogin(xffFor(`192.0.2.${100 + i}`), i)).status);
record('different clients are not grouped into one rate-limit bucket', !distinct.includes(429), distinct.join(','));

const acceptBurst = [];
for (let i = 0; i < 8; i++) {
  acceptBurst.push((await call('POST', '/api/invite/accept', { json: { token: 'x'.repeat(64), password }, headers: { 'x-forwarded-for': xffFor('192.0.2.60') } })).status);
}
record('invite acceptance is rate limited per client', acceptBurst.slice(5).every((s) => s === 429), acceptBurst.join(','));

if (publicSignup) {
  const weakSignup = await call('POST', '/api/auth/signup', { json: { email: `weak-${run}@example.test`, password: 'weak' }, headers: { 'x-forwarded-for': xffFor('192.0.2.70') } });
  record('public signup enforces the password policy', weakSignup.status === 400, String(weakSignup.status));
  const signupBurst = [];
  for (let i = 0; i < 8; i++) {
    signupBurst.push((await call('POST', '/api/auth/signup', { json: { email: `burst-${i}-${run}@example.test`, password: 'weak' }, headers: { 'x-forwarded-for': xffFor('192.0.2.80') } })).status);
  }
  record('public signup is rate limited per client', signupBurst.includes(429), signupBurst.join(','));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n== ${results.length - failed.length}/${results.length} checks passed ==`);
process.exit(failed.length ? 1 : 0);
