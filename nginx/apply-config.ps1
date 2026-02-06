# Apply new nginx configuration with maintenance mode support
# Run this ONCE to enable maintenance mode capability

$NGINX_CONTAINER = "mixtape-nginx"
$LOCAL_NGINX_CONF = ".\nginx\nginx.conf"
$REMOTE_NGINX_CONF = "/etc/nginx/nginx.conf"
$LOCAL_MAINTENANCE_HTML = ".\nginx\maintenance.html"
$REMOTE_MAINTENANCE_HTML = "/usr/share/nginx/html/maintenance.html"

Write-Host "`n🔧 Applying Nginx Maintenance Mode Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Check if nginx container is running
$nginxRunning = docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Names}}" 2>$null
if (-not $nginxRunning) {
    Write-Host "❌ ERROR: Nginx container '$NGINX_CONTAINER' not found or not running!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✓ Found nginx container: $NGINX_CONTAINER" -ForegroundColor Green

# Check if local files exist
if (-not (Test-Path $LOCAL_NGINX_CONF)) {
    Write-Host "❌ ERROR: nginx.conf not found at $LOCAL_NGINX_CONF" -ForegroundColor Red
    Write-Host ""
    exit 1
}

if (-not (Test-Path $LOCAL_MAINTENANCE_HTML)) {
    Write-Host "❌ ERROR: maintenance.html not found at $LOCAL_MAINTENANCE_HTML" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✓ Local configuration files found" -ForegroundColor Green
Write-Host ""

# Backup current nginx.conf
Write-Host "📦 Backing up current nginx configuration..." -ForegroundColor Cyan
$backupFile = ".\nginx\nginx.conf.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
docker cp "${NGINX_CONTAINER}:${REMOTE_NGINX_CONF}" $backupFile 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Backup saved to: $backupFile" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Could not backup current config (continuing anyway)" -ForegroundColor Yellow
}

# Copy new nginx.conf (via temp location since file is in use)
Write-Host "📄 Copying new nginx.conf to container..." -ForegroundColor Cyan
docker cp $LOCAL_NGINX_CONF "${NGINX_CONTAINER}:/tmp/nginx.conf" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to copy nginx.conf to temp location" -ForegroundColor Red
    Write-Host ""
    exit 1
}
docker exec $NGINX_CONTAINER mv /tmp/nginx.conf $REMOTE_NGINX_CONF 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to move nginx.conf to final location" -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host "   ✓ nginx.conf deployed" -ForegroundColor Green

# Copy maintenance.html
Write-Host "🎨 Copying maintenance page to container..." -ForegroundColor Cyan
docker cp $LOCAL_MAINTENANCE_HTML "${NGINX_CONTAINER}:${REMOTE_MAINTENANCE_HTML}" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to copy maintenance.html" -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host "   ✓ maintenance.html deployed" -ForegroundColor Green

# Test nginx configuration
Write-Host "🔍 Testing nginx configuration..." -ForegroundColor Cyan
docker exec $NGINX_CONTAINER nginx -t 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Nginx configuration test FAILED!" -ForegroundColor Red
    Write-Host "   Rolling back to backup..." -ForegroundColor Yellow
    docker cp $backupFile "${NGINX_CONTAINER}:${REMOTE_NGINX_CONF}" 2>$null
    Write-Host "   ⚠️  Configuration restored from backup" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host "   ✓ Configuration is valid" -ForegroundColor Green

# Reload nginx
Write-Host "🔄 Reloading nginx..." -ForegroundColor Cyan
docker exec $NGINX_CONTAINER nginx -s reload 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to reload nginx" -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host "   ✓ Nginx reloaded successfully" -ForegroundColor Green

Write-Host ""
Write-Host "✅ SUCCESS! Nginx maintenance mode is now configured" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  • Enable maintenance:  .\nginx\toggle-maintenance.ps1 -On" -ForegroundColor White
Write-Host "  • Disable maintenance: .\nginx\toggle-maintenance.ps1 -Off" -ForegroundColor White
Write-Host "  • Check status:        .\nginx\toggle-maintenance.ps1 -Status" -ForegroundColor White
Write-Host ""
Write-Host "Note: Maintenance mode is currently OFF" -ForegroundColor DarkGray
Write-Host ""
