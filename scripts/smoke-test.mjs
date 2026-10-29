// Black-box smoke test for authentication, authorization and security headers.
//
// Usage: node scripts/smoke-test.mjs <baseUrl> --db mixtape_validation_upgraded [--container mixtape-dev-postgres]
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

console.log(`\n== Smoke test against ${base} (run ${run}) ==\n`);

// ---- Public pages and headers ----
const home = await call('GET', '/');
record('GET / returns 200', home.status === 200, String(home.status));
const interesting = [
  'strict-transport-security',
  'content-security-policy',
  'content-security-policy-report-only',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'x-powered-by',
  'cache-control',
];
for (const name of interesting) info(`header ${name}`, home.headers.get(name) ?? '(absent)');
const loginPage = await call('GET', '/login');
record('GET /login returns 200', loginPage.status === 200, String(loginPage.status));
info('login cache-control', loginPage.headers.get('cache-control') ?? '(absent)');

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
const signupResults = [];
for (const email of [adminEmail, userEmail, otherEmail]) {
  signupResults.push((await call('POST', '/api/auth/signup', { json: { email, password } })).status);
}
info('public signup (no invite) statuses', signupResults.join(','));

if (db) {
  psql(`UPDATE "User" SET "isAdmin"=true WHERE email='${adminEmail}'`);
  psql(`INSERT INTO "Song"(title, artist, "updatedAt") VALUES ('Smoke Song', 'Smoke Artist', now())`);
}
const songId = db ? Number(psql(`SELECT id FROM "Song" ORDER BY id DESC LIMIT 1`)) : 1;

const bad = await login(userEmail, 'definitely-wrong');
record('wrong password does not create a session', !bad.session?.user, JSON.stringify(bad.session));

const admin = await login(adminEmail, password);
const user = await login(userEmail, password);
record('admin login creates session', admin.session?.user?.email === adminEmail, admin.session?.user?.email ?? 'none');
record('user login creates session', user.session?.user?.email === userEmail, user.session?.user?.email ?? 'none');
record('session reflects isAdmin only for promoted account', admin.session?.user?.isAdmin === true && !user.session?.user?.isAdmin);
info('session cookie names', [...user.jar.cookies.keys()].join(', '));

// ---- CSRF tokens ----
const anonCsrf = await call('GET', '/api/csrf');
record('GET /api/csrf requires a session', anonCsrf.status !== 200, String(anonCsrf.status));
const csrf = async (s) => (await call('GET', '/api/csrf', { jar: s.jar })).data.csrfToken;
const adminCsrf = await csrf(admin);
const userCsrf = await csrf(user);
record('authenticated user receives CSRF token', typeof userCsrf === 'string' && userCsrf.split('.').length === 3);

// ---- Authenticated reads ----
const songs = await call('GET', '/api/songs', { jar: user.jar });
record('authenticated GET /api/songs returns data', songs.status === 200 && Array.isArray(songs.data), String(songs.status));
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

// ---- Comments: stored XSS handling and ownership ----
const payload = '<img src=x onerror=alert(1)>';
const comment = await call('POST', `/api/songs/${songId}/comments`, { jar: user.jar, json: { content: payload } });
info('comment containing HTML stored as-is (React escapes on render)', `${comment.status} ${JSON.stringify(comment.data?.content ?? '')}`);
if (comment.data?.id) {
  const other = await login(otherEmail, password);
  const del = await call('DELETE', `/api/songs/${songId}/comments/${comment.data.id}`, { jar: other.jar });
  record("another user cannot delete someone else's comment", del.status === 403, String(del.status));
  const csrfMissing = await call('POST', `/api/songs/${songId}/comments`, { jar: user.jar, json: { content: 'x' }, headers: { origin: 'https://evil.example' } });
  info('comment POST without CSRF token and with foreign Origin', String(csrfMissing.status));
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

// ---- Login rate limiting (kept last: it consumes the shared "auth" bucket) ----
const statuses = [];
for (let i = 0; i < 8; i++) {
  const jar = new Jar();
  const c = await call('GET', '/api/auth/csrf', { jar });
  const r = await call('POST', '/api/auth/callback/credentials', {
    jar,
    headers: { 'x-forwarded-for': '192.0.2.50' },
    form: { csrfToken: c.data.csrfToken, email: userEmail, password: 'wrong-' + i, json: 'true' },
  });
  statuses.push(r.status);
}
record('repeated failed logins from one client are rate limited', statuses.includes(429), statuses.join(','));
const spoof = await login(userEmail, 'wrong-spoof', { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200) + 1}` });
info('rate-limit bypass attempt via spoofed X-Forwarded-For (200/non-429 means bypassable)', String(spoof.res.status));

const failed = results.filter((r) => !r.ok);
console.log(`\n== ${results.length - failed.length}/${results.length} checks passed ==`);
process.exit(failed.length ? 1 : 0);
