# Mixtape Battle - TODO List

## Immediate Priorities

### Security Hardening (In Progress)
- [x] Password policy enforcement (v0.3.1)
- [x] Session security hardening (v0.3.1)
- [x] Admin role management (v0.3.1)
- [x] Account enumeration prevention (v0.3.2)
- [x] Error message sanitization (v0.3.2)
- [ ] Input validation & XSS protection (30 min)
- [ ] Email verification (45 min)

### Git Workflow Migration
- [ ] Migrate `release/v0.3.0` to `main` branch
- [ ] Create `develop` branch
- [ ] Set GitHub default branch to `main`
- [ ] Clean up old release branches
- [ ] Update deployment scripts to use `main`

## Backlog

### Features
- [ ] Battle vote limits (when user base grows)
  - 100 votes per day per user
  - 5-second cooldown between votes
  - 3 votes max per song pairing

### Security (Lower Priority)
- [ ] CSRF protection audit
- [ ] Session token rotation
- [ ] API input validation improvements

### Infrastructure
- [ ] Consider Redis for distributed rate limiting (if scaling)
- [ ] Add monitoring/logging service
- [ ] Set up automated backups

### Testing
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Automated security scanning

## Completed ✅

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
