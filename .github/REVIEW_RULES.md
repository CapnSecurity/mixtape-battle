# Review rules for The Mixtape

These rules apply to human reviewers and to the AI reviewer (PR-Agent reads them via `.pr_agent.toml`).
Deterministic checks (ESLint, TypeScript, unit/smoke tests, Semgrep project rules, Gitleaks, npm audit,
CodeQL) are the merge gate; review comments are advisory until the team decides otherwise.

## Must not regress

1. **Authentication and authorization are enforced on the server.** Every API route handler calls
   `getServerSession()`; admin routes check `isAdmin` on the server, never only in the UI. Middleware is
   defence in depth, not the only control.
2. **State-changing authenticated routes call `verifyCsrfToken()`** (`lib/csrf.ts`) and the client sends
   `X-CSRF-Token` (see `lib/use-csrf.ts`). Only unauthenticated pre-login routes are exempt
   (`auth/signup`, `invite/accept`, `csp-report`); additions to that list need justification.
3. **Object-level authorization.** Routes that take an id must check ownership or admin rights
   (see `practice/[id]`, `comments/[commentId]`).
4. **Public signup stays off by default** (`ALLOW_PUBLIC_SIGNUP`). Invites are single-use, expiring and
   redeemed atomically; the password policy applies everywhere a password is set.
5. **Rate limiting** keys on `getClientId()` (right-most trusted `X-Forwarded-For`, `TRUSTED_PROXY_HOPS`).
   Never read the left-most entry or any other client-controlled header for security decisions.
6. **No secrets or personal data in logs.** Use `lib/log.ts` (`userRef`, `debug`). Never log sessions,
   tokens, cookies, request headers, password hashes, SMTP settings or raw email addresses.
7. **Secrets come from environment variables.** No credentials in source, fixtures or examples.
8. **Security headers and CSP** live in `next.config.js`. Do not add `'unsafe-eval'`, widen `img-src`,
   `connect-src` or `frame-ancestors`, or switch the CSP to enforcing without an explicit decision.
9. **Caching.** `/api/*` and pages behind login are `private, no-store`. Public static pages may keep
   Next.js defaults. Do not add `force-dynamic` globally to support nonces.
10. **Input validation.** Validate type, length and format of everything from the client; return generic
    errors in production (`sanitizeError`).

## Next.js specifics to check

- Route handlers: `params` is a Promise in Next 15 (`await params`).
- No `dangerouslySetInnerHTML` (ESLint `react/no-danger` and Semgrep both block it).
- Server-only values must not reach client components; only `NEXT_PUBLIC_*` is exposed to the browser.
- Prisma: no `$queryRawUnsafe`/`$executeRawUnsafe`; multi-step writes that must be atomic use `$transaction`.
- New dependencies: justify them, check maintenance and licence; run `npm audit` for production deps.

## Testing expectations

- Behaviour changes in auth, authorization, CSRF, rate limiting, logging or caching come with a unit test
  (`tests/`) or a smoke-test assertion (`scripts/smoke-test.mjs`).
- Bug fixes include a regression test where practical.

## Out of scope for review comments

- Style-only churn, mass refactors, or replacing the auth stack in a feature PR.
- WebAuthn/passkeys and multi-tenant support are tracked as future work (see SECURITY-HARDENING.md).
