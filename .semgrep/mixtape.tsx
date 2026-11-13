// Fixtures for `semgrep --test .semgrep`. Lines marked ruleid must match; ok must not.
// Path-scoped rules (route handlers) are exercised against the real app/api tree in CI instead.

// ruleid: mixtape-sensitive-data-in-logs
console.log('session', JSON.stringify(session));
// ruleid: mixtape-sensitive-data-in-logs
console.log('headers', Object.fromEntries(req.headers.entries()));
// ruleid: mixtape-sensitive-data-in-logs
console.error('pw', user.password);
// ruleid: mixtape-sensitive-data-in-logs
console.log(body.csrfToken);
// ok: mixtape-sensitive-data-in-logs
console.log('login ok', userRef(email));
// ok: mixtape-sensitive-data-in-logs
console.warn('[CSP-REPORT]', JSON.stringify({ directive: 'img-src' }));

// ruleid: mixtape-hardcoded-credential
const LASTFM_API_KEY = '0123456789abcdef0123456789abcdef';
// ok: mixtape-hardcoded-credential
const LASTFM_KEY_NAME = 'short';
// ok: mixtape-hardcoded-credential
const apiKey = process.env.LASTFM_API_KEY;

// ruleid: mixtape-raw-sql-unsafe
prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);
// ok: mixtape-raw-sql-unsafe
prisma.$queryRaw`SELECT 1`;

// ruleid: mixtape-trusts-leftmost-forwarded-for
const ip = req.headers.get('x-forwarded-for').split(',')[0];
// ok: mixtape-trusts-leftmost-forwarded-for
const rightmost = parts[parts.length - 1];

export function Dangerous({ html }: { html: string }) {
  // ruleid: mixtape-no-dangerously-set-inner-html
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
export function Safe({ text }: { text: string }) {
  // ok: mixtape-no-dangerously-set-inner-html
  return <div>{text}</div>;
}
