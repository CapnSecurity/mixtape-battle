#!/usr/bin/env pwsh
# Production Startup Script for Mixtape Battle
# Usage: .\start-production.ps1

Write-Host "🚀 Starting Mixtape Battle Production Environment..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Loading environment variables from .env..." -ForegroundColor Cyan
# Docker Compose will automatically load .env file

Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Production environment started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Site URL: https://mixtape.levesques.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Yellow
    docker-compose -f docker-compose.production.yml ps
    Write-Host ""
    Write-Host "📝 View logs with: docker-compose -f docker-compose.production.yml logs -f" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to start containers. Check logs for details." -ForegroundColor Red
    Write-Host "View logs: docker-compose -f docker-compose.production.yml logs" -ForegroundColor Yellow
    exit 1
}
