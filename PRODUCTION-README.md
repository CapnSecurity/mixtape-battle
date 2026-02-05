# Production Deployment Guide

## Quick Start

### Starting Production Environment
```powershell
.\start-production.ps1
```

### Stopping Production Environment
```powershell
.\stop-production.ps1
```

### Complete Teardown (including database)
```powershell
docker-compose -f docker-compose.production.yml down -v
```

## Environment Configuration

All environment variables are stored in `.env` file, which is automatically loaded by Docker Compose.

**⚠️ IMPORTANT**: The `.env` file contains sensitive credentials and is excluded from git. Never commit it to version control.

### Setup Steps

1. Copy the example file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` with your production values:
   - Database credentials
   - NextAuth secret and URL
   - Email server configuration (Zoho/Gmail/etc)

3. Start the production environment:
   ```powershell
   .\start-production.ps1
   ```

## Architecture

The production stack consists of:

- **PostgreSQL 16** - Database (port 5432, internal only)
- **Next.js App** - Application server (port 3000, internal only)
- **Nginx** - Reverse proxy (ports 80/443, public)
- **Certbot** - SSL certificate management

## SSL/TLS Certificates

Certificates are automatically renewed by Certbot. They are stored in Docker volumes and managed by the `certbot` container.

- Certificate location: `/etc/letsencrypt/live/mixtape.levesques.net/`
- Auto-renewal: Every 12 hours (certbot checks)
- Expiration: 90 days (Let's Encrypt standard)

## Troubleshooting

### View Logs
```powershell
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker logs mixtape-app -f
docker logs mixtape-postgres -f
docker logs mixtape-nginx -f
```

### Check Container Status
```powershell
docker-compose -f docker-compose.production.yml ps
```

### Restart Specific Service
```powershell
docker-compose -f docker-compose.production.yml restart app
```

### Rebuild After Code Changes
```powershell
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache app
.\start-production.ps1
```

### Database Access
```powershell
# Connect to PostgreSQL
docker exec -it mixtape-postgres psql -U mixtape -d mixtape_battle

# Backup database
docker exec mixtape-postgres pg_dump -U mixtape mixtape_battle > backup.sql

# Restore database
docker exec -i mixtape-postgres psql -U mixtape mixtape_battle < backup.sql
```

### Authentication Issues

If you encounter sign-in redirects after updates:

1. **Clear browser cookies** - Old JWT tokens may be invalid
2. **Check logs** for JWT_SESSION_ERROR
3. **Rebuild app** if auth configuration changed:
   ```powershell
   docker-compose -f docker-compose.production.yml down
   docker-compose -f docker-compose.production.yml build --no-cache app
   .\start-production.ps1
   ```

The middleware protects all routes except:
- `/login` - Login page
- `/settings` - User settings
- `/api/auth/*` - NextAuth API routes
- Static assets (`/_next/*`, `/favicon.ico`)

After successful authentication, users are redirected to `/settings` (magic link) or `/dashboard` (credentials).

## Network Configuration

### Port Forwarding (on your router)
- Port 80 → 192.168.2.64:80 (HTTP, redirects to HTTPS)
- Port 443 → 192.168.2.64:443 (HTTPS)

### DNS Records
- Type: A Record
- Name: mixtape
- Value: 74.65.185.231 (your public IP)
- TTL: 3600

### Firewall
Ensure Windows Firewall allows inbound connections on ports 80 and 443.

## Monitoring

### Health Checks

All services have health checks configured:

- **PostgreSQL**: `pg_isready` (every 10s)
- **App**: HTTP check on `/api/health` (every 30s)
- **Nginx**: Built-in Docker health check

### Check Service Health
```powershell
docker inspect mixtape-app --format='{{.State.Health.Status}}'
docker inspect mixtape-postgres --format='{{.State.Health.Status}}'
```

## Security

### Environment Variables
- Stored in `.env` (gitignored)
- Loaded automatically by Docker Compose
- Never exposed in logs or git history

### Secrets Rotation
To rotate secrets:
1. Update `.env` file with new values
2. Restart services: `docker-compose -f docker-compose.production.yml restart`
3. For auth secrets, rebuild app: `docker-compose -f docker-compose.production.yml build --no-cache app`

### HTTPS Only
All HTTP requests are automatically redirected to HTTPS by Nginx.

## Backup Strategy

### Automated Database Backups
```powershell
# Create backup script
$backupDir = "./backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec mixtape-postgres pg_dump -U mixtape mixtape_battle > "$backupDir/backup_$timestamp.sql"
```

### Manual Backups
```powershell
# Database
docker exec mixtape-postgres pg_dump -U mixtape mixtape_battle > backup.sql

# Uploaded files (if any)
docker cp mixtape-app:/app/uploads ./uploads-backup
```

## Maintenance

### Update Next.js Version
1. Update `package.json`
2. Rebuild: `docker-compose -f docker-compose.production.yml build --no-cache app`
3. Restart: `.\stop-production.ps1` then `.\start-production.ps1`

### Database Migrations
```powershell
# Generate migration
docker exec mixtape-app npx prisma migrate dev --name migration_name

# Apply migrations
docker exec mixtape-app npx prisma migrate deploy
```

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.production.yml logs -f`
2. Verify environment variables in `.env`
3. Check container health: `docker-compose -f docker-compose.production.yml ps`
4. Review this documentation

## Important Notes

- **Database password**: Stored in `.env`, used by both PostgreSQL and app
- **NextAuth secret**: Must be at least 32 characters
- **Email credentials**: Use app-specific passwords (Zoho/Gmail)
- **Public IP**: May change if using dynamic IP (consider DDNS)
