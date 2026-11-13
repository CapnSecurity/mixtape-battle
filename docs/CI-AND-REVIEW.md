# CI, branch protection and AI review

Everything here is **configured in the repository but not enabled**: nothing has been pushed to `main`,
no repository setting has been changed, and no paid service or API key is involved. This page lists
what runs, what you must switch on manually, and what it costs.

## 1. What runs on every pull request

Workflow: `.github/workflows/pr-checks.yml` (GitHub-hosted `ubuntu-latest` runners, `contents: read`,
no secrets, actions pinned to commit SHAs, `pull_request` trigger only).

| Job | Tool | Blocks merge? | What it catches |
|---|---|---|---|
| Lint, types, unit tests | ESLint 9, `tsc`, `node:test` via `tsx` | **Yes** (lint *errors*; warnings reported) | Code problems, type errors, regressions in CSRF / rate-limit / logging helpers |
| Dependency audit | `npm audit --omit=dev --audit-level=high`, Dependency Review | **Yes** | Known vulnerable production dependencies; risky dependency changes in the PR |
| Secret scan | Gitleaks 8.30.1 (pinned binary, SHA-256 verified) | **Yes** | New secrets in the PR's commits or tree |
| SAST | Semgrep CE 1.184.0 with `.semgrep/mixtape.yml` | **Yes** (ERROR rules) | Mutating route without CSRF check, session/header/token logging, `dangerouslySetInnerHTML`, raw SQL, left-most `X-Forwarded-For`, hardcoded credentials |
| Production build + smoke tests | `npm run build`, `scripts/ci-smoke.sh` (Postgres + MailHog service containers) | **Yes** | Build breaks; auth, authorization, CSRF, caching, security headers, invites, rate limits (3 configurations) |
| Docker image build | `docker build` (no push) | **Yes** | Dockerfile / production image breakage |
| **All required checks** | aggregate | **This is the one status to require** | |
| CodeQL (`codeql.yml`) | GitHub CodeQL, `security-extended` | Optional (see below) | Data-flow vulnerabilities; results in the Security tab |
| npm audit (all deps), Semgrep warnings | | No (job summary only) | Dev-tool advisories, defence-in-depth hints |
| AI review (`pr-agent.yml`) | PR-Agent | **Never** (advisory) | Logic, security, tests, Next.js concerns |

Also added: `dependabot.yml` (weekly update PRs for npm, Actions, Docker; majors for Next/Prisma ignored),
`CODEOWNERS`, and `.github/REVIEW_RULES.md` (the written rules both humans and the AI reviewer follow).

Not chosen, on purpose: **OSV-Scanner** (npm-only repo; `npm audit` and Dependency Review already use the
GitHub advisory database), **Semgrep registry rules** (available but opt-in, see section 3), **Trivy**
(`scripts/security-scan.sh` can still be run locally).

### Run the same checks locally

```bash
npm run lint && npm run typecheck && npm test && npm run security:audit
# Semgrep + Gitleaks without installing them (Docker):
docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep semgrep scan --config .semgrep/mixtape.yml --metrics=off --severity ERROR --error --exclude .semgrep --exclude tests --exclude scripts --exclude security-tests --exclude prisma
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git /repo --config /repo/.gitleaks.toml --gitleaks-ignore-path /repo/.gitleaksignore --redact --no-banner
# Smoke test against a locally running production build on a throwaway DB:
node scripts/smoke-test.mjs http://localhost:PORT --db mixtape_validation_<name>
```

## 2. Manual steps to make the checks mandatory

None of this can be done from the repository. Do it after the branch is merged (a required check can only
be selected once the workflow has run at least once).

### a) Ruleset for `main` (Settings → Rules → Rulesets → New branch ruleset)

- Name `Protect main`, Enforcement **Active**, target branch `main`. **Bypass list: empty.**
- Restrict deletions; Block force pushes.
- Require a pull request before merging; **Dismiss stale approvals when new commits are pushed**;
  **Require conversation resolution**.
- Require status checks to pass; **Require branches to be up to date**; add **`All required checks`**
  (and, once you have seen it run, **`CodeQL (JavaScript/TypeScript)`**).
- Approvals: see the note below.

Equivalent API call (review it, then run it yourself; it is *not* executed anywhere):

```bash
gh api repos/CapnSecurity/mixtape-battle/rulesets --method POST --input - <<'JSON'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [ { "context": "All required checks" } ] } }
  ]
}
JSON
```

**Approvals for a solo maintainer.** GitHub does not let an author approve their own PR, so requiring one
approval (or Code Owner review) would lock you out when you are the only human. Start with 0 required
approvals and let the status checks be the gate. When a second trusted reviewer exists, raise it to 1 and
turn on "Require review from Code Owners". Either way, the AI reviewer's comments never count as an
approval (section 4).

### b) Repository settings to verify (Settings → Actions → General, and Security)

