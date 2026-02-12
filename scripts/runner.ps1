#!/usr/bin/env pwsh
# Helper script to check and manage GitHub Actions runner

param(
    [switch]$Start,
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status
)

$runnerPath = "C:\Users\tim\Desktop\Windsurf Projects\mixtape-battle\actions-runner"

function Get-RunnerStatus {
    $process = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "✓ GitHub Actions runner is RUNNING" -ForegroundColor Green
        Write-Host "  PID: $($process.Id)" -ForegroundColor Gray
        Write-Host "  CPU: $($process.CPU.ToString('F2'))s" -ForegroundColor Gray
        Write-Host "  Memory: $([math]::Round($process.WorkingSet64 / 1MB, 2))MB" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "✗ GitHub Actions runner is NOT running" -ForegroundColor Red
        return $false
    }
}

function Start-Runner {
    Write-Host "Starting GitHub Actions runner..." -ForegroundColor Cyan
    
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/c cd `"$runnerPath`" && run.cmd"
    $startInfo.WorkingDirectory = $runnerPath
    $startInfo.UseShellExecute = $true
    $startInfo.WindowStyle = "Minimized"
    
    try {
        [System.Diagnostics.Process]::Start($startInfo) | Out-Null
        Write-Host "✓ Runner started" -ForegroundColor Green
        Write-Host "  Check minimized window for runner output" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to start runner: $_" -ForegroundColor Red
        exit 1
    }
}

function Stop-Runner {
    Write-Host "Stopping GitHub Actions runner..." -ForegroundColor Cyan
    
    $process = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Write-Host "✓ Runner stopped" -ForegroundColor Green
    } else {
        Write-Host "Runner is not running" -ForegroundColor Yellow
    }
    
    # Also stop any Worker processes
    $workers = Get-Process -Name "Runner.Worker" -ErrorAction SilentlyContinue
    if ($workers) {
        $workers | Stop-Process -Force
        Write-Host "✓ Stopped $($workers.Count) worker process(es)" -ForegroundColor Green
    }
}

# Main logic
if ($Status -or (-not $Start -and -not $Stop -and -not $Restart)) {
    Get-RunnerStatus
    exit 0
}

if ($Stop) {
    Stop-Runner
    exit 0
}

if ($Restart) {
    if (Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue) {
        Stop-Runner
        Start-Sleep -Seconds 2
    }
    Start-Runner
    exit 0
}

if ($Start) {
    if (Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue) {
        Write-Host "Runner is already running" -ForegroundColor Yellow
        Get-RunnerStatus
    } else {
        Start-Runner
    }
    exit 0
}
