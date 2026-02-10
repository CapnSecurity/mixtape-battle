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
        
        # Start dev containers (postgres on 5433, mailhog)
        Write-Host "   → Starting dev containers (postgres, mailhog)..." -ForegroundColor Gray
        docker compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Dev containers ready" -ForegroundColor Green
            
            # Wait for postgres to be healthy
            Write-Host "   → Waiting for postgres..." -ForegroundColor Gray
            $maxAttempts = 20
            $attempt = 0
            $pgReady = $false
            
            while ($attempt -lt $maxAttempts -and -not $pgReady) {
                try {
                    $result = docker exec mixtape-dev-postgres pg_isready -U postgres 2>&1
                    if ($result -match "accepting connections") {
                        $pgReady = $true
                    }
                } catch {
                    # Still starting
                }
                
                if (-not $pgReady) {
                    Start-Sleep -Seconds 1
                    $attempt++
                }
            }
            
            if ($pgReady) {
                Write-Host "   ✓ Database ready" -ForegroundColor Green
                
                # Set up database schema and seed data
                $env:NODE_ENV = "development"
                $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/mixtape_battle_dev"
                
                # Push schema to database (works for both SQLite and PostgreSQL)
                Write-Host "   → Setting up database schema..." -ForegroundColor Gray
                $schemaOutput = npx prisma db push --skip-generate 2>&1 | Out-String
                if ($schemaOutput -match "is now in sync|already in sync" -or $LASTEXITCODE -eq 0) {
                    Write-Host "   ✓ Database schema ready" -ForegroundColor Green
                    
                    # Seed songs
                    Write-Host "   → Seeding songs..." -ForegroundColor Gray
                    $songSeedOutput = npx tsx prisma/seed.ts 2>&1 | Out-String
                    if ($songSeedOutput -match "Seeded \d+ songs" -or $LASTEXITCODE -eq 0) {
                        Write-Host "   ✓ Songs seeded" -ForegroundColor Green
                    } else {
                        Write-Host "   ⚠ Song seeding failed or songs already exist" -ForegroundColor Yellow
                    }
                    
                    # Seed dev test accounts
                    Write-Host "   → Seeding test accounts..." -ForegroundColor Gray
                    $accountSeedOutput = node prisma/seed-dev-accounts.js 2>&1 | Out-String
                    if ($accountSeedOutput -match "Dev accounts ready" -or $LASTEXITCODE -eq 0) {
                        Write-Host "   ✓ Test accounts ready (admin@test.local, user@test.local)" -ForegroundColor Green
                    } else {
                        Write-Host "   ⚠ Accounts may already exist" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "   ⚠ Schema setup had issues, continuing anyway..." -ForegroundColor Yellow
                }
            } else {
                Write-Host "   ⚠ Database taking longer than usual" -ForegroundColor Yellow
            }
            
            # Start Next.js dev server
            Write-Host "   → Starting Next.js dev server..." -ForegroundColor Gray
            $env:NODE_ENV = "development"
            
            Start-Process -FilePath "pwsh" `
                -ArgumentList "-NoExit", "-Command", "npm run dev" `
                -WorkingDirectory $PSScriptRoot `
                -WindowStyle Normal
            
            # Wait for Next.js to be ready
            Write-Host "   → Waiting for Next.js (http://localhost:3000)..." -ForegroundColor Gray
            $maxAttempts = 30
            $attempt = 0
            $ready = $false
            
            while ($attempt -lt $maxAttempts -and -not $ready) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 2 -ErrorAction SilentlyContinue
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
                Write-Host "   ✓ Next.js dev server is ready!" -ForegroundColor Green
                
                if ($OpenBrowser) {
                    Write-Host "   → Opening browser..." -ForegroundColor Gray
                    Start-Process "http://localhost:3000"
                }
            } else {
                Write-Host "   ⚠ Next.js taking longer than usual to start" -ForegroundColor Yellow
                Write-Host "   → Check the terminal window running 'npm run dev'" -ForegroundColor Gray
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
Write-Host "Environment Info:" -ForegroundColor Cyan
Write-Host "  Dev Server:     http://localhost:3000" -ForegroundColor Gray
Write-Host "  Dev Postgres:   localhost:5433 (separate from production)" -ForegroundColor Gray
Write-Host "  Mailhog:        http://localhost:8025" -ForegroundColor Gray
Write-Host "  Production:     https://localhost (unchanged, still running)" -ForegroundColor Gray
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Cyan
Write-Host "  View Next.js:   Check terminal window running 'npm run dev'" -ForegroundColor Gray
Write-Host "  Stop Next.js:   Ctrl+C in the npm run dev terminal" -ForegroundColor Gray
Write-Host "  Stop runner:    Get-Process -Name 'Runner.Listener' | Stop-Process" -ForegroundColor Gray
Write-Host "  Stop Docker:    docker compose down" -ForegroundColor Gray
Write-Host "  Full stop:      .\stop-dev.ps1" -ForegroundColor Gray
Write-Host ""
