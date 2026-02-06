# Nginx Maintenance Mode

Safe production-ready maintenance mode for Mixtape Battle using nginx-level request interception.

## Overview

This maintenance mode system uses nginx configuration to display a custom maintenance page **without stopping your application container**. When enabled, nginx returns a 503 status with a branded maintenance page while the app continues running in the background.

### Why Nginx-Level?

- ✅ **Production Safe**: App container keeps running
- ✅ **Database Safe**: No connection drops
- ✅ **Zero Downtime**: Instant on/off toggle
- ✅ **No Deployment**: Just a flag file check
- ✅ **Reversible**: One command to disable

## Quick Start

```powershell
# Enable maintenance mode
.\nginx\toggle-maintenance.ps1 -On

# Disable maintenance mode
.\nginx\toggle-maintenance.ps1 -Off

# Check status
.\nginx\toggle-maintenance.ps1 -Status
```

```bash
# Linux/Mac
./nginx/toggle-maintenance.sh on
./nginx/toggle-maintenance.sh off
./nginx/toggle-maintenance.sh status
```

## How It Works

### 1. Nginx Configuration
The nginx config checks for a flag file at `/usr/share/nginx/html/.maintenance`:

```nginx
set $maintenance 0;
if (-f /usr/share/nginx/html/.maintenance) {
    set $maintenance 1;
}

if ($maintenance = 1) {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    root /usr/share/nginx/html;
    rewrite ^(.*)$ /maintenance.html break;
}
```

### 2. Flag File Toggle
- **Enable**: Create the `.maintenance` file → nginx returns 503
- **Disable**: Delete the `.maintenance` file → nginx proxies to app

### 3. Maintenance Page
Custom branded HTML at `/usr/share/nginx/html/maintenance.html`:
- Mixtape Battle branding
- Animated bouncing wrench
- Music note animations
- Auto-refresh every 30 seconds
- Mobile responsive

## File Structure

```
nginx/
├── nginx.conf              # Nginx config with maintenance mode support
├── maintenance.html        # Custom maintenance page
├── toggle-maintenance.ps1  # PowerShell toggle script
├── toggle-maintenance.sh   # Bash toggle script
└── README.md              # This file
```

## Detailed Usage

### Enable Maintenance Mode

**Windows (PowerShell)**:
```powershell
.\nginx\toggle-maintenance.ps1 -On
```

**Linux/Mac (Bash)**:
```bash
./nginx/toggle-maintenance.sh on
```

**What happens**:
1. ✓ Checks if nginx container is running
2. ✓ Verifies maintenance.html exists (copies if missing)
3. ✓ Creates `.maintenance` flag file in nginx container
4. ✓ Nginx immediately starts returning 503 with maintenance page
5. ✓ App container continues running normally

**Output**:
```
🔧 Enabling Maintenance Mode...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Checking maintenance page...
   ✓ Maintenance page already exists
🚩 Activating maintenance flag...
   ✓ Maintenance flag created

✅ MAINTENANCE MODE ENABLED
   Visitors will now see the maintenance page
   App container is still running (safe for production)
```

### Disable Maintenance Mode

**Windows (PowerShell)**:
```powershell
.\nginx\toggle-maintenance.ps1 -Off
```

**Linux/Mac (Bash)**:
```bash
./nginx/toggle-maintenance.sh off
```

**What happens**:
1. ✓ Removes `.maintenance` flag file
2. ✓ Nginx immediately resumes proxying to app
3. ✓ Site back online with 200 OK

**Output**:
```
🔓 Disabling Maintenance Mode...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚩 Removing maintenance flag...
   ✓ Maintenance flag removed

✅ MAINTENANCE MODE DISABLED
   Site is now live and serving traffic normally
```

### Check Status

**Windows (PowerShell)**:
```powershell
.\nginx\toggle-maintenance.ps1 -Status
```

**Linux/Mac (Bash)**:
```bash
./nginx/toggle-maintenance.sh status
```

**Output (Active)**:
```
📊 Maintenance Mode Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Nginx container: RUNNING
⚠️  Maintenance Mode: ACTIVE
   Users will see the maintenance page
✓ App container: RUNNING
```

**Output (Inactive)**:
```
📊 Maintenance Mode Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Nginx container: RUNNING
✓ Maintenance Mode: INACTIVE
   Site is operating normally
✓ App container: RUNNING
```

## Common Use Cases

### During Deployments

```powershell
# 1. Enable maintenance mode
.\nginx\toggle-maintenance.ps1 -On

# 2. Pull latest code
git pull origin main

# 3. Rebuild and restart app
docker compose up -d --build app

# 4. Disable maintenance mode
.\nginx\toggle-maintenance.ps1 -Off
```

### Database Migrations

