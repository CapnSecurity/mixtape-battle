# Security hardening report: The Mixtape

Branch `security/hardening-and-ci` (16 commits ahead of `main`; 60 files, mostly small edits plus new CI,
rules and tests). **Nothing has been deployed.** `main` and production are unchanged. Phase 2 work is
committed locally only; `origin/security/hardening-and-ci` is still at the earlier push (`16c73f3`).

Evidence labels: **Confirmed** = reproduced by a test, a command or a read of the code. **Not verified** =
could not be tested safely or locally; stated so, not assumed.

## 1. Deployment readiness

**Not ready to deploy yet**, for two reasons that need your action, not more code:

1. **Rotate `NEXTAUTH_SECRET` in Render.** A 64-character random-looking value was committed in `.env.local` in
   the initial commit of this public repository (history, 2026-02-04). Whether production uses that same value is
   **not verified**; rotating costs nothing but a one-time re-login for everyone and removes the risk.
2. **Measure the Cloudflare → Render proxy chain** before shipping the new rate limiter (section 7). With the wrong
   `TRUSTED_PROXY_HOPS`, all users could share one 5-logins-per-minute bucket.

Everything else is ready to merge behind the checks in `docs/CI-AND-REVIEW.md`. Recommended rollout is in section 11.

## 2. Findings

### Confirmed vulnerabilities (fixed on this branch)

| # | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| 1 | Critical | Next.js 15.5.12 and `next-auth` 4.24.13 had known critical/high advisories (RCE via image optimizer, middleware bypass, SSRF, DoS; Auth.js email-normalizer bypass) | `npm audit`: 2 critical, 8 high, 2 moderate, 1 low | Upgraded; production audit now **0** |
| 2 | High | Anyone could create an account via `POST /api/auth/signup` with no invite, giving read access to all data and the ability to comment | Reproduced against the original image | Off by default (`ALLOW_PUBLIC_SIGNUP`); server-enforced; browser and smoke tested |
| 3 | Medium | Rate limiter keyed on the left-most `X-Forwarded-For`, which a client controls | Reproduced: a spoofed header returned 401 instead of 429 | Keys on the Nth entry from the right (`TRUSTED_PROXY_HOPS`); 7 unit + 4 smoke assertions |
| 4 | Medium | CSRF tokens were signed with a hardcoded fallback secret if `NEXTAUTH_SECRET` was missing, and compared non-constant-time | Code | Fails closed in production; constant-time compare; unit tested |
| 5 | Medium | Logs contained secret/PII: a CSRF-secret fragment, **all request headers (session cookie)** in setlist add, the whole session in delete-song, JWT and session dumps, password length and hash prefix, SMTP user, raw emails, per-request client IP | Code; clean-run log scan | Removed; emails become `u_ab12cd34`; verbose output gated by `LOG_LEVEL`; Semgrep rule prevents regressions; **0 sensitive hits** in container logs |
| 6 | Medium | Invite acceptance had no rate limit, no password policy, and a race that allowed double redemption | Code | Atomic claim in one transaction; policy and limiter applied; concurrent test: exactly 1 of 8 succeeds |
| 7 | Low | Comment create/delete had no CSRF check (partly mitigated by `SameSite=Lax`) | Code; test | Token required; client updated |
| 8 | Low | No security headers; `x-powered-by` exposed | Live site and local | Added (section 4) |
| 9 | Low | `/api/csrf` and other API/authenticated responses had no `Cache-Control` | Real responses | `private, no-store` on `/api/*` and logged-in pages |
| 10 | Low | Hardcoded Last.fm key in `lib/lastfm.ts` | Code, history | Env var; lookups skipped if unset; **you created and set a new key**; old key to delete |
| 11 | Info | Three read endpoints relied on middleware alone for authentication | Semgrep rule | Explicit `getServerSession` check added |
| 12 | Info | `prisma/seed.ts` had a duplicated tail (broke type checking and seeding); one route used the pre-Next-15 `params` type | `tsc` | Fixed |

Mitigated but **not measured**: login timing now runs a bcrypt comparison for unknown accounts too. I did not
benchmark response times, so I do not claim user enumeration is eliminated.

### Remaining risks (not fixed)

