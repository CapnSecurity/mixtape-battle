# 🚀 Quick CI/CD Reference

## Daily Workflow

### Starting a New Feature
```bash
git checkout -b feature/my-feature
docker compose up -d  # Start dev environment
# Make changes, test at http://localhost:3000
```

### Deploying to Production

**With Self-Hosted Runner (Automatic):**
```bash
# Just push to main - that's it!
git checkout main
git merge feature/my-feature
git push origin main
# GitHub Actions builds → Runner deploys → Production updates
# Monitor at: https://github.com/CapnSecurity/mixtape-battle/actions
```

**Without Self-Hosted Runner (Manual):**
```bash
# 1. Merge and push
git checkout main  
git merge feature/my-feature
git push origin main

# 2. Wait for GitHub Actions build to complete
#    Monitor at: https://github.com/CapnSecurity/mixtape-battle/actions

# 3. Deploy manually
.\deploy.ps1

# 4. Test deployment
.\test-production.ps1
```

**Setup automatic deployment:** See [SELF_HOSTED_RUNNER_SETUP.md](SELF_HOSTED_RUNNER_SETUP.md)

## Deployment Scripts

### deploy.ps1 (Windows)
```powershell
.\deploy.ps1              # Full deployment
.\deploy.ps1 -SkipPull    # Skip git pull
.\deploy.ps1 -SkipBuild   # Pull from registry instead of building
```

### test-production.ps1
```powershell
.\test-production.ps1                          # Test localhost:3000
.\test-production.ps1 -BaseUrl https://mixtape.levesques.net  # Test live site
```

## Troubleshooting

### Check GitHub Actions Status
https://github.com/CapnSecurity/mixtape-battle/actions

**With self-hosted runner:** Build verification + automatic deployment  
**Without runner:** Build verification only (deploy manually with `.\deploy.ps1`)

### View Production Logs
```powershell
docker compose -f docker-compose.production.yml logs -f app
```

### Rollback Deployment
```powershell
docker compose -f docker-compose.production.yml down
git revert HEAD
git push origin main
.\deploy.ps1
```

### Force Rebuild
```powershell
docker compose -f docker-compose.production.yml down
docker system prune -f
.\deploy.ps1
```

## Environment Checklist

Before first deployment, ensure:
- [ ] `.env.production` exists with production values
- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] `DATABASE_URL` points to production database
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Email settings configured

## Monitoring

### Health Check
```powershell
Invoke-WebRequest http://localhost:3000/api/health
```

### Container Status
```powershell
docker compose -f docker-compose.production.yml ps
docker stats
```

### Database Check
```powershell
docker exec mixtape-postgres psql -U mixtape -d mixtape_battle -c "SELECT COUNT(*) FROM \"Song\";"
```