```powershell
# 1. Enable maintenance mode
.\nginx\toggle-maintenance.ps1 -On

# 2. Run migrations
docker exec app npx prisma migrate deploy

# 3. Disable maintenance mode
.\nginx\toggle-maintenance.ps1 -Off
```

### Testing Maintenance Page

```powershell
# Enable, check site, disable
.\nginx\toggle-maintenance.ps1 -On
Start-Process https://mixtape.levesques.net
Start-Sleep -Seconds 5
.\nginx\toggle-maintenance.ps1 -Off
```

## Manual Control

### Using Docker Commands

**Enable maintenance**:
```bash
docker exec mixtape-nginx touch /usr/share/nginx/html/.maintenance
```

**Disable maintenance**:
```bash
docker exec mixtape-nginx rm /usr/share/nginx/html/.maintenance
```

**Check if active**:
```bash
docker exec mixtape-nginx test -f /usr/share/nginx/html/.maintenance && echo "ON" || echo "OFF"
```

### Using curl to Test

**Check if maintenance mode is active**:
```bash
curl -I https://mixtape.levesques.net
# 503 = Maintenance ON
# 200 = Maintenance OFF
```

**View maintenance page**:
```bash
curl https://mixtape.levesques.net
# Returns maintenance.html if active
```

## Customizing Maintenance Page

Edit `nginx/maintenance.html` to customize:
- Message text
- Colors and styling
- Animations
- Auto-refresh interval (default: 30s)

After editing, copy to nginx container:
```powershell
docker cp .\nginx\maintenance.html mixtape-nginx:/usr/share/nginx/html/maintenance.html
```

## Troubleshooting

### Nginx Container Not Found

```
❌ ERROR: Nginx container 'mixtape-nginx' not found or not running!
```

**Solution**: Start nginx container
```bash
docker compose up -d
```

### Maintenance Page Not Deployed

```
❌ ERROR: Local maintenance.html not found
```

**Solution**: Ensure you're running from project root with `nginx/` folder present

### Site Still Shows App After Enable

**Check**:
1. Is flag file created? `docker exec mixtape-nginx ls -la /usr/share/nginx/html/.maintenance`
2. Is nginx config loaded? `docker exec mixtape-nginx nginx -t`
3. Did nginx reload? Check logs: `docker logs mixtape-nginx --tail 20`

**Solution**: Reload nginx manually
```bash
docker exec mixtape-nginx nginx -s reload
```

### Maintenance Page Sends Wrong Headers

Edit `nginx.conf` in the `@maintenance` location block to add custom headers:
```nginx
location @maintenance {
    root /usr/share/nginx/html;
    rewrite ^(.*)$ /maintenance.html break;
    add_header Retry-After 300;
    internal;
}
```

## Technical Details

### HTTP Status Code
- Returns `503 Service Unavailable` during maintenance
- Proper HTTP semantic for temporary unavailability
- Search engines won't delist your site

### Performance
- Zero app container impact
- No database connection changes
- Nginx check is in-memory (file exists)
- Sub-millisecond response time

### Security
- Nginx container has read-only file system
- Flag file created via `docker exec` (requires host access)
- No API endpoints to toggle (must have Docker access)
- Maintenance page is static HTML (no XSS risk)

### Browser Caching
Maintenance page sets appropriate cache headers:
- Auto-refresh every 30 seconds
- No permanent caching
- Users see normal site immediately after disable

## Comparison: Old vs New Method

### ❌ Old Method (Container-Based)
```powershell
# DANGER: Stops app container
.\maintenance\maintenance-mode.ps1 -On

# Problems:
- Stops app container
- Kills production site
- Database connections drop
- Requires container restart
- Several seconds downtime
```

### ✅ New Method (Nginx-Based)
```powershell
# SAFE: Only nginx flag file
.\nginx\toggle-maintenance.ps1 -On

# Benefits:
+ App container keeps running
+ Production stays healthy
+ Database connections intact
+ Instant toggle
+ Zero downtime switch
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Enable Maintenance Mode
  run: |
    ssh user@server "cd /path/to/app && ./nginx/toggle-maintenance.sh on"

- name: Deploy
  run: |
    # Your deployment steps

- name: Disable Maintenance Mode
  run: |
    ssh user@server "cd /path/to/app && ./nginx/toggle-maintenance.sh off"
```

## Related Files

- **Production Config**: `/nginx.conf` (project root - bind mounted to nginx)
- **Docker Compose**: `docker-compose.yml` (nginx service definition)
- **Nginx Container**: `mixtape-nginx` (runs nginx:alpine)

## Support

If maintenance mode isn't working:
1. Check container status: `docker ps`
2. Check nginx logs: `docker logs mixtape-nginx --tail 50`
3. Test nginx config: `docker exec mixtape-nginx nginx -t`
4. Verify flag file: `docker exec mixtape-nginx ls -la /usr/share/nginx/html/`

## License

Part of Mixtape Battle project.
