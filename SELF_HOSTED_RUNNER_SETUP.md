# Self-Hosted GitHub Actions Runner Setup

This guide walks you through setting up a self-hosted GitHub Actions runner on your Windows production server to enable automatic deployment when you push to the `main` branch.

## Overview

Once configured, the workflow is:
1. You push code to `main` branch
2. GitHub Actions builds and verifies the Docker image
3. GitHub Actions triggers your local runner
4. Runner executes `deploy.ps1` automatically
5. Production is updated with zero manual intervention

## Prerequisites

- Windows machine running Docker Desktop
- Administrator access to your Windows machine
- GitHub repository access (CapnSecurity/mixtape-battle)
- Production already running on this machine

## Setup Steps

### 1. Navigate to GitHub Settings

1. Go to your GitHub repository: `https://github.com/CapnSecurity/mixtape-battle`
2. Click **Settings** → **Actions** → **Runners**
3. Click **New self-hosted runner**
4. Select **Windows** as the operating system
5. Select **x64** as the architecture

### 2. Download the Runner

GitHub will show you download commands. Open PowerShell as **Administrator** and run:

```powershell
# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download the latest runner package
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/<version>/actions-runner-win-x64-<version>.zip -OutFile actions-runner-win-x64.zip

# Extract the installer
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64.zip", "$PWD")
```

**Note:** GitHub will show you the exact download URL with the latest version. Copy it from the GitHub Settings page.

### 3. Configure the Runner

GitHub will provide you with a configuration command that includes a unique token. It will look like:

```powershell
.\config.cmd --url https://github.com/CapnSecurity/mixtape-battle --token <YOUR_UNIQUE_TOKEN>
```

When prompted:
- **Runner name**: Press Enter to use the default (your computer name), or enter a custom name like `mixtape-production`
- **Runner group**: Press Enter for default
- **Labels**: Press Enter for default
- **Work folder**: Press Enter for default

### 4. Install as a Windows Service

To ensure the runner starts automatically and runs in the background:

```powershell
# Install the service (run as Administrator)
.\svc.sh install

# Start the service
.\svc.sh start
```

### 5. Verify Runner Status

1. Go back to **Settings** → **Actions** → **Runners** in GitHub
2. You should see your runner listed with a green "Idle" status
3. This means it's ready to receive jobs

### 6. Test Automatic Deployment

Make a small change and push to main:

```powershell
cd "C:\Users\tim\Desktop\Windsurf Projects\mixtape-battle"

# Make a test change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

Watch the workflow run:
1. Go to **Actions** tab in GitHub
2. You should see "Build and Deploy" workflow running
3. First job: "Verify Build" runs on GitHub's servers
4. Second job: "Deploy to Production" runs on your local machine
5. Production automatically updates!

## Runner Management

### Check Runner Status

```powershell
cd C:\actions-runner
.\svc.sh status
```

### Stop the Runner

```powershell
.\svc.sh stop
```

### Start the Runner

```powershell
.\svc.sh start
```

### Restart the Runner

```powershell
.\svc.sh stop
.\svc.sh start
```

### Uninstall the Runner

If you need to remove it:

```powershell
# Stop the service
.\svc.sh stop

# Uninstall the service
.\svc.sh uninstall

