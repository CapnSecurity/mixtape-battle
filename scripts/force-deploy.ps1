# Force clean production deployment
# Use this when you need to ensure absolutely fresh code with no caching

$ErrorActionPreference = "Stop"

Write-Host "🧹 FORCING CLEAN DEPLOYMENT" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor Cyan
Write-Host "  1. Remove all Docker build cache" -ForegroundColor Gray
Write-Host "  2. Remove old images" -ForegroundColor Gray  
Write-Host "  3. Force fresh build" -ForegroundColor Gray
Write-Host "  4. Deploy with new containers" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Continue? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🛑 Stopping containers..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yml down
Write-Host "✅ Stopped" -ForegroundColor Green
Write-Host ""

Write-Host "🗑️  Removing old images..." -ForegroundColor Cyan
docker rmi mixtape-battle-app:latest -f 2>$null
Write-Host "✅ Removed" -ForegroundColor Green
Write-Host ""

Write-Host "🧹 Pruning Docker build cache..." -ForegroundColor Cyan
docker builder prune -af
Write-Host "✅ Cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "📥 Pulling latest code..." -ForegroundColor Cyan
git fetch origin
git pull origin main
Write-Host "✅ Code updated" -ForegroundColor Green
Write-Host ""

Write-Host "🔨 Building fresh image (this may take a while)..." -ForegroundColor Cyan
docker build --no-cache --pull -t mixtape-battle-app:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yml up -d
Write-Host "✅ Started" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ Waiting for services..." -ForegroundColor Cyan
Start-Sleep -Seconds 15
Write-Host ""

Write-Host "🗄️  Syncing database schema..." -ForegroundColor Cyan
try {
    $dbOutput = docker exec mixtape-app node node_modules/prisma/build/index.js db push 2>&1
    Write-Host $dbOutput
    Write-Host "✅ Schema synced" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Schema sync failed: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🔄 Restarting app..." -ForegroundColor Cyan
docker compose -f docker-compose.production.yml restart app
Start-Sleep -Seconds 5
Write-Host "✅ Restarted" -ForegroundColor Green
Write-Host ""

Write-Host "🏥 Health check..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Service is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Health check failed - check logs" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📝 Recent logs:" -ForegroundColor Cyan
docker compose -f docker-compose.production.yml logs --tail=30 app
Write-Host ""

Write-Host "======================================" -ForegroundColor Yellow
Write-Host "✨ CLEAN DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Production URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "💡 Users may need to hard refresh (Ctrl+F5) to clear browser cache" -ForegroundColor Yellow
Write-Host ""
