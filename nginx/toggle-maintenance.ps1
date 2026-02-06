# Nginx-based maintenance mode toggle for Mixtape Battle
# This is SAFE for production - it does NOT stop the app container

param(
    [Parameter(Mandatory=$false)]
    [switch]$On,
    
    [Parameter(Mandatory=$false)]
    [switch]$Off,
    
    [Parameter(Mandatory=$false)]
    [switch]$Status
)

$NGINX_CONTAINER = "mixtape-nginx"
$MAINTENANCE_FLAG = "/usr/share/nginx/html/.maintenance"
$MAINTENANCE_HTML = "/usr/share/nginx/html/maintenance.html"
$LOCAL_MAINTENANCE_HTML = ".\nginx\maintenance.html"

function Write-ColorOutput($ForegroundColor, $Message) {
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

function Show-Status {
    Write-Host "`n📊 Maintenance Mode Status" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    # Check if nginx container is running
    $nginxRunning = docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>$null
    if (-not $nginxRunning) {
        Write-ColorOutput Red "❌ ERROR: Nginx container not running!"
        Write-Host ""
        return
    }
    
    Write-ColorOutput Green "✓ Nginx container: RUNNING"
    
    # Check if maintenance flag exists
    $flagExists = docker exec $NGINX_CONTAINER test -f $MAINTENANCE_FLAG 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Yellow "⚠️  Maintenance Mode: ACTIVE"
        Write-Host "   Users will see the maintenance page" -ForegroundColor DarkYellow
    } else {
        Write-ColorOutput Green "✓ Maintenance Mode: INACTIVE"
        Write-Host "   Site is operating normally" -ForegroundColor DarkGreen
    }
    
    # Check if app is running
    $appRunning = docker ps --filter "name=app" --filter "status=running" --format "{{.Names}}" 2>$null
    if ($appRunning -match "^app$") {
        Write-ColorOutput Green "✓ App container: RUNNING"
    } else {
        Write-ColorOutput Red "❌ App container: STOPPED"
    }
    
    Write-Host ""
}

function Enable-Maintenance {
    Write-Host "`n🔧 Enabling Maintenance Mode..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    # Check if nginx container exists
    $nginxRunning = docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>$null
    if (-not $nginxRunning) {
        Write-ColorOutput Red "❌ ERROR: Nginx container '$NGINX_CONTAINER' not found or not running!"
        Write-Host ""
        return
    }
    
    # Copy maintenance page to nginx if it doesn't exist
    Write-Host "📄 Checking maintenance page..." -ForegroundColor Cyan
    $htmlExists = docker exec $NGINX_CONTAINER test -f $MAINTENANCE_HTML 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Copying maintenance.html to nginx container..." -ForegroundColor DarkCyan
        if (-not (Test-Path $LOCAL_MAINTENANCE_HTML)) {
            Write-ColorOutput Red "❌ ERROR: Local maintenance.html not found at $LOCAL_MAINTENANCE_HTML"
            Write-Host ""
            return
        }
        docker cp $LOCAL_MAINTENANCE_HTML "${NGINX_CONTAINER}:$MAINTENANCE_HTML" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "   ✓ Maintenance page deployed"
        } else {
            Write-ColorOutput Red "   ❌ Failed to copy maintenance page"
            Write-Host ""
            return
        }
    } else {
        Write-ColorOutput Green "   ✓ Maintenance page already exists"
    }
    
    # Create maintenance flag file
    Write-Host "🚩 Activating maintenance flag..." -ForegroundColor Cyan
    docker exec $NGINX_CONTAINER touch $MAINTENANCE_FLAG 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "   ✓ Maintenance flag created"
    } else {
        Write-ColorOutput Red "   ❌ Failed to create maintenance flag"
        Write-Host ""
        return
    }
    
    Write-Host "`n" -NoNewline
    Write-ColorOutput Green "✅ MAINTENANCE MODE ENABLED"
    Write-Host "   Visitors will now see the maintenance page" -ForegroundColor DarkGray
    Write-Host "   App container is still running (safe for production)" -ForegroundColor DarkGray
    Write-Host ""
}

function Disable-Maintenance {
    Write-Host "`n🔓 Disabling Maintenance Mode..." -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    # Check if nginx container exists
    $nginxRunning = docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>$null
    if (-not $nginxRunning) {
        Write-ColorOutput Red "❌ ERROR: Nginx container '$NGINX_CONTAINER' not found or not running!"
        Write-Host ""
        return
    }
    
    # Remove maintenance flag file
    Write-Host "🚩 Removing maintenance flag..." -ForegroundColor Cyan
    docker exec $NGINX_CONTAINER rm -f $MAINTENANCE_FLAG 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "   ✓ Maintenance flag removed"
    } else {
        # It's okay if the file doesn't exist
        Write-ColorOutput Green "   ✓ No maintenance flag to remove"
    }
    
    Write-Host "`n" -NoNewline
    Write-ColorOutput Green "✅ MAINTENANCE MODE DISABLED"
    Write-Host "   Site is now live and serving traffic normally" -ForegroundColor DarkGray
    Write-Host ""
}

# Main execution
if ($On) {
    Enable-Maintenance
    Show-Status
} elseif ($Off) {
    Disable-Maintenance
    Show-Status
} elseif ($Status) {
    Show-Status
} else {
    Write-Host "`nMixtape Battle - Nginx Maintenance Mode" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\toggle-maintenance.ps1 -On       Enable maintenance mode"
    Write-Host "  .\toggle-maintenance.ps1 -Off      Disable maintenance mode"
    Write-Host "  .\toggle-maintenance.ps1 -Status   Show current status"
    Write-Host ""
    Write-Host "Note: This script uses nginx-level maintenance (safe for production)" -ForegroundColor DarkGray
    Write-Host "      The app container keeps running, only nginx shows maintenance page" -ForegroundColor DarkGray
    Write-Host ""
}
