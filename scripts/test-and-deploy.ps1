# Streamlined dev test → prod deploy workflow
# Usage: .\scripts\test-and-deploy.ps1 [-Message "commit message"]

param(
    [Parameter(Mandatory=$false)]
    [string]$Message = "Update features",
    [switch]$SkipTests,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Dev Test & Deploy Workflow" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for uncommitted changes
Write-Host "1️⃣  Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain
if (-not $status) {
    Write-Host "   ⚠️  No changes to commit" -ForegroundColor Yellow
    if (-not $Force) {
        Write-Host ""
        Write-Host "Use -Force to deploy anyway" -ForegroundColor Gray
        exit 0
    }
} else {
    Write-Host "   ✅ Changes detected" -ForegroundColor Green
}
Write-Host ""

# Step 2: Run pre-deployment checks
if (-not $SkipTests) {
    Write-Host "2️⃣  Running pre-deployment checks..." -ForegroundColor Yellow
    & "$PSScriptRoot\pre-deploy-check.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Pre-deployment checks failed!" -ForegroundColor Red
        Write-Host "   Fix issues above or use -SkipTests to bypass" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} else {
    Write-Host "2️⃣  ⚠️  Skipping pre-deployment checks" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Commit changes
if ($status) {
    Write-Host "3️⃣  Committing changes..." -ForegroundColor Yellow
    git add -A
    git commit -m $Message
    Write-Host "   ✅ Committed: $Message" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "3️⃣  No changes to commit (using existing HEAD)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 4: Push to GitHub
Write-Host "4️⃣  Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Pushed to origin/main" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for deployment
Write-Host "5️⃣  Waiting for deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$runId = gh run list --limit 1 --json databaseId -q '.[0].databaseId'
Write-Host "   📋 Workflow ID: $runId" -ForegroundColor Gray
Write-Host ""

# Monitor deployment progress
Write-Host "   ⏳ Monitoring deployment (this may take 1-2 minutes)..." -ForegroundColor Cyan

$lastStatus = ""
$startTime = Get-Date
while ($true) {
    $status = gh run view $runId --json status,conclusion -q '.status'
    
    if ($status -ne $lastStatus) {
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
        Write-Host "   ⏱️  ${elapsed}s - Status: $status" -ForegroundColor Gray
        $lastStatus = $status
    }
    
    if ($status -eq "completed") {
        break
    }
    
    Start-Sleep -Seconds 5
}

# Check conclusion
$conclusion = gh run view $runId --json conclusion -q '.conclusion'
Write-Host ""

if ($conclusion -eq "success") {
    Write-Host "   ✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your changes are now live at:" -ForegroundColor Cyan
    Write-Host "  https://mixtape.levesques.net" -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Gray
    Write-Host "  docker compose -f docker-compose.production.yml logs -f app" -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host "   ❌ Deployment failed: $conclusion" -ForegroundColor Red
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  gh run view $runId --log" -ForegroundColor White
    Write-Host ""
    exit 1
}
