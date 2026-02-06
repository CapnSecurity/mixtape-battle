# Security Incident Response

This guide is a short checklist for handling security incidents in Mixtape Battle.

## Severity Levels
- Low: Suspicious activity with no impact.
- Medium: Confirmed issue with limited impact.
- High: Active compromise or data exposure.
- Critical: Widespread compromise or service disruption.

## Immediate Actions
1. Record time, reporter, and observed symptoms.
2. Preserve evidence. Do not delete logs or containers.
3. Identify scope: affected endpoints, users, and systems.

## Evidence Collection
- Nginx access log: ./nginx-logs/access.log
- Nginx error log: ./nginx-logs/error.log
- IPBan log: C:\Program Files\IPBan\logfile.txt
- Docker logs:
  - docker logs mixtape-nginx
  - docker logs mixtape-app
  - docker logs mixtape-postgres
- Firewall rules:
  - Get-NetFirewallRule -DisplayName "IPBan_Block_*"

## Containment
- Block offending IPs (IPBan or firewall rule).
- Enable maintenance mode if needed.
- Rotate secrets if there is any sign of exposure:
  - NEXTAUTH_SECRET
  - Database credentials
  - SMTP credentials

## Eradication
- Patch the root cause.
- Remove malicious files or changes.
- Validate with logs and a clean restart.

## Recovery
- Restore service.
- Monitor for recurrence (logs and IPBan).
- Communicate status to stakeholders.

## Post-Incident
- Write a short summary: what happened, impact, fix, and timeline.
- Add regression tests or monitoring where possible.
- Update this document if gaps were found.

## Incident Record Template
- Date/time (start/end):
- Reporter:
- Severity:
- Impact:
- Root cause:
- Fix applied:
- Follow-ups:
