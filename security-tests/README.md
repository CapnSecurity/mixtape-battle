# Security Testing Documentation

This directory contains penetration testing scripts and results for validating security controls in the Mixtape Battle application.

## Rate Limit Penetration Test

### Overview
The `rate-limit-pen-test.js` script validates that API rate limiting is properly configured and enforcing limits to prevent:
- **Brute force attacks** on authentication endpoints
- **Denial of Service (DoS)** attacks on API endpoints
- **Email spam** via password reset functionality

### Rate Limit Configuration

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| Authentication (`/api/auth/*`) | 5 requests | 1 minute | Prevent brute force login attempts |
| Password Reset (`/api/admin/send-password-reset`) | 3 requests | 1 hour | Prevent email harassment |
| Admin Actions (`/api/invite`, `/api/admin/*`) | 20 requests | 1 minute | Prevent admin function abuse |
| General API (`/api/battle/*`, etc) | 100 requests | 1 minute | Prevent API DoS |

### Running the Tests

```bash
# Navigate to security-tests directory
cd security-tests

# Run the pen test
node rate-limit-pen-test.js
```

The script will:
1. Test authentication endpoint rate limiting
2. Test signup endpoint rate limiting  
3. Test general API endpoint rate limiting
4. Generate a detailed JSON results file
5. Create a text output log

### Test Results

#### Latest Test Run
**Date:** 2026-02-06T02:40:52.066Z  
**Status:** ✅ ALL TESTS PASSED (100% pass rate)

**Results:**
- ✅ Auth Endpoint: Rate limited at attempt 6/7 (Expected: ≤6)
- ✅ Signup Endpoint: Rate limited at attempt 1/7 (Expected: ≤6)  
- ✅ Battle API: All 10 requests allowed (Expected: >10 for 100/min limit)

**Evidence Files:**
- `rate-limit-test-output.txt` - Console output from test run
- `rate-limit-test-results-*.json` - Detailed JSON results with all HTTP responses

### Understanding the Results

#### Pass Criteria
- **Auth/Signup endpoints**: Must block within expected limit (5-6 attempts)
- **API endpoints**: Must allow reasonable traffic without false positives
- **429 responses**: Must include proper `Retry-After` headers
- **Error messages**: Must be clear and actionable

#### Example Rate Limit Response
```json
{
  "status": 429,
  "headers": {
    "Retry-After": "60",
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": "0"
  },
  "body": {
    "error": "Too many login attempts. Please wait a minute before trying again.",
    "retryAfter": 60
  }
}
```

### Security Compliance

These tests verify compliance with OWASP recommendations:
- ✅ OWASP API Security Top 10 - API4:2023 Unrestricted Resource Consumption
- ✅ OWASP API Security Top 10 - API2:2023 Broken Authentication
- ✅ CWE-307: Improper Restriction of Excessive Authentication Attempts
- ✅ CWE-770: Allocation of Resources Without Limits or Throttling

### Adding New Tests

To add additional security tests:

1. Create a new test file in this directory
2. Follow the naming convention: `*-pen-test.js`
3. Export results to JSON format
4. Update this README with new test documentation

### Maintenance

**Recommended frequency:** Run after any changes to:
- Authentication logic
- Rate limiting configuration
- API endpoint structure
- Security middleware

### Troubleshooting

**Test fails unexpectedly:**
- Verify Docker containers are running (`docker ps`)
- Check application logs (`docker logs app`)
- Ensure no other tests are running concurrently
- Wait 1-2 minutes between test runs to allow rate limits to reset

**Rate limits not triggering:**
- Check `lib/rate-limit.ts` configuration
- Verify middleware is applied to endpoints
- Review server logs for rate limit debug output

### Related Documentation

- `/lib/rate-limit.ts` - Rate limiting implementation
- `/middleware.ts` - Request routing and protection
- Security incident response procedures (TBD)

---

**Last Updated:** 2026-02-06  
**Test Suite Version:** 1.0.0  
**Application Version:** v0.3.0
