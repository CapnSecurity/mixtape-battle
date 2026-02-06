#!/bin/bash

failed=0

echo "Running npm audit (high severity and above)..."
if ! npm audit --audit-level=high; then
  failed=1
fi

if command -v trivy >/dev/null 2>&1; then
  echo "Running Trivy filesystem scan..."
  if ! trivy fs --scanners vuln,secret,config .; then
    failed=1
  fi
else
  echo "Trivy not installed; skipping filesystem scan."
fi

exit $failed
