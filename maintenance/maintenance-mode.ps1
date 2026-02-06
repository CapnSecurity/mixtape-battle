# Maintenance Mode Toggle Script for Mixtape Battle
# Usage: .\maintenance-mode.ps1 -On  OR  .\maintenance-mode.ps1 -Off

param(
    [switch]$On,
    [switch]$Off
)

$APP_CONTAINER = "app"
$MAINTENANCE_CONTAINER = "maintenance"
$PORT = "3000"
$MAINTENANCE_HTML = Join-Path $PSScriptRoot "index.html"

function Enable-MaintenanceMode {
    Write-Host "`n🔧 Enabling maintenance mode..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    # Stop the app container
    Write-Host "`n1. Stopping application..." -ForegroundColor Cyan
    docker stop $APP_CONTAINER 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Application stopped" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Application container not found or already stopped" -ForegroundColor Yellow
    }
    
    # Start maintenance container
    Write-Host "`n2. Starting maintenance page..." -ForegroundColor Cyan
    docker run -d --name $MAINTENANCE_CONTAINER -p "${PORT}:80" nginx:alpine 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Maintenance container started" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to start maintenance container" -ForegroundColor Red
        return
    }
    
    # Copy maintenance page
    Write-Host "`n3. Deploying maintenance page..." -ForegroundColor Cyan
    if (Test-Path $MAINTENANCE_HTML) {
        docker cp $MAINTENANCE_HTML "${MAINTENANCE_CONTAINER}:/usr/share/nginx/html/index.html" 2>$null
        Write-Host "   ✅ Custom maintenance page deployed" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Custom page not found, using default" -ForegroundColor Yellow
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "✅ MAINTENANCE MODE ENABLED" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "`n🌐 View at: http://localhost:$PORT" -ForegroundColor Cyan
    Write-Host "📝 To restore: .\maintenance-mode.ps1 -Off`n" -ForegroundColor DarkGray
}

function Disable-MaintenanceMode {
    Write-Host "`n🚀 Disabling maintenance mode..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    # Stop maintenance container
    Write-Host "`n1. Stopping maintenance page..." -ForegroundColor Cyan
    docker stop $MAINTENANCE_CONTAINER 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Maintenance page stopped" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Maintenance container not found" -ForegroundColor Yellow
    }
    
    docker rm $MAINTENANCE_CONTAINER 2>$null | Out-Null
    Write-Host "   ✅ Maintenance container removed" -ForegroundColor Green
    
    # Start app container
    Write-Host "`n2. Starting application..." -ForegroundColor Cyan
    docker start $APP_CONTAINER 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Application started" -ForegroundColor Green
        
        # Wait a moment for the app to start
        Write-Host "`n3. Waiting for application to be ready..." -ForegroundColor Cyan
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Application should be ready" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to start application" -ForegroundColor Red
        Write-Host "   💡 Try: docker start $APP_CONTAINER" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "✅ SITE IS BACK ONLINE" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "`n🌐 Visit: http://localhost:$PORT`n" -ForegroundColor Cyan
}

function Show-Status {
    Write-Host "`n📊 Current Status:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    $appRunning = docker ps --filter "name=$APP_CONTAINER" --format "{{.Names}}" 2>$null
    $maintenanceRunning = docker ps --filter "name=$MAINTENANCE_CONTAINER" --format "{{.Names}}" 2>$null
    
    if ($appRunning) {
        Write-Host "🟢 Application: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "🔴 Application: STOPPED" -ForegroundColor Red
    }
    
    if ($maintenanceRunning) {
        Write-Host "🟡 Maintenance: ACTIVE" -ForegroundColor Yellow
    } else {
        Write-Host "⚪ Maintenance: INACTIVE" -ForegroundColor Gray
    }
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
}

# Main execution
if ($On) {
    Enable-MaintenanceMode
    Show-Status
}
elseif ($Off) {
    Disable-MaintenanceMode
    Show-Status
}
else {
    Write-Host "`n❌ Error: Please specify -On or -Off" -ForegroundColor Red
    Write-Host "`nUsage:" -ForegroundColor Yellow
    Write-Host "  .\maintenance-mode.ps1 -On   # Enable maintenance mode" -ForegroundColor Cyan
    Write-Host "  .\maintenance-mode.ps1 -Off  # Disable maintenance mode`n" -ForegroundColor Cyan
    Show-Status
}
