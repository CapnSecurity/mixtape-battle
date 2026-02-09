# Deployment Scripts

Streamlined workflow scripts for dev → prod deployment.

## Quick Start

**Test in dev, then deploy to prod in one command:**

```powershell
.\scripts\test-and-deploy.ps1 -Message "Add new feature"
```

This will:
1. ✅ Check for uncommitted changes
2. ✅ Run pre-deployment validation
3. ✅ Commit your changes
4. ✅ Push to GitHub
5. ✅ Wait for deployment to complete
6. ✅ Show success/failure status

## Available Scripts

### `test-and-deploy.ps1`

Automated dev → prod workflow.

**Usage:**
```powershell
# Basic usage
.\scripts\test-and-deploy.ps1 -Message "Your commit message"

# Skip validation checks (not recommended)
.\scripts\test-and-deploy.ps1 -Message "Quick fix" -SkipTests

# Force deploy even with no changes
.\scripts\test-and-deploy.ps1 -Force
```

**Parameters:**
- `-Message` - Commit message (default: "Update features")
- `-SkipTests` - Skip pre-deployment validation (use carefully)
- `-Force` - Deploy even if no changes detected

---

### `pre-deploy-check.ps1`

Validation script that catches common issues before deployment.

**Usage:**
```powershell
.\scripts\pre-deploy-check.ps1
```

**Checks performed:**
- ✅ Uncommitted changes
- ✅ Broken route references (links pointing to non-existent pages)
- ✅ Orphaned routes (pages with no links to them)
- ✅ Duplicate/conflicting routes
- ✅ Docker Compose file validity
- ✅ Environment configuration

**Exit codes:**
- `0` - All checks passed, ready to deploy
- `1` - Issues found, fix before deploying

---

## Workflow Examples

### Standard Workflow
```powershell
# 1. Make changes and test in dev (localhost:3000)
npm run dev

# 2. When ready, deploy to prod
.\scripts\test-and-deploy.ps1 -Message "Implement search feature"

# 3. Script handles everything else!
```

### Check Before Deploying
```powershell
# Run checks without deploying
.\scripts\pre-deploy-check.ps1

# If issues found, fix them, then:
.\scripts\test-and-deploy.ps1 -Message "Fixed route references"
```

### Quick Deploy (Skip Checks)
```powershell
# Only use if you're certain there are no issues
.\scripts\test-and-deploy.ps1 -Message "Hotfix" -SkipTests
```

---

## What This Solves

**Before:** 
1. Test in dev ✅
2. Push to prod
3. Discover broken links/orphaned routes ❌
4. Fix in prod
5. Push again
6. Wait another 2 minutes...

**After:**
1. Test in dev ✅
2. Run `test-and-deploy.ps1`
3. Script catches issues BEFORE pushing ✅
4. Fix locally
5. Deploy once, done ✅

---

## Tips

- Always test in dev first (`npm run dev` on port 3000)
- Let the script validate before pushing
- Write descriptive commit messages
- Check the production site after deployment
- Use `docker compose -f docker-compose.production.yml logs -f app` to watch prod logs

---

## Troubleshooting

**"Broken route reference" error:**
- You have a link to a page that doesn't exist
- Either create the page or fix the link

**"Orphaned route" warning:**
- You have a page with no links to it
- Either add navigation to it or delete it if unused

**"Uncommitted changes" error:**
- Commit your changes first, or use `-Force` to deploy existing commits

**Deployment failed:**
- Check logs: `gh run view <ID> --log`
- Common issues: build errors, missing env vars, syntax errors
