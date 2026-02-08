#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start complete development environment

.DESCRIPTION
    Starts GitHub Actions runner and development Docker environment

.PARAMETER SkipRunner
    Skip starting the GitHub Actions runner

.PARAMETER SkipDocker
    Skip starting Docker development environment

.PARAMETER OpenBrowser
    Open browser to localhost:3000 after starting

.EXAMPLE
    .\start-dev.ps1
    Start everything (runner + dev environment)

.EXAMPLE
    .\start-dev.ps1 -OpenBrowser
    Start everything and open browser

.EXAMPLE
    .\start-dev.ps1 -SkipRunner
    Only start dev environment, skip runner
#>

param(
    [switch]$SkipRunner,
    [switch]$SkipDocker,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Development Environment" -ForegroundColor Cyan
Write-Host ""

# Function to check if runner is already running
function Test-RunnerRunning {
    $runnerProcesses = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
    return $null -ne $runnerProcesses
}

# Start GitHub Actions Runner
if (-not $SkipRunner) {
    Write-Host "📡 GitHub Actions Runner..." -ForegroundColor Yellow
    
    if (Test-RunnerRunning) {
        Write-Host "   ✓ Already running" -ForegroundColor Green
    } else {
        $runnerPath = Join-Path $PSScriptRoot "actions-runner"
        
        if (Test-Path $runnerPath) {
            # Start runner in background using Start-Process
            $runnerCmd = Join-Path $runnerPath "run.cmd"
            
            if (Test-Path $runnerCmd) {
                Start-Process -FilePath "cmd.exe" `
                    -ArgumentList "/c", "`"$runnerCmd`"" `
                    -WorkingDirectory $runnerPath `
                    -WindowStyle Minimized
                
                # Wait a moment for it to start
                Start-Sleep -Seconds 2
                
                if (Test-RunnerRunning) {
                    Write-Host "   ✓ Runner started (check GitHub for Idle status)" -ForegroundColor Green
                    Write-Host "   → https://github.com/CapnSecurity/mixtape-battle/settings/actions/runners" -ForegroundColor Gray
                } else {
                    Write-Host "   ⚠ Runner may be starting (check task manager)" -ForegroundColor Yellow
                }
            } else {
                Write-Host "   ⚠ Runner not configured (run.cmd not found)" -ForegroundColor Yellow
                Write-Host "   → See SELF_HOSTED_RUNNER_SETUP.md" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠ Runner not installed (actions-runner folder not found)" -ForegroundColor Yellow
            Write-Host "   → See SELF_HOSTED_RUNNER_SETUP.md for setup instructions" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Start Docker Development Environment
if (-not $SkipDocker) {
    Write-Host "🐳 Docker Development Environment..." -ForegroundColor Yellow
    
    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        $dockerRunning = $true
    } catch {
        $dockerRunning = $false
    }
    
    if (-not $dockerRunning) {
        Write-Host "   ⚠ Docker Desktop is not running" -ForegroundColor Yellow
        Write-Host "   → Start Docker Desktop and run this script again" -ForegroundColor Gray
    } else {
        Write-Host "   ✓ Docker is running" -ForegroundColor Green
        
        # Start dev containers
        Write-Host "   → Starting containers..." -ForegroundColor Gray
        docker compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Development environment ready" -ForegroundColor Green
            Write-Host "   → Application: http://localhost" -ForegroundColor Gray
            
            # Wait for app to be ready
            Write-Host "   → Waiting for application to start..." -ForegroundColor Gray
            $maxAttempts = 30
            $attempt = 0
            $ready = $false
            
            while ($attempt -lt $maxAttempts -and -not $ready) {
                try {
                    # Dev environment uses nginx on port 80
                    $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 2 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) {
                        $ready = $true
                    }
                } catch {
                    # Still starting up
                }
                
                if (-not $ready) {
                    Start-Sleep -Seconds 1
                    $attempt++
                }
            }
            
            if ($ready) {
                Write-Host "   ✓ Application is ready!" -ForegroundColor Green
                
                if ($OpenBrowser) {
                    Write-Host "   → Opening browser..." -ForegroundColor Gray
                    Start-Process "http://localhost"
                }
            } else {
                Write-Host "   ⚠ Application taking longer than usual to start" -ForegroundColor Yellow
                Write-Host "   → Check logs: docker compose logs -f app" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ✗ Failed to start containers" -ForegroundColor Red
            Write-Host "   → Check: docker compose logs" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

Write-Host "✅ Development Environment Started" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Cyan
Write-Host "  View logs:    docker compose logs -f app" -ForegroundColor Gray
Write-Host "  Stop runner:  Get-Process -Name 'Runner.Listener' | Stop-Process" -ForegroundColor Gray
Write-Host "  Stop Docker:  docker compose down" -ForegroundColor Gray
Write-Host "  Full stop:    .\stop-dev.ps1" -ForegroundColor Gray
Write-Host ""
