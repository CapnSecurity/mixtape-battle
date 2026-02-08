# Production deployment script for mixtape-battle (PowerShell)
# Run this on Windows to deploy to local production

param(
    [switch]$SkipPull,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$REPO = "ghcr.io/capnsecurity/mixtape-battle"
$ENV_FILE = ".env.production"
$COMPOSE_FILE = "docker-compose.production.yml"

Write-Host "🚀 Mixtape Battle - Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path $COMPOSE_FILE)) {
    Write-Host "❌ Error: $COMPOSE_FILE not found" -ForegroundColor Red
    Write-Host "Please run this script from the mixtape-battle directory" -ForegroundColor Red
    exit 1
}

# Check if .env.production exists
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "⚠️  Warning: $ENV_FILE not found" -ForegroundColor Yellow
    Write-Host "Make sure environment variables are configured" -ForegroundColor Yellow
}

# Pull latest code from git
if (-not $SkipPull) {
    Write-Host "📥 Pulling latest code from GitHub..." -ForegroundColor Cyan
    git fetch origin
    git pull origin main
    Write-Host "✅ Code updated" -ForegroundColor Green
    Write-Host ""
}

# Build or pull Docker image
if ($SkipBuild) {
    # Pull from registry
    Write-Host "🐳 Pulling latest Docker image from registry..." -ForegroundColor Cyan
    Write-Host "Note: You may need to login first with:" -ForegroundColor Yellow
    Write-Host "  docker login ghcr.io" -ForegroundColor Yellow
    Write-Host ""
    docker pull ${REPO}:latest
    
    # Tag as local image
    docker tag ${REPO}:latest mixtape-battle-app:latest
    Write-Host "✅ Image pulled and tagged" -ForegroundColor Green
} else {
    # Build locally
    Write-Host "🔨 Building Docker image locally..." -ForegroundColor Cyan
    docker build -t mixtape-battle-app:latest .
    Write-Host "✅ Image built" -ForegroundColor Green
}
Write-Host ""

# Stop current containers
Write-Host "🛑 Stopping current containers..." -ForegroundColor Cyan
docker compose -f $COMPOSE_FILE down
Write-Host "✅ Containers stopped" -ForegroundColor Green
Write-Host ""

# Start new containers
Write-Host "🚀 Starting new containers..." -ForegroundColor Cyan
docker compose -f $COMPOSE_FILE up -d
Write-Host "✅ Containers started" -ForegroundColor Green
Write-Host ""

# Wait for health checks
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check container status
Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Cyan
docker compose -f $COMPOSE_FILE ps
Write-Host ""

# Run health check
Write-Host "🏥 Running health check..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Health check endpoint not responding yet (this may be normal during startup)" -ForegroundColor Yellow
}
Write-Host ""

# Display recent logs
Write-Host "📝 Recent logs:" -ForegroundColor Cyan
docker compose -f $COMPOSE_FILE logs --tail=20 app
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the application at http://localhost:3000" -ForegroundColor White
Write-Host "2. Check logs if needed: docker compose -f $COMPOSE_FILE logs -f app" -ForegroundColor White
Write-Host "3. Rollback if issues: docker compose -f $COMPOSE_FILE down && docker compose -f $COMPOSE_FILE up -d" -ForegroundColor White
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\deploy.ps1                    # Full deployment (git pull + build + deploy)" -ForegroundColor Gray
Write-Host "  .\deploy.ps1 -SkipPull          # Skip git pull" -ForegroundColor Gray
Write-Host "  .\deploy.ps1 -SkipBuild         # Pull image from registry instead of building" -ForegroundColor Gray
Write-Host ""
