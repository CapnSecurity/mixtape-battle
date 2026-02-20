# Render Migration Plan - themixtape.me

## Overview
Migrate mixtape-battle from local Docker hosting to Render cloud hosting with new domain themixtape.me, maintaining zero downtime by parallel deployment and DNS cutover.

## Phase 1: Pre-Migration Setup (30 min)

### 1.1 Render Account Setup
- [ ] Create/login to Render account at https://render.com
- [ ] Add payment method
- [ ] Verify email

### 1.2 Domain Preparation
- [ ] Access domain registrar for themixtape.me
- [ ] Note current nameservers (we'll change these later)
- [ ] Keep mixtape.levesques.net DNS unchanged for now

### 1.3 Email Setup - Zoho Mail
- [ ] Sign up at https://www.zoho.com/mail/
- [ ] Choose free plan (5 users, 5GB per user)
- [ ] Add domain: themixtape.me
- [ ] Create primary email: admin@themixtape.me (or preferred name)
- [ ] Keep Zoho DNS records ready (add to registrar in Phase 5)

**Zoho DNS Records (get from Zoho setup):**
```
MX Records:
Priority 10: mx.zoho.com
Priority 20: mx2.zoho.com
Priority 50: mx3.zoho.com

SPF (TXT):
v=spf1 include:zoho.com ~all

DKIM (TXT):
(Zoho will provide)

DMARC (TXT):
_dmarc.themixtape.me: v=DMARC1; p=none; rua=mailto:admin@themixtape.me
```

## Phase 2: Code Preparation (1 hour)

### 2.1 Environment Variables Audit
Current environment variables to migrate:
```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://themixtape.me
NEXTAUTH_SECRET=(keep existing or generate new)
NEXTAUTH_CSRF_TOKEN_SECRET=(keep existing or generate new)

# Email (switch from mailhog to Zoho SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=admin@themixtape.me
SMTP_PASSWORD=(from Zoho)
SMTP_FROM=admin@themixtape.me

# API Keys
LASTFM_API_KEY=(existing)
```

### 2.2 Code Changes Required
1. **Update hardcoded URLs** (if any)
   - Search for "levesques.net" in codebase
   - Replace with environment variable or themixtape.me

2. **Update email templates**
   - Change "from" address to admin@themixtape.me
   - Update any footer/branding

3. **Update CORS/allowed origins** (if applicable)

### 2.3 Database Backup
```powershell
# Backup production database before migration
docker exec mixtape-postgres pg_dump -U mixtape mixtape_battle > backup_pre_render_$(Get-Date -Format 'yyyy-MM-dd').sql
```

## Phase 3: Render Setup (1-2 hours)

### 3.1 Create PostgreSQL Database
1. **In Render Dashboard:**
   - Click "New +" → "PostgreSQL"
   - Name: `mixtape-battle-db`
   - Region: Oregon (or closest to you)
   - Plan: Starter ($7/month) - 256MB RAM, 1GB storage
   - Version: 16
   - Click "Create Database"

2. **Note connection details:**
   ```
   Internal Database URL: (use this in app)
   External Database URL: (use for local access)
   Host, Port, Database, Username, Password
   ```

3. **Restore data:**
   ```powershell
   # From local machine using External URL
   psql $RENDER_EXTERNAL_DB_URL < backup_pre_render_2026-02-20.sql
   ```

### 3.2 Create Web Service
1. **In Render Dashboard:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: CapnSecurity/mixtape-battle
   - Name: `mixtape-battle-app`
   - Region: Oregon (same as database)
   - Branch: main
   - Runtime: Docker
   - Plan: Starter ($7/month) - 512MB RAM

2. **Configure Build:**
   - Build Command: (automatic - uses Dockerfile)
   - Start Command: (automatic - uses Dockerfile CMD)

3. **Environment Variables:**
   Add all from Phase 2.1 in Render dashboard:
   - DATABASE_URL: (from Render PostgreSQL internal URL)
   - NEXTAUTH_URL: https://mixtape-battle-app.onrender.com (will change after domain setup)
   - All other variables from current production

4. **Advanced Settings:**
   - Health Check Path: `/api/health` (need to create this endpoint)
   - Auto-Deploy: Yes (on git push to main)

### 3.3 Test Render Deployment
1. Wait for initial build (~5-10 minutes)
2. Access temporary URL: `https://mixtape-battle-app.onrender.com`
3. Test:
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Database queries work
   - [ ] Add a test song
   - [ ] Email sending works (if implemented)

## Phase 4: Domain Configuration in Render (30 min)

### 4.1 Add Custom Domain to Render
1. **In Render App Settings:**
   - Go to "Settings" → "Custom Domain"
   - Click "Add Custom Domain"
   - Enter: `themixtape.me`
   - Also add: `www.themixtape.me` (optional)

2. **Note DNS records provided:**
   ```
   Type: CNAME
   Name: themixtape.me
   Value: mixtape-battle-app.onrender.com

   Type: CNAME
   Name: www
   Value: mixtape-battle-app.onrender.com
   ```

3. **SSL Certificate:**
   - Render auto-provisions Let's Encrypt SSL
   - Wait for "Verified" status

### 4.2 Update Environment Variables
Update in Render dashboard:
```
NEXTAUTH_URL=https://themixtape.me
```
Redeploy if needed.

## Phase 5: DNS Configuration (15 min - 48 hour propagation)

### 5.1 Add DNS Records at Domain Registrar
**For themixtape.me at registrar:**

**Web Application (Render):**
```
Type: CNAME
Name: @ (or themixtape.me)
Value: mixtape-battle-app.onrender.com
TTL: 300 (5 minutes for faster testing)

Type: CNAME
Name: www
Value: mixtape-battle-app.onrender.com
TTL: 300
```

**Email (Zoho):**
```
MX Records:
Priority 10: mx.zoho.com
Priority 20: mx2.zoho.com
Priority 50: mx3.zoho.com
TTL: 3600

TXT Record (SPF):
Name: @
Value: v=spf1 include:zoho.com ~all
TTL: 3600

TXT Record (DKIM):
Name: (from Zoho, usually like: zoho._domainkey)
Value: (from Zoho)
TTL: 3600

TXT Record (DMARC):
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@themixtape.me
TTL: 3600
```

### 5.2 DNS Propagation
- Initial propagation: 5-30 minutes (with TTL 300)
- Full global propagation: up to 48 hours
- Check status: https://www.whatsmydns.net/#CNAME/themixtape.me

## Phase 6: Testing & Validation (1 hour)

### 6.1 DNS Tests
```powershell
# Check DNS resolution
nslookup themixtape.me
nslookup www.themixtape.me

# Check SSL certificate
curl -I https://themixtape.me
```

### 6.2 Application Tests
- [ ] Access https://themixtape.me
- [ ] SSL certificate is valid
- [ ] Login with existing account
- [ ] All songs display correctly
- [ ] Add new song
- [ ] Battle functionality works
- [ ] Rankings display
- [ ] Comments work
- [ ] Admin functions work

### 6.3 Email Tests
**Zoho Mail:**
- [ ] Login to webmail.zoho.com
- [ ] Send test email from admin@themixtape.me
- [ ] Receive test email

**Application Email:**
- [ ] Password reset email sends
- [ ] Invite email sends
- [ ] Check spam folder if not received
- [ ] Verify SPF/DKIM headers in received email

## Phase 7: Monitoring & Optimization (Ongoing)

### 7.1 Render Monitoring
- Check logs: Render Dashboard → Logs
- Monitor metrics: CPU, Memory, Response time
- Set up alerts in Render settings

### 7.2 Cost Expectations
**Monthly Costs:**
```
Render PostgreSQL Starter: $7/month
Render Web Service Starter: $7/month
Domain renewal: ~$15/year
Zoho Mail Free: $0
---
Total: ~$14/month + $15/year domain
```

### 7.3 Performance Optimization
- [ ] Enable Render's CDN
- [ ] Configure caching headers
- [ ] Monitor database performance
- [ ] Consider upgrading plans if needed

## Phase 8: Decommission Local Setup (After 1 week stable)

### 8.1 Keep Local as Backup
- Keep docker-compose.production.yml
- Keep database backups
- Document local startup procedure
- Keep for emergency rollback

### 8.2 Update GitHub Actions
- Remove self-hosted runner (if desired)
- Update deploy.yml to deploy to Render (if needed)
- Or rely on Render's auto-deploy from GitHub

### 8.3 Update Documentation
- [ ] Update README.md with new domain
- [ ] Update PRODUCTION-README.md
- [ ] Archive local hosting docs
- [ ] Document Render deployment process

## Rollback Plan (If Needed)

If issues arise after DNS cutover:

1. **Immediate (5 minutes):**
   - Revert DNS CNAME back to old server
   - Wait for propagation (5-30 min with low TTL)

2. **Database Rollback:**
   ```powershell
   # Export from Render
   pg_dump $RENDER_EXTERNAL_DB_URL > render_backup.sql
   
   # Restore to local
   docker exec -i mixtape-postgres psql -U mixtape mixtape_battle < render_backup.sql
   ```

3. **GitHub Actions:**
   - Push code that reverts any Render-specific changes
   - Local runner will auto-deploy

## Next Steps Checklist

### Immediate
- [ ] Review this plan
- [ ] Sign up for Render
- [ ] Sign up for Zoho Mail
- [ ] Backup current production database

### Before DNS Cutover
- [ ] Deploy to Render with temporary URL
- [ ] Test thoroughly on Render URL
- [ ] Set up Zoho email
- [ ] Get approval to proceed

### DNS Cutover (Do during low-traffic time)
- [ ] Lower TTL on existing DNS records (24 hours before)
- [ ] Add DNS records at registrar
- [ ] Monitor for issues
- [ ] Test from multiple locations

### Post-Migration
- [ ] Monitor for 24-48 hours
- [ ] Verify emails working
- [ ] Check analytics/traffic
- [ ] Document any issues
- [ ] Keep local server running for 1 week

---

## Questions to Answer Before Starting

1. **Domain Registrar:** Where is themixtape.me registered?
2. **Email Address:** What should be the primary admin email?
3. **Timing:** When is the best low-traffic time for DNS cutover?
4. **Budget:** Confirm $14/month is acceptable for Render hosting
5. **Backup Access:** Do you have access to registrar and can change DNS?

## Expected Timeline

- **Render Setup & Testing:** 2-3 hours
- **DNS Propagation:** 5 minutes - 48 hours
- **Parallel Operation:** 1 week (for safety)
- **Decommission Local:** After 1 week stable
- **Total Project Time:** ~5-7 hours of active work + propagation time

---

**Ready to start? Let me know and we'll begin with Phase 1!**
