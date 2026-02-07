# Mixtape Battle - TODO List

## Immediate Priorities

### Security Hardening
- [x] Password policy enforcement (v0.3.1)
- [x] Session security hardening (v0.3.1)
- [x] Admin role management (v0.3.1)
- [x] Account enumeration prevention (v0.3.2)
- [x] Error message sanitization (v0.3.2)
- [x] Input validation & XSS protection (v0.3.3)
- [x] ~~Email verification~~ (Not needed - invite system already verifies emails)

### Git Workflow Migration
- [x] Migrate `release/v0.3.0` to `main` branch ✅
- [x] Create `develop` branch ✅
- [x] Set GitHub default branch to `main` ✅
- [x] Clean up old release branches ✅
- [x] Update WORKFLOW.md documentation ✅

## Backlog (Prioritized)

### High Impact / Short Time
- [ ] Docker rootless mode (defer until cloud migration)
- [ ] Add monitoring/logging service
- [ ] Set up CI/CD pipeline

### Medium Impact / Short Time
- [ ] Add integration tests
- [ ] Database connection SSL/TLS (deprioritized for Docker-only network)

### Medium Impact / Longer Time
- [ ] **Battle System Revamp**
  - User settings for battle preferences (genre, decade, etc.)
  - Weighted random selection based on preferences
  - Smart pairing algorithm (avoid repeat battles)
  - Battle history tracking
  - Skip functionality with cooldown

### Low Impact / Longer Time
- [ ] Battle vote limits (when user base grows)
  - 100 votes per day per user
  - 5-second cooldown between votes
  - 3 votes max per song pairing

### Cloud Planning
- [ ] Plan migration to cloud hosting (Render)

## Completed ✅

### Version 0.3.6 (February 6, 2026)
- ✅ Session token rotation (JWT `iat`/`exp` refresh on `updateAge`)

### Version 0.3.5 (February 6, 2026)
- ✅ CSRF protection for critical POST/DELETE actions
- ✅ CSRF token endpoint and client hook
- ✅ Admin-only protection for update-links
- ✅ Battle vote endpoint now requires auth

### Version 0.3.4 (February 6, 2026)
- ✅ Enhanced security headers (nginx)
- ✅ Content-Security-Policy with strict resource loading rules
- ✅ Referrer-Policy for privacy protection
- ✅ Permissions-Policy to restrict browser features

### Version 0.3.3 (February  6, 2026)
- ✅ XSS protection with DOMPurify
- ✅ Input validation and sanitization
- ✅ Song input validation (title, artist, album, year)
- ✅ HTML tag stripping from user inputs
- ✅ Results page expanded to show ALL songs
- ✅ Top 10 badges added to results page

### Version 0.3.2 (February 6, 2026)
- ✅ Account enumeration prevention (signup, password reset)
- ✅ Error message sanitization (6 API routes)
- ✅ Error handling utility library
- ✅ Nginx-based maintenance mode
- ✅ Maintenance mode toggle scripts (PowerShell + Bash)
- ✅ Custom branded maintenance page

### Version 0.3.1 (February 6, 2026)
- ✅ Admin role toggle functionality
- ✅ Password policy enforcement (8+ chars, upper, lower, number, special)
- ✅ Session security (7-day expiration, secure cookies)
- ✅ Comprehensive rate limiting
- ✅ Security testing suite

### Version 0.3.0 (Previous)
- ✅ Password reset feature
- ✅ Admin password reset UI
- ✅ Middleware authentication fixes
- ✅ Settings page token verification

---

**Last Updated:** February 6, 2026