| # | Severity | Type | Item | Recommendation |
|---|---|---|---|---|
| R1 | High if reused | Confirmed exposure | `NEXTAUTH_SECRET` in public git history (initial commit) | Rotate in Render now. Fingerprint recorded in `.gitleaksignore`; history not rewritten |
| R2 | Medium | Confirmed (code) | Admin demotion and user deletion are not effective until the 7-day JWT expires, because most routes trust `token.isAdmin`. A deleted user's still-valid session can also re-create their user row via the comment endpoint's `upsert` | Re-check the DB on privileged routes or shorten `maxAge`; remove the `upsert`. Auth change, so not done without approval |
| R3 | Medium | Design | CSRF tokens are not bound to a user or session (any valid token works for any signed-in user for 1 h) | Bind to the session id; low urgency given `SameSite=Lax` |
| R4 | Medium | Config | Rate limiter is in-memory: resets on restart, per instance | Fine for one Render instance; use a shared store if you scale out |
| R5 | Medium | Unverified | Real client-IP chain behind Cloudflare → Render | Section 7 |
| R6 | Low | Architecture | CSP allows `'unsafe-inline'` for scripts (Report-Only) | Section 5 |
| R7 | Low | Config | Old self-hosted Postgres password in history (`docker-compose.production.yml`, 2026-02-05); stale Next dev-build keys in the initial commit | Confirm the Render DB uses different credentials; leave history alone unless you approve a rewrite |
| R8 | Low | Design | Reset/invite tokens stored in plaintext in the DB and carried in URLs | Hash at rest; 256-bit random so guessing is infeasible |
| R9 | Low | Config | `delete-song` is hard-coded to one email; root admin email hard-coded | Move to config or a role |
| R10 | Low | Dev only | 1 low (`esbuild` via `tsx`) and 6 moderate (`minimatch` ReDoS inside the `typescript-eslint` chain) advisories in dev tooling. The fix needs a major bump outside that package's declared range, so I did not force it | CI gates production deps at high; revisit on the next `eslint-config-next` release |
| R11 | Info | Tooling | Semgrep could not parse 2 files containing a raw `&` in JSX text (`app/songs/[id]/page.tsx`, `src/components/SongBrowser.tsx`); ESLint and CodeQL still cover them | Escape the `&` when convenient |
| R12 | Info | Config | `/api/health` redirects to login (middleware); the Render health check path should be verified | Make `/api/health` public or point the check elsewhere |

Passkeys/WebAuthn: **no implementation exists** on any branch, so there was nothing to test; listed as future work.
There is no multi-band feature: all authenticated users share one song library. Requirements for secure
multi-tenancy are in section 12.

## 3. Versions before → after

