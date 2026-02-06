# Maintenance Mode Scripts

Quick scripts to enable/disable maintenance mode for Mixtape Battle without affecting the database or other services.

## Files

- **`maintenance-mode.ps1`** - PowerShell script to toggle maintenance
- **`index.html`** - Custom maintenance page with Mixtape branding

## Usage

### Enable Maintenance Mode

```powershell
cd maintenance
.\maintenance-mode.ps1 -On
```

**What happens:**
1. ✅ Stops the `app` container
2. ✅ Starts `nginx` serving a maintenance page on port 3000
3. ✅ Database, MailHog, and other services keep running

### Disable Maintenance Mode

```powershell
.\maintenance-mode.ps1 -Off
```

**What happens:**
1. ✅ Stops and removes the maintenance container
2. ✅ Restarts the `app` container
3. ✅ Site is back online

### Check Status

```powershell
.\maintenance-mode.ps1
```

Shows whether app or maintenance mode is currently active.

## What It Looks Like

The maintenance page shows:
- 🔧 Friendly "Under Maintenance" message
- 🎵 Mixtape Battle branding
- Animated design with music notes
- Mobile-responsive

## Customization

Edit `index.html` to customize:
- Colors (change gradient in `background`)
- Message text
- Emoji/icons
- Animation timing

## Technical Details

**Containers:**
- `app` - Your Next.js application
- `maintenance` - Temporary nginx container

**Port:** 3000 (same as your app)

**What Stays Running:**
- PostgreSQL database
- MailHog email testing
- Nginx reverse proxy (if configured)
- Docker network

## Troubleshooting

**App won't start after disabling maintenance:**
```powershell
docker start app
docker logs app
```

**Maintenance container already exists:**
```powershell
docker rm -f maintenance
.\maintenance-mode.ps1 -On
```

**Check what's running:**
```powershell
docker ps --filter "name=app"
docker ps --filter "name=maintenance"
```

## Quick Reference

| Action | Command |
|--------|---------|
| Enable maintenance | `.\maintenance-mode.ps1 -On` |
| Disable maintenance | `.\maintenance-mode.ps1 -Off` |
| Check status | `.\maintenance-mode.ps1` |
| View logs | `docker logs app` |
| Force cleanup | `docker rm -f maintenance` |

---

**Pro Tip:** Run this before deploying updates to give users a smooth experience instead of seeing errors during the deployment process.
