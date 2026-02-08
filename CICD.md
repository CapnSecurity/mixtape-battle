# CI/CD Workflow Documentation

## Overview

This project uses a GitHub Actions workflow for automated builds and semi-automated deployments.

## Workflow Steps

### 1. Development (Local)

```bash
# Start new feature
git checkout -b feature/my-feature

# Start dev environment
docker compose up -d

# Application available at http://localhost:3000

# Make changes and test...
```

### 2. Testing & Verification

```bash
# Run tests (when available)
npm test

# Run linting
npm run lint

# Check build
npm run build
```

### 3. Production Baseline & Diff

Before pushing to main, compare your changes:

```bash
# See what changed
git diff main

# Review all changes
git log main..HEAD

# Check for environment variable changes
git diff main -- .env.example
```

### 4. Environment Variables Check

**Required environment variables for production:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Production URL (https://mixtape.levesques.net)
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with: `openssl rand -base64 32`)
- `EMAIL_SERVER` - SMTP server details
- `EMAIL_FROM` - Sender email address

**Verify `.env.production` exists and is configured on production server**

### 5. Push to Main

```bash
# Merge feature to main
git checkout main
git merge feature/my-feature

# Push to trigger GitHub Actions
git push origin main
```

### 6. GitHub Actions Build

The workflow automatically:
1. ✅ Checks out code
2. 🐳 Builds Docker image (verification only)
3. ✅ Confirms build succeeds
4. 📝 Generates build summary

**This is just a verification step - no deployment happens automatically.**

**Monitor at:** https://github.com/CapnSecurity/mixtape-battle/actions

### 7. Deploy to Production

#### Manual Deployment (Current Approach)

**On Windows (local production):**
```powershell
.\deploy.ps1
```

**On Linux server (if you set up SSH):**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 8. Production Validation

Run canary tests:

```powershell
# PowerShell
.\test-production.ps1

# Bash
./test-production.sh
```

Manual checks:
1. ✅ Visit https://mixtape.levesques.net
2. ✅ Test login functionality
3. ✅ Test battle page
4. ✅ Check /api/health endpoint
5. ✅ Verify database connectivity
6. ✅ Check recent logs

### 9. Rollback (if needed)

```bash
# Stop containers
docker compose -f docker-compose.production.yml down

# Revert to previous git commit
git revert HEAD
git push origin main

# Rebuild and redeploy
.\deploy.ps1
```

Or use tagged images:
```bash
# List recent images
docker images ghcr.io/capnsecurity/mixtape-battle

# Use specific tag
docker compose -f docker-compose.production.yml down
docker pull ghcr.io/capnsecurity/mixtape-battle:20260207-abc123
docker tag ghcr.io/capnsecurity/mixtape-battle:20260207-abc123 mixtape-battle-app:latest
docker compose -f docker-compose.production.yml up -d
```

## Environment Setup

### Production Server Setup

```bash
# Clone repository (if not already cloned)
git clone https://github.com/CapnSecurity/mixtape-battle.git
cd mixtape-battle

# Create .env.production file
cp .env.example .env.production
nano .env.production  # Edit with production values

# Make deploy script executable
chmod +x deploy.sh test-production.sh

# Run initial deployment
./deploy.sh
```

## Monitoring & Logs

```bash
# View logs
docker compose -f docker-compose.production.yml logs -f app

# View all container logs
docker compose -f docker-compose.production.yml logs -f

# Check container status
docker compose -f docker-compose.production.yml ps

# Check resource usage
docker stats
```

## Future Enhancements

- [ ] Automated testing in GitHub Actions
- [ ] Automated deployment via webhooks or self-hosted runner
- [ ] Staging environment
- [ ] Automated rollback on test failures
- [ ] Performance monitoring
- [ ] Error tracking (Sentry integration)
- [ ] Automated database backups before deployment
- [ ] Blue-green deployments
- [ ] Load testing

## Troubleshooting

**Build fails in GitHub Actions:**
- Check the Actions tab for detailed logs
- Ensure all dependencies are in package.json
- Verify Dockerfile syntax

**Deployment fails:**
- Check Docker daemon is running
- Verify .env.production has all required variables
- Check disk space: `df -h`
- Check Docker logs: `docker compose logs`

**Application not responding after deployment:**
1. Check container status: `docker compose ps`
2. Check logs: `docker compose logs app`
3. Verify health endpoint: `curl http://localhost:3000/api/health`
4. Check database connectivity
5. Verify environment variables are loaded

**Database migration issues:**
- Run manually: `docker exec mixtape-app npx prisma migrate deploy`
- Check migration status: `docker exec mixtape-app npx prisma migrate status`