| Package | Before (`main`) | After |
|---|---|---|
| next | ^15.5.12 | ^15.5.28 |
| next-auth | ^4.24.13 | ^4.24.15 |
| nodemailer | ^7.0.13 | ^10.2.1 (`overrides` keeps `next-auth`'s optional peer on it) |
| postcss (nested in next) | 8.4.31 | 8.5.32 (`overrides`) |
| dev: eslint / eslint-config-next / @eslint/eslintrc | none | 9.39.5 / 15.5.29 / 3.3.7 |

`npm audit`: **before** 13 vulnerabilities (2 critical, 8 high, 2 moderate, 1 low) → **after, production deps:
0**; all deps: 1 low + 6 moderate, dev tooling only (R10). I rejected `npm audit fix`'s suggestion to downgrade
`@typescript-eslint` to 6.15 because it violates the peer requirement and crashed ESLint.

## 4. Changes made (by area)

- **Headers, CSP, caching**: `next.config.js` (HSTS `max-age=86400` with no `includeSubDomains`/`preload`,
  `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  denying camera/microphone/geolocation/payment/usb and more, `poweredByHeader: false`, CSP **Report-Only**,
  `Cache-Control: private, no-store` for `/api/*` and logged-in pages); `app/api/csp-report/route.ts`
  (rate-limited, 8 KB cap, strips query strings; logs `[CSP-REPORT]`); `middleware.ts`.
- **Auth and CSRF**: `lib/csrf.ts`, `lib/auth-with-credentials.ts`, `app/api/auth/signup`, `app/api/invite/accept`,
  `app/api/invite`, comments routes + `src/components/Comments.tsx`, `app/signup/page.tsx` (error state fix),
  `lib/rate-limit.ts`, GET session checks on songs/setlist/comments.
- **Logging**: new `lib/log.ts`; edits across ~15 route handlers, `lib/use-csrf.ts`, `SetlistButton.tsx`.
- **Repo hygiene**: untracked `auth-dump.txt`, `mixtape-battle-share.zip`, `cache-backup.*` (local copies kept,
  history untouched; scan found no credentials, but the zip embeds a dev SQLite DB with two email addresses);
  `.gitignore`, `.gitattributes` (LF for `*.sh`).
- **Quality gates and CI**: `eslint.config.mjs`, `tests/` (18 unit tests), `.semgrep/`, `.gitleaks.toml`,
  `.gitleaksignore`, `scripts/smoke-test.mjs`, `scripts/ci-smoke.sh`, `.github/workflows/{pr-checks,codeql,pr-agent}.yml`,
  `.github/{dependabot.yml,CODEOWNERS,REVIEW_RULES.md}`, `.pr_agent.toml`, `docs/CI-AND-REVIEW.md`.
- **Env docs**: `.env.render.example` (new variables below).
- **Separate local branch** `diag/proxy-chain` (1 commit, **not merged, not pushed**): a token-gated endpoint that
  reports forwarding headers, to measure the proxy chain.

## 5. CSP architecture decision

I measured the options on this app (Next 15.5.28) instead of relying on the docs:

| Option | Static rendering | Result here | Verdict |
|---|---|---|---|
| Nonce via middleware | **Lost on all 13 prerendered pages** (Next requires dynamic rendering; PPR incompatible) | Strict script policy works | Rejected for now: performance/operational cost for little extra protection (see below) |
| Route-scoped nonces | Kept on non-sensitive routes | **Weak**: a CSP belongs to the first document; client-side navigation to `/admin` keeps the lax policy | Rejected: false sense of safety |
| Experimental SRI + strict `script-src 'self'` (as the docs suggest) | Kept | Adds `integrity` to 6 external scripts but **7–8 inline scripts per page still violated** | Does not work in this version |
| **Static-compatible CSP** (chosen) | **Kept** | 0 violations on 9 pages + 4 art pages; untrusted image host caught client- and server-side | Chosen, in Report-Only |

The chosen policy keeps `script-src 'self' 'unsafe-inline'` and is strict everywhere else: `default-src 'self'`,
`connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, images
only from `'self'`, `data:`, `blob:`, Cover Art Archive/archive.org, `*.mzstatic.com` (iTunes) and Last.fm, fonts and
styles from `fonts.googleapis.com`/`fonts.gstatic.com`. Security implication of `'unsafe-inline'` for scripts: the CSP
no longer blocks injected inline scripts, so XSS protection rests on React escaping (verified: a stored
`<img onerror>` comment renders as text), the absence of `dangerouslySetInnerHTML` (ESLint + Semgrep block it), and
the tight `connect-src`/`img-src`/`form-action` that limit data exfiltration. `style-src 'unsafe-inline'` is required
by React style props and Tailwind. The Google Fonts `@import` is the only third-party code dependency; self-hosting
fonts via `next/font` would remove it (future).

**Path to enforcement (needs your separate approval).** (1) Deploy as Report-Only and watch the `[CSP-REPORT]` log lines
in Render for a week or two across real devices; (2) fix or allow any legitimate sources reported; (3) switch the
header name from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` (one line in `next.config.js`);
(4) to also drop `'unsafe-inline'` for scripts you would adopt nonces, accepting dynamic rendering, ideally after moving
fonts local.

## 6. Verification performed

| Check | Result |
|---|---|
| ESLint | exit 0: **0 errors, 110 warnings** (style rules are warnings; `react/no-danger`, `no-eval` etc. are errors) |
| TypeScript (`tsc --noEmit`) | clean |
| Unit tests (`node:test` via `tsx`) | **18/18** on Windows (Node 24) and in a Linux container (Node 20) |
| `npm audit --omit=dev --audit-level=high` | **0 vulnerabilities** |
| Semgrep CE 1.184.0 | rule self-tests **5/5**; CSRF rule mutation-tested (flags a missing check, ignores a protected route); **0 findings** on the code (2 files unparseable, R11) |
| Gitleaks 8.30.1 | **0 new findings** in `main..HEAD` and with the ignore file over full history; 6 historical findings (R1, R7, Last.fm) recorded as fingerprints |
| actionlint | new workflows clean (only style notes on the pre-existing `deploy.yml`) |
| Production build | succeeds (43 static pages) |
| **Smoke tests on the production Docker image** | **closed signup 91/91, open signup 86/86, `TRUSTED_PROXY_HOPS=2` 91/91** |
| Same smoke tests, clean Linux container simulating CI (`ci-smoke.sh`) | **91/91, 86/86, 91/91**, server-log hygiene OK in each |
| Browser (integrated browser, local image) | 9 pages load with no console/network errors; vote, comment, admin invite, invite signup (weak password rejected, strong accepted, reuse refused) all work; non-admin sees "Admin Access Required" and `/api/admin/users` is 401; CSP violation for an untrusted image host appears in the console **and** the server log |
| MailHog | invite and reset emails captured in all runs; no real SMTP used |
| No production access | confirmed: no production DB, secrets, deploy or push; `.env.development` never read by tooling |

Smoke coverage includes: all six security headers; `x-powered-by` absent; CSP Report-Only and not enforcing; session
cookie `__Secure-`/HttpOnly/Secure/SameSite=Lax/path/≤7 days; unauthenticated redirects; closed/open signup; invite
valid/invalid/expired/reused/concurrent; password policy; existing users log in; admin authorization on every
privileged route; CSRF on admin and comment routes; object-level authorization on practice items and comments;
caching headers on API and logged-in pages; rate limits with forged `X-Forwarded-For` at 1 and 2 hops; distinct
clients not grouped.

**Not run or not verifiable here:** the GitHub Actions themselves (nothing is pushed, so CodeQL, Dependency Review and
the aggregate check have **not run**; I validated them with actionlint and a local simulation); the PR-Agent job
(inert by design); real Cloudflare/Render header behavior and HSTS (HTTPS only); login-timing measurements; load
tests; the Semgrep registry packs (opt-in).

## 7. Proxy trust and rate limiting

Facts: Cloudflare appends the connecting IP to `X-Forwarded-For` and sets `CF-Connecting-IP` with exactly one address.
I could not find Render's documented behavior, so the hop count behind it is **unmeasured**. The code takes the
**Nth entry from the right** (default 1) because entries on the left are attacker-controlled. Smoke and unit tests
show: a forged left-most entry cannot change the bucket; different clients get different buckets; hops=1 and 2 both
behave correctly. If `X-Forwarded-For` is absent every request shares the `unknown` bucket (not expected in production).

Measure it safely: either (A) do a failed login from a known IP and read the `[RATE-LIMIT] … BLOCKED`/debug lines, or
(B) merge-free option: deploy the local `diag/proxy-chain` commit with a temporary `DIAG_TOKEN` and call
`/api/auth/diag` from two networks, plus a request with a forged header and one straight to the `onrender.com` URL.
Rule of thumb: real client IP right-most → `TRUSTED_PROXY_HOPS=1`; one proxy address right-most → `2`. If the
`onrender.com` URL is reachable directly, disable that subdomain in Render, otherwise header-based limits can be
bypassed. If you cannot verify, keep the default `1` only after confirming it does not group users, or deploy with a
generous temporary limit. Do not change production networking from this repo.

## 8. Database migration assessment (investigation only; nothing changed)

**Why `prisma migrate deploy` fails on an empty database:** commit `3de1541` (2026-02-20) deleted the six original
migrations (they used SQLite syntax: `AUTOINCREMENT`, `DATETIME`, so they could never have run on Postgres) and left a
single `SetlistEntry` migration whose foreign key references `"Song"`, which nothing creates. The production schema
was built by hand (`init-tables.sql`, `fix-user-schema.sql`, `add-invite-schema.sql`) and `prisma db push`. Reproduced:
`P3018` / `42P01 relation "Song" does not exist`.

**Evidence the schema can be reconciled:** loading only the DDL (no data) of the 2026-02-20 pre-Render backup into a
disposable DB and diffing it against `schema.prisma` shows **exactly one difference, the `SetlistEntry` table**, which is
what the surviving migration creates.

**Tested strategy** (disposable databases; candidate SQL kept outside the repo in the session folder
`candidate-baseline-migration.sql`, 14 tables):
1. Add a baseline migration generated from `schema.prisma` *without* `SetlistEntry`, timestamped before
   `20260221024500` (e.g. `20260220000000_baseline`).
2. Empty database → `migrate deploy` applies baseline + setlist cleanly; drift vs `schema.prisma`: **none**.
3. Production-like database (tables already exist): `prisma migrate resolve --applied 20260220000000_baseline`
   first, then `migrate deploy` → "No pending migrations", status up to date, **no drift**.
4. **Danger confirmed:** deploying the baseline to an existing database *without* step 3 fails with `P3018`
   (`type "PracticeStatus" already exists`). Because `scripts/start.sh` runs `migrate deploy` on every container start
   and exits on failure, that would take the site down.

**Plan for production (needs your explicit go-ahead):** (a) take a Render backup; (b) read-only drift check:
`npx prisma migrate diff --from-url "$PROD_URL" --to-schema-datamodel prisma/schema.prisma --exit-code` must report no
difference; (c) `npx prisma migrate resolve --applied 20260220000000_baseline` against production (writes one row to
`_prisma_migrations` only); (d) only then merge/deploy the baseline migration; (e) afterwards remove the obsolete
`migrate resolve --rolled-back "20260221023952_add_setlist_table"` line from `scripts/start.sh`; (f) CI then builds
the schema with `prisma migrate deploy` instead of `db push`. Testing needed before step (c): repeat steps 2–4 against a
schema-only dump of the *current* production (not the February one).

## 9. AI-assisted review

Prepared but **inactive**: advisory PR-Agent (MIT, pinned v0.50.0) gated by repository variable `ENABLE_PR_AGENT` and
secret `OPENAI_KEY`; comments only; cannot approve (config + repo setting); not part of the required gate; rules in
`.github/REVIEW_RULES.md`. Cost is per-token billing from the LLM provider you choose; enabling it **sends PR diffs to
that provider**, which needs your approval. Alternatives (Qodo Merge hosted app; a local Ollama model run manually)
are in `docs/CI-AND-REVIEW.md`.

## 10. Outstanding manual actions (in order)

1. **Rotate `NEXTAUTH_SECRET`** in Render (R1). Everyone must sign in again.
2. In Render set `LASTFM_API_KEY` (done) and later delete the old demo key if it is on your Last.fm account.
3. Confirm the Render database credentials differ from the old committed compose password (R7).
4. Measure the proxy chain (section 7) and set `TRUSTED_PROXY_HOPS` if it is not 1.
5. Check the Render health-check path (R12) and whether the `onrender.com` subdomain is reachable.
6. After merging, create the `main` ruleset and apply the repository settings in `docs/CI-AND-REVIEW.md`
   (nothing is enabled yet). Consider removing the self-hosted runner registration.
7. Decide on AI review activation, CSP enforcement and the migration baseline (each a separate approval).
8. Optional: review/purge old Render logs, which were written by the pre-fix code and may contain emails and session data.

## 11. Deployment and rollback

Suggested order: complete actions 1–5 → push the branch and open a PR (checks run) → merge → turn Render **Auto-Deploy
off** beforehand for a manual deploy outside the Nov 17, 9 pm EST Render maintenance window → run
`[CSP-REPORT]`, `[RATE-LIMIT]` and errors. Check the live headers with `curl -I https://themixtape.me/` (the smoke test
refuses non-localhost targets on purpose).

Rollback: in Render use **Deploys → previous deploy → Rollback** (instant). Git: revert the merge commit. Local Docker
images `mixtape-battle-app:latest`, `v0.3.x` and `validation-baseline` are untouched. No schema change is part of this
branch, so rollback needs no database action. Env changes (`NEXTAUTH_SECRET`) are independent: a rolled-back app works
with the new secret.

## 12. Environment variables (new or changed)

| Variable | Default | Purpose |
|---|---|---|
| `LASTFM_API_KEY` | unset (lookups skipped) | Last.fm metadata; replaces the hardcoded key |
| `ALLOW_PUBLIC_SIGNUP` | unset = closed | `true` re-enables public registration |
| `TRUSTED_PROXY_HOPS` | `1` | Which `X-Forwarded-For` entry from the right is the client |
| `LOG_LEVEL` | unset | `debug` re-enables verbose (non-secret) diagnostics in production |

## 13. Future work

- WebAuthn/passkeys: nothing exists today; implementing it is an auth change needing its own design and approval.
- Session revocation and DB-backed role checks (R2); CSRF bound to session (R3); hashed tokens (R8).
- Self-host fonts and move to nonce-based CSP only if the app moves to dynamic rendering anyway.
- **Secure multi-band tenancy** (not implemented): a `Band` model and membership table; a `bandId` on every
  band-owned table (songs, votes, comments, readiness, setlist, practice, invites); membership checked server-side
  in a single helper on every route and Prisma query; Postgres row-level security as a backstop; per-band roles
  instead of a global `isAdmin`; band-scoped invites; per-band caching keys and rate-limit keys; tenant-isolation tests
  that assert one band can never read or write another's rows.
- Migration baseline (section 8), shared rate-limit store if scaling out, `next lint` → ESLint CLI is already done.

## 14. What I installed locally

Dev dependencies: `eslint`, `eslint-config-next`, `@eslint/eslintrc` (in `package.json`). Docker images pulled and
used for tooling only (nothing runs in the background): `semgrep/semgrep`, `zricethezav/gitleaks`,
`rhysd/actionlint`, `node:20-bookworm`. Docker Desktop was started. Throwaway databases were created in the existing
dev Postgres and dropped; validation images `validation-*` remain for comparison and can be removed with `docker rmi`.
