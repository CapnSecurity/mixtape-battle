param(
    [switch]$Full
)

$failed = $false

Write-Host "Running npm audit (high severity and above)..."
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) {
    $failed = $true
}

if (Get-Command trivy -ErrorAction SilentlyContinue) {
    Write-Host "Running Trivy filesystem scan..."
    $args = @("fs", "--scanners", "vuln,secret,config", ".")
    & trivy @args
    if ($LASTEXITCODE -ne 0) {
        $failed = $true
    }
} else {
    Write-Host "Trivy not installed; skipping filesystem scan."
}

if ($failed) {
    exit 1
}

exit 0
