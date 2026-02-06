# Mixtape Battle - Production Deployment Plan

## Overview
This document outlines the plan for deploying Mixtape Battle to production on your home server with nginx reverse proxy, SSL/TLS, and proper security hardening.

## Architecture

```
Internet → Router (Port Forwarding) → Nginx Container (443/80) → Next.js App Container (3000)
                                      ↓
                                  PostgreSQL Container (5432)
                                      ↓
                                  Mail Server (SMTP)
```

## Phase 1: Prerequisites

### 1.1 Domain Setup
- [ ] Point your domain DNS A record to your public IP
- [ ] Set up dynamic DNS if you don't have a static IP (e.g., DuckDNS, No-IP)
- [ ] Configure MX records if hosting email yourself
- [ ] Add SPF/DKIM/DMARC records for email authentication

### 1.2 Network Configuration
- [ ] Reserve static local IP for your server in router DHCP
- [ ] Configure port forwarding in router:
  - Port 80 (HTTP) → Server:80
  - Port 443 (HTTPS) → Server:443
  - Port 25 (SMTP) → Server:25 (if self-hosting email)
  - Port 587 (Submission) → Server:587 (if self-hosting email)

### 1.3 SSL/TLS Certificates
**Option A: Let's Encrypt (Recommended)**
- Free, auto-renewing certificates
- Use certbot in nginx container
- Automatic renewal every 90 days

**Option B: Self-Signed (Development/Internal Only)**
- Not trusted by browsers
- Only for testing

## Phase 2: Docker Infrastructure

### 2.1 Production Docker Compose Structure

```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot-data:/var/www/certbot:ro
      - certbot-conf:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-data:/var/www/certbot
      - certbot-conf:/etc/letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - DATABASE_URL=${DATABASE_URL}
      - EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
      - EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
      - EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
      - EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
      - EMAIL_FROM=${EMAIL_FROM}
    volumes:
      - ./prisma:/app/prisma
      - ./public:/app/public
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network
    expose:
      - "3000"

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=mixtape
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network
    expose:
      - "5432"

volumes:
  postgres-data:
  certbot-data:
  certbot-conf:

networks:
  app-network:
    driver: bridge
```

### 2.2 Nginx Configuration (Production-Hardened)

```nginx
# nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HTTP Redirect to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Let's Encrypt validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Certificates
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;

        # HSTS (force HTTPS for 1 year)
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

        # Security Headers
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self';" always;

        # Proxy to Next.js
        location / {
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 90s;
            proxy_connect_timeout 90s;
            proxy_send_timeout 90s;
        }

        # Rate limit API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_conn addr 10;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Stricter rate limit for auth endpoints
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            limit_conn addr 5;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static file caching
        location /_next/static/ {
            proxy_pass http://app:3000;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 2.3 Production Dockerfile

```dockerfile
# Dockerfile.prod

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Phase 3: Environment Configuration

### 3.1 Production Environment Variables (.env.production)

```env
# Database
DATABASE_URL=postgresql://dbuser:dbpassword@db:5432/mixtape
DB_USER=dbuser
DB_PASSWORD=STRONG_PASSWORD_HERE

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=GENERATE_STRONG_SECRET_HERE

# Email (Production SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com  # or your SMTP server
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Mixtape Battle <noreply@yourdomain.com>"

# Optional: Sentry for error tracking
# SENTRY_DSN=your-sentry-dsn
```

**Generate Secrets:**
```bash
# NEXTAUTH_SECRET (Unix/Mac)
openssl rand -base64 32

# NEXTAUTH_SECRET (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# DB_PASSWORD
pwgen -s 32 1  # or use a password manager
```

### 3.2 Next.js Configuration Updates

Add to `next.config.js`:
```javascript
module.exports = {
  output: 'standalone', // For Docker optimization
  poweredByHeader: false, // Remove X-Powered-By header
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};
```

## Phase 4: Email Configuration

### Option A: Gmail SMTP (Easiest)
1. Enable 2FA on Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `EMAIL_SERVER_PASSWORD`

### Option B: Self-Hosted Mail Server
**Docker Mail Server (recommended):**
- Use `docker-mailserver/docker-mailserver` image
- Configure SPF, DKIM, DMARC
- Set up port 25, 587, 993
- **Warning:** Residential IPs often blocked by spam filters

### Option C: Third-Party SMTP
- SendGrid (Free tier: 100 emails/day)
- Mailgun (Free tier: 5000 emails/month)
- AWS SES (Very cheap, $0.10/1000 emails)

## Phase 5: Security Hardening

### 5.1 Firewall Rules (UFW on Ubuntu)
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SMTP (if self-hosting email)
sudo ufw allow 25/tcp
sudo ufw allow 587/tcp

# Enable firewall
sudo ufw enable
```

### 5.2 Fail2Ban (Brute Force Protection)
```bash
sudo apt install fail2ban

