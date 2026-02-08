#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop development environment

.DESCRIPTION
    Stops GitHub Actions runner and development Docker environment

.PARAMETER KeepRunner
    Keep the GitHub Actions runner running

.PARAMETER KeepDocker
    Keep Docker development environment running

.EXAMPLE
    .\stop-dev.ps1
    Stop everything (runner + dev environment)

.EXAMPLE
    .\stop-dev.ps1 -KeepRunner
    Only stop Docker, keep runner online
#>

param(
    [switch]$KeepRunner,
    [switch]$KeepDocker
)

$ErrorActionPreference = "Stop"

Write-Host "🛑 Stopping Development Environment" -ForegroundColor Cyan
Write-Host ""

# Stop GitHub Actions Runner
if (-not $KeepRunner) {
    Write-Host "📡 GitHub Actions Runner..." -ForegroundColor Yellow
    
    $runnerProcesses = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
    
    if ($runnerProcesses) {
        $runnerProcesses | Stop-Process -Force
        Write-Host "   ✓ Runner stopped" -ForegroundColor Green
    } else {
        Write-Host "   ℹ Runner not running" -ForegroundColor Gray
    }
    Write-Host ""
}

# Stop Docker Development Environment
if (-not $KeepDocker) {
    Write-Host "🐳 Docker Development Environment..." -ForegroundColor Yellow
    
    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        $dockerRunning = $true
    } catch {
        $dockerRunning = $false
    }
    
    if (-not $dockerRunning) {
        Write-Host "   ℹ Docker not running" -ForegroundColor Gray
    } else {
        Write-Host "   → Stopping containers..." -ForegroundColor Gray
        docker compose down
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Containers stopped" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Failed to stop containers" -ForegroundColor Red
        }
    }
    
    # Stop Next.js dev server
    Write-Host "   → Stopping Next.js dev server..." -ForegroundColor Gray
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*next*dev*" }
    
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "   ✓ Next.js dev server stopped" -ForegroundColor Green
    } else {
        Write-Host "   ℹ Next.js dev server not running" -ForegroundColor Gray
    }
    
    Write-Host ""
}

Write-Host "✅ Development Environment Stopped" -ForegroundColor Green
Write-Host ""
