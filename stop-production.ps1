#!/usr/bin/env pwsh
# Production Teardown Script for Mixtape Battle
# Usage: .\stop-production.ps1

Write-Host "🛑 Stopping Mixtape Battle Production Environment..." -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    exit 1
}

Write-Host "🐳 Stopping Docker containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Production environment stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 To remove all data (including database), run:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.production.yml down -v" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to stop containers. Check status with:" -ForegroundColor Red
    Write-Host "   docker-compose -f docker-compose.production.yml ps" -ForegroundColor Yellow
    exit 1
}