# Create jail for nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 3600
```

```bash
# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verify service status
sudo systemctl status fail2ban
sudo fail2ban-client status
sudo fail2ban-client status nginx-limit-req
```

**Testing Fail2Ban (safe approach):**
1. Temporarily lower thresholds in `jail.local` (e.g., `maxretry = 3`, `findtime = 60`, `bantime = 600`).
2. Reload Fail2Ban:
  ```bash
  sudo systemctl restart fail2ban
  ```
3. Trigger rate-limit bans by hitting the site repeatedly from one IP.
4. Confirm the ban:
  ```bash
  sudo fail2ban-client status nginx-limit-req
  ```
5. Unban your IP after testing:
  ```bash
  sudo fail2ban-client set nginx-limit-req unbanip <YOUR_IP>
  ```

### 5.3 Database Security
- Use strong passwords (32+ characters)
- Database not exposed to internet (Docker internal network only)
- Regular backups to encrypted storage
- Enable PostgreSQL SSL/TLS for connections

### 5.3.1 Session Token Rotation
- Session tokens rotate every 24 hours (`updateAge`) with a 7-day max lifetime.
- No action required for users; rotation is automatic on active sessions.

### 5.4 Docker Security
```bash
# Run Docker daemon in rootless mode
# Limit container resources
# Use Docker secrets for sensitive data
# Regular image updates
```

## Phase 6: Deployment Steps

### 6.1 Initial Setup
```bash
# 1. Clone repository
git clone <repo> /opt/mixtape-battle
cd /opt/mixtape-battle

# 2. Create production environment file
cp .env.example .env.production
nano .env.production  # Edit with production values

# 3. Create nginx directory
mkdir -p nginx/ssl

# 4. Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# 5. Get SSL certificate (first time)
docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com --agree-tos --no-eff-email

# 6. Restart nginx to load SSL
docker-compose -f docker-compose.prod.yml restart nginx

# 7. Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 8. Seed database (optional)
docker-compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### 6.2 Updates/Maintenance
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 6.3 Backup Strategy
```bash
# Database backup (daily cron job)
0 2 * * * docker-compose -f /opt/mixtape-battle/docker-compose.prod.yml exec -T db \
  pg_dump -U dbuser mixtape | gzip > /backup/mixtape-$(date +\%Y\%m\%d).sql.gz

# Retain backups for 30 days
find /backup -name "mixtape-*.sql.gz" -mtime +30 -delete

# Upload to S3/Backblaze/etc. (encrypted)
```

## Phase 7: Monitoring

### 7.1 Health Checks
- Nginx health endpoint: `https://yourdomain.com/health`
- Database connection monitoring
- Disk space alerts
- SSL certificate expiry alerts

### 7.2 Logging
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx

# Log rotation (Docker handles this automatically)
```

### 7.3 Optional: Monitoring Tools
- **Uptime Kuma** (self-hosted uptime monitoring)
- **Grafana + Prometheus** (metrics dashboard)
- **Sentry** (error tracking)
- **Plausible/Umami** (privacy-friendly analytics)

## Phase 8: Router Configuration

### 8.1 Port Forwarding
```
External Port → Internal IP:Port
80 → 192.168.1.X:80
443 → 192.168.1.X:443
25 → 192.168.1.X:25 (if self-hosting email)
587 → 192.168.1.X:587 (if self-hosting email)
```

### 8.2 Dynamic DNS (if no static IP)
Use services like:
- DuckDNS (free, simple)
- No-IP (free tier available)
- Your domain registrar's DDNS service

Setup cron job to update IP:
```bash
*/5 * * * * curl "https://www.duckdns.org/update?domains=yourdomain&token=YOUR_TOKEN"
```

## Security Checklist

- [ ] Strong passwords (32+ chars) for all services
- [ ] HTTPS enforced (HSTS enabled)
- [ ] Security headers configured
- [ ] Rate limiting on auth endpoints
- [ ] Database not exposed to internet
- [ ] Regular backups (encrypted, off-site)
- [ ] UFW firewall enabled
- [ ] Fail2Ban configured
- [ ] Docker rootless mode (optional)
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Monitor logs for suspicious activity
- [ ] SSL certificate auto-renewal working
- [ ] Email SPF/DKIM/DMARC configured
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] No secrets in git repository
- [ ] Docker images regularly updated
- [ ] Disable SSH password auth (use keys only)

## Rollback Plan

### If something goes wrong:
```bash
# Stop production containers
docker-compose -f docker-compose.prod.yml down

# Restore from backup
gunzip < /backup/mixtape-YYYYMMDD.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T db psql -U dbuser mixtape

# Roll back code
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d --build
```

## Performance Optimization

### After deployment:
- [ ] Enable Cloudflare (free CDN + DDoS protection)
- [ ] Configure browser caching
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable gzip/brotli compression (nginx)
- [ ] Database query optimization
- [ ] Redis for session storage (optional)
- [ ] CDN for static assets (optional)

## Estimated Costs

**Self-Hosted (Your Computer):**
- Electricity: ~$5-15/month
- Domain: ~$10-15/year
- Dynamic DNS: Free
- SSL: Free (Let's Encrypt)
- **Total: ~$10-30/month**

**Cloud Hosting (For Comparison):**
- VPS (Linode/DigitalOcean): $10-20/month
- Database: $15/month
- Email service: $0-10/month
- CDN: $0-20/month
- **Total: $25-65/month**

## Next Steps

When ready to deploy:
1. Review this plan thoroughly
2. Set up domain DNS
3. Configure router port forwarding
4. Create all configuration files
5. Test in staging environment first
6. Deploy to production
7. Monitor for 24-48 hours closely
8. Set up automated backups
9. Configure monitoring/alerts

## Resources

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Nginx Security Headers](https://securityheaders.com/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Last Updated:** February 4, 2026  
**Status:** Planning Phase  
**Target Deployment Date:** TBD