- **Allow GitHub Actions to create and approve pull requests: OFF.** This is what stops any workflow bot
  from approving a PR.
- Workflow permissions: **Read repository contents** (each workflow also declares `contents: read`).
- Fork pull request workflows: **Require approval for all outside collaborators.**
- Actions permissions: allow GitHub-owned and *selected* actions, and enable **Require actions to be
  pinned to a full-length commit SHA** (everything here already is; the API currently reports
  `sha_pinning_required: false`).
- Security: enable **Dependabot alerts**, **Dependabot security updates**, **Secret scanning**,
  **Push protection** and **Private vulnerability reporting** (all free for public repositories). Enable
  **Code scanning** default setup *or* keep `codeql.yml`, not both.

### c) The self-hosted runner

`actions-runner/` is registered to this **public** repository and `deploy.yml` can run on it
(`workflow_dispatch` only, currently offline). A self-hosted runner on a public repo can end up running
attacker-controlled code if a workflow is ever triggered by a pull request. None of the new workflows use
it. Recommendation: **remove the runner registration** (Settings → Actions → Runners) and delete
`deploy.yml`, since Render auto-deploy replaced it; at minimum, leave it offline. Not changed here.

### d) Deploy gating

Render deploys from `main` automatically. With the ruleset above a change cannot reach `main` without the
required checks, so merging is the deployment gate. For an extra stop, turn **Auto-Deploy off** in Render
and deploy manually after merge (this also gives you one-click rollback in the Render UI).

## 3. Optional switches (all off by default)

| Variable / secret | Where | Effect |
|---|---|---|
| `ENABLE_SEMGREP_REGISTRY=true` | repo variable | Also runs `p/typescript`, `p/nextjs`, `p/jwt` rule packs (advisory). Downloads rules from semgrep.dev; no source is uploaded. |
| `ENABLE_PR_AGENT=true` + secret `OPENAI_KEY` | repo variable + secret | Turns on the advisory AI reviewer (section 4). |

## 4. AI-assisted review (PR-Agent): prepared, not active

**Architecture.** `pr-agent.yml` runs the MIT-licensed [PR-Agent](https://github.com/The-PR-Agent/pr-agent)
(pinned to v0.50.0) as a GitHub Action on `opened` / `reopened` / `ready_for_review` of PRs from this
repository only. It reads the PR through the GitHub API (no checkout, nothing executed), asks an LLM to
review it against `.github/REVIEW_RULES.md` (via `.pr_agent.toml`), and posts a comment.

**Guard rails.**
- `pull_request` only, never `pull_request_target`; fork PRs get no secrets and are skipped.
- Job token: `pull-requests: write`, `issues: write`, `contents: read`. No deployment or contents-write
  permission, and it is not part of the `All required checks` gate.
- `enable_auto_approval = false` in `.pr_agent.toml` (read from `main`, so a PR cannot weaken its own
  reviewer), and the repository setting "Allow GitHub Actions to create and approve pull requests" stays
  OFF, so the bot cannot approve even if misconfigured.
- Slash commands from comments only for OWNER / MEMBER / COLLABORATOR, so strangers cannot trigger spend.
- An AI or agent that authored a change must not be the one that approves it. Human approval (or, for a
  solo repo, the deterministic checks) stays the merge authority; AI comments are advice.

**Cost and data handling (decide before enabling).**
- PR-Agent itself is free; **you pay the LLM provider per token**. Its default model needs an OpenAI API
  key (`OPENAI_KEY`). Cost scales with diff size and review count; this config reviews only on
  open/reopen/ready (not every push) and leaves descriptions and suggestions off. Set a **hard monthly
  spending limit** in the provider console before adding the key. I have not put a dollar figure here
  because it depends on the provider's current pricing.
- **Enabling it sends PR diffs and surrounding file context to that provider.** The repository is public,
  but unmerged security work in a PR would still be shared with a third party. That needs your explicit
  approval.
- Alternatives: **Qodo Merge** (hosted commercial product from the same project; needs the Qodo GitHub App
  with repository access; check current pricing at qodo.ai) or a **local model**: run PR-Agent from your
  own machine against Ollama on demand. That keeps code on your machine and costs nothing, but is manual.

**To activate (when you approve).** Add repository secret `OPENAI_KEY`, then set repository variable
`ENABLE_PR_AGENT=true`. To deactivate, delete the variable.

## 5. What the CI needs and what it does not

- Secrets used by PR workflows: **none** (only the automatic `GITHUB_TOKEN`).
- Third-party downloads at run time: Gitleaks release binary (SHA-256 pinned), Semgrep from PyPI (version
  pinned), `postgres:16-alpine` and `mailhog/mailhog:v1.0.1` service images.
- Ongoing cost: **$0** on GitHub-hosted runners for a public repository. The only possible cost is the
  optional LLM key in section 4.
