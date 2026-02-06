# Git Workflow & Development Process

This document outlines the recommended Git workflow for the Mixtape Battle project.

## Branch Structure

```
main                    ← Production-ready code (always deployable)
  ├── develop           ← Integration branch (next release)
  │    ├── feature/*    ← New features
  │    ├── security/*   ← Security improvements  
  │    └── bugfix/*     ← Bug fixes
  └── hotfix/*          ← Emergency production fixes
```

## Current State

**Active Branch:** `release/v0.3.0` (currently serving as main)  
**Latest Version:** `v0.3.1`  
**Production:** Running on Docker at localhost:3000

**TODO:** Migrate to proper `main` + `develop` structure

---

## Daily Workflow

### Starting New Work

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/descriptive-name

# Work and commit regularly
git add .
git commit -m "feat(scope): description"

# When feature is complete
git checkout develop
git merge feature/descriptive-name
git push origin develop

# Cleanup
git branch -d feature/descriptive-name
```

### Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/admin-dashboard` |
| `security/` | Security improvements | `security/xss-protection` |
| `bugfix/` | Bug fixes | `bugfix/login-error` |
| `hotfix/` | Production emergencies | `hotfix/critical-crash` |
| `docs/` | Documentation | `docs/api-guide` |
| `test/` | Testing additions | `test/auth-coverage` |

---

## Commit Message Convention

Use **Conventional Commits** for clarity and automated changelog generation:

### Format
```
<type>(<scope>): <subject>

[optional body]
```

### Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): Add password policy enforcement` |
| `fix` | Bug fix | `fix(battle): Correct vote counting logic` |
| `security` | Security improvement | `security(session): Reduce JWT expiration` |
| `refactor` | Code restructure | `refactor(api): Simplify rate limiting` |
| `docs` | Documentation only | `docs(README): Update deployment instructions` |
| `test` | Adding tests | `test(auth): Add password validation tests` |
| `chore` | Maintenance | `chore(deps): Update Next.js to 15.1.6` |
| `perf` | Performance | `perf(db): Add database indexes` |

### Examples

```bash
# Good commits
git commit -m "feat(songs): Add CSV import functionality"
git commit -m "fix(auth): Prevent duplicate user creation"
git commit -m "security(api): Add rate limiting to signup endpoint"
git commit -m "docs(workflow): Add Git workflow documentation"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

---

## Release Process

### Creating a Release

```bash
# Ensure develop is ready
git checkout develop
git pull origin develop

# Merge to main
git checkout main
git merge develop

# Create version tag
git tag -a v0.3.2 -m "Version 0.3.2

New Features:
- Feature 1
- Feature 2

Security:
- Security improvement

Bug Fixes:
- Fix 1"

# Push everything
git push origin main --tags
```

### Version Numbering (Semantic Versioning)

**Format:** `vMAJOR.MINOR.PATCH`

| Type | When to Increment | Example |
|------|-------------------|---------|
| **MAJOR** | Breaking changes | `v1.0.0` → `v2.0.0` |
| **MINOR** | New features (backward compatible) | `v0.3.0` → `v0.4.0` |
| **PATCH** | Bug fixes only | `v0.3.1` → `v0.3.2` |

**Current Version:** `v0.3.1`

---

## Deployment Process

### Build and Deploy

```bash
# Build Docker image with version tag
docker build -t mixtape-battle-app:v0.3.2 -t mixtape-battle-app:latest .

# Stop and remove old container
docker stop app
docker rm app

# Start new container
docker run -d \
  --name app \
  --network mixtape-battle_mixtape-network \
  -p 3000:3000 \
  --env-file .env \
  mixtape-battle-app:v0.3.2

# Verify deployment
docker ps --filter "name=app"
```

---

## Emergency Hotfix Process

For critical production bugs that can't wait for the next release:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-bug-description

# Fix the bug and test thoroughly
git add .
git commit -m "fix(scope): Fix critical bug description"

# Merge to BOTH main and develop
git checkout main
git merge hotfix/critical-bug-description
git tag -a v0.3.2 -m "Hotfix v0.3.2 - Critical bug fix"

git checkout develop
git merge hotfix/critical-bug-description

# Push everything
git push origin main develop --tags

# Deploy immediately
docker build -t mixtape-battle-app:v0.3.2 .
# ... deploy as above
```

---

## Branch Protection Rules

### Main Branch
- ✅ Always deployable
- ✅ Only merge from `develop` or `hotfix/*`
- ✅ Must be tagged after merge
- ✅ Never commit directly to main
- ⚠️ Optional: Require pull request reviews (recommended for team)

### Develop Branch
- ✅ Integration branch for features
- ✅ Should be stable enough to merge to main
- ✅ Run tests before merging features
- ✅ Never commit directly - always use feature branches

---

## Testing Before Merge

Before merging any feature to develop:

```bash
# Run tests
npm test

# Check TypeScript
npm run build

# Test Docker build
docker build -t mixtape-battle-app:test .

# If all pass, merge
git checkout develop
git merge feature/your-feature
```

---

## Typical Week Example

```bash
# Monday - Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/song-import

# Tuesday-Thursday - Work and commit
git add app/songs/import.tsx
git commit -m "feat(songs): Add CSV import UI"

git add lib/song-parser.ts
git commit -m "feat(songs): Add CSV parsing logic"

git add app/api/songs/import/route.ts
git commit -m "feat(songs): Add import API endpoint"

git add security-tests/import-test.js
git commit -m "test(songs): Add import validation tests"

# Friday - Complete and merge
git checkout develop
git merge feature/song-import
git push origin develop
git branch -d feature/song-import

# Ready for production deployment?
git checkout main
git merge develop
git tag -a v0.4.0 -m "Version 0.4.0 - Song import feature"
git push origin main --tags

# Deploy
docker build -t mixtape-battle-app:v0.4.0 .
docker stop app && docker rm app
docker run -d --name app --network mixtape-battle_mixtape-network \
  -p 3000:3000 --env-file .env mixtape-battle-app:v0.4.0
```

---

## Migration Plan (TODO)

Current state needs cleanup. Here's the migration plan:

### Step 1: Create Proper Main Branch
```bash
# Option A: Rename release/v0.3.0 to main
git checkout release/v0.3.0
git branch -m main
git push -u origin main

# Option B: Create new main from release
git checkout -b main release/v0.3.0
git push -u origin main
```

### Step 2: Create Develop Branch
```bash
git checkout -b develop main
git push -u origin develop
```

### Step 3: Set Default Branch
- Go to GitHub → Settings → Branches
- Set default branch to `main`

### Step 4: Clean Up Old Branches
```bash
# After migration
git push origin --delete release/v0.3.0
git branch -d release/v0.3.0
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start feature | `git checkout -b feature/name` |
| Commit work | `git add . && git commit -m "feat: description"` |
| Merge to develop | `git checkout develop && git merge feature/name` |
| Create release | `git checkout main && git merge develop` |
| Tag release | `git tag -a v1.2.3 -m "Description"` |
| Emergency fix | `git checkout -b hotfix/name` |
| Push everything | `git push origin main develop --tags` |
| View branches | `git branch -a` |
| Delete branch | `git branch -d branch-name` |
| Check status | `git status` |

---

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow Guide](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Last Updated:** February 6, 2026  
**Current Version:** v0.3.1  
**Current Branch:** release/v0.3.0 (needs migration to main)