# Remove the runner from GitHub
.\config.cmd remove --token <YOUR_UNIQUE_TOKEN>
```

## Troubleshooting

### Runner Not Appearing in GitHub

- Verify the runner service is running: `.\svc.sh status`
- Check Windows Services: Look for "GitHub Actions Runner"
- Restart the service: `.\svc.sh stop` then `.\svc.sh start`

### Deployment Job Fails

**Check runner logs:**
```powershell
cd C:\actions-runner
Get-Content _diag\Runner_*.log -Tail 50
```

**Common issues:**
- Docker not running: Start Docker Desktop
- Path issues: Ensure the workflow uses the correct path to your project
- Permissions: Runner service needs access to Docker and your project directory

### Job Stuck at "Queued"

- Verify runner is online in GitHub Settings → Runners
- Check runner service is running: `.\svc.sh status`
- Restart runner: `.\svc.sh stop` then `.\svc.sh start`

### Docker Errors During Deployment

The runner executes `deploy.ps1`, so any Docker errors would be the same as running manually:
- Ensure Docker Desktop is running
- Check `docker ps` shows containers
- Review deployment logs: `docker compose -f docker-compose.production.yml logs`

## Security Considerations

### Runner Isolation

- The runner runs as a Windows service with LocalSystem privileges
- It has access to Docker and your filesystem
- Only install runners on trusted machines

### Token Security

- Never share your runner registration token
- Tokens are single-use for registration
- Once registered, the runner uses a different authentication method

### Repository Access

- The runner can only access repositories you've configured
- It can't access other repositories without explicit permission
- Review GitHub's self-hosted runner security best practices

## How It Works

### Workflow Execution

1. **Build Verification Job** (`build-verify`)
   - Runs on GitHub's Ubuntu servers
   - Builds Docker image to verify code compiles
   - Uses GitHub's build cache for speed
   - No deployment happens here

2. **Deployment Job** (`deploy`)
   - Runs on your self-hosted Windows runner
   - Only runs if build verification succeeds
   - Executes `deploy.ps1` in your project directory
   - Updates production automatically

### What Gets Deployed

The `deploy.ps1` script:
1. Pulls latest code from GitHub
2. Builds new Docker image (or uses existing if `-SkipBuild`)
3. Stops current production containers
4. Starts updated containers
5. Runs health checks to verify deployment

### When Deployment Happens

Automatic deployment triggers when:
- You push to the `main` branch
- You manually trigger the workflow from GitHub Actions tab
- Build verification succeeds first

Deployment will NOT happen if:
- Build fails
- You push to a branch other than `main`
- Runner is offline

## Monitoring

### GitHub Actions Dashboard

View all workflow runs:
- Go to **Actions** tab in your repository
- See status of builds and deployments
- Review logs for each job
- Download artifacts if needed

### Local Monitoring

While deployment runs, you can watch locally:

```powershell
# Watch Docker containers
docker ps -a

# Follow deployment logs
docker compose -f docker-compose.production.yml logs -f app

# Monitor system resources
Get-Process | Where-Object {$_.Name -like "*docker*"} | Select-Object Name,CPU,WorkingSet
```

## Best Practices

### Keep Runner Updated

GitHub occasionally releases runner updates. To update:

```powershell
cd C:\actions-runner
.\svc.sh stop
.\svc.sh uninstall
# Download latest runner version from GitHub
# Extract and run config.cmd again
.\svc.sh install
.\svc.sh start
```

### Monitor Disk Space

The runner stores logs and caches:
```powershell
# Check runner directory size
Get-ChildItem C:\actions-runner -Recurse | Measure-Object -Property Length -Sum
```

Clean old logs periodically if needed.

### Backup Strategy

Even with automatic deployment, maintain backups:
- Database: Regular PostgreSQL backups via `pg_dump`
- Code: Already in GitHub
- Environment files: Back up `.env.production` separately
- Docker volumes: Back up `postgres-data` volume

## Alternative: Manual Deployment

If you prefer to keep deployment manual while still benefiting from automated builds:

1. Don't install the self-hosted runner
2. GitHub will still verify builds when you push
3. Deploy manually when ready: `.\deploy.ps1`

This gives you build verification without automatic deployment.

## Need Help?

- **GitHub Actions Documentation**: https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners
- **Runner Logs**: `C:\actions-runner\_diag\`
- **Deployment Logs**: Check Docker Compose logs with `docker compose logs`
- **Workflow Logs**: Available in GitHub Actions tab

---

After setup, your deployment workflow is fully automated:
**Push to main → Build verifies → Runner deploys → Production updates** 🚀
