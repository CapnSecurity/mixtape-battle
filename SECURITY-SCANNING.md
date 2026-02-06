# Security Scanning

This project uses a minimal, fast scanning routine.

## Quick Run
- npm run security:scan

## Scripts
- Windows PowerShell: scripts/security-scan.ps1
- Linux/macOS: scripts/security-scan.sh

## Optional Trivy
If you install Trivy, the scripts will run a filesystem scan in addition to npm audit.
- https://github.com/aquasecurity/trivy

## Notes
- The audit uses high severity as a baseline.
- If the project is private and locked down, treat findings as a prompt for review, not an automatic blocker.
