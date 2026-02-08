# Production canary tests for mixtape-battle (PowerShell)
# Run this after deployment to verify everything is working

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$FAIL_COUNT = 0
$PASS_COUNT = 0

Write-Host "🧪 Mixtape Battle - Production Canary Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing: $BaseUrl" -ForegroundColor White
Write-Host ""

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
        $status = $response.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
    }
    
    if ($status -eq $ExpectedStatus) {
        Write-Host "✅ PASS (HTTP $status)" -ForegroundColor Green
        $script:PASS_COUNT++
    } else {
        Write-Host "❌ FAIL (Expected HTTP $ExpectedStatus, got $status)" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

# Helper function to test JSON response
function Test-JsonEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedField
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $Url -UseBasicParsing -TimeoutSec 10
        $content = $response | ConvertTo-Json -Compress
        
        if ($content -match $ExpectedField) {
            Write-Host "✅ PASS" -ForegroundColor Green
            $script:PASS_COUNT++
        } else {
            Write-Host "❌ FAIL (Field '$ExpectedField' not found)" -ForegroundColor Red
            Write-Host "   Response: $content" -ForegroundColor Gray
            $script:FAIL_COUNT++
        }
    } catch {
        Write-Host "❌ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

Write-Host "📊 Basic Endpoints" -ForegroundColor Cyan
Write-Host "------------------" -ForegroundColor Cyan
Test-Endpoint -Name "Home page" -Url "$BaseUrl/"
Test-Endpoint -Name "Login page" -Url "$BaseUrl/login"
Test-Endpoint -Name "Battle page" -Url "$BaseUrl/battle" -ExpectedStatus 401  # Should require auth
Test-JsonEndpoint -Name "Health check" -Url "$BaseUrl/api/health" -ExpectedField "ok"
Write-Host ""

Write-Host "🔒 Authentication Endpoints" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
Test-JsonEndpoint -Name "CSRF token" -Url "$BaseUrl/api/csrf" -ExpectedField "token"
Test-JsonEndpoint -Name "Auth session" -Url "$BaseUrl/api/auth/session" -ExpectedField '(user|"user":null)'
Write-Host ""

Write-Host "🎵 Public API Endpoints" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan
Test-JsonEndpoint -Name "Songs list" -Url "$BaseUrl/api/songs" -ExpectedField "songs"
Test-Endpoint -Name "Battle next (unauthorized)" -Url "$BaseUrl/api/battle/next" -ExpectedStatus 401
Write-Host ""

Write-Host "📄 Static Assets" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan
Test-Endpoint -Name "Favicon" -Url "$BaseUrl/favicon.ico"
Write-Host ""

Write-Host "🐳 Docker Health" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Docker containers... " -NoNewline
    $containers = docker compose -f docker-compose.production.yml ps 2>$null
    if ($containers -match "Up") {
        Write-Host "✅ PASS (Containers running)" -ForegroundColor Green
        $PASS_COUNT++
    } else {
        Write-Host "❌ FAIL (Containers not running)" -ForegroundColor Red
        $FAIL_COUNT++
    }
    
    Write-Host "App health check... " -NoNewline
    $appStatus = docker compose -f docker-compose.production.yml ps app 2>$null
    if ($appStatus -match "healthy") {
        Write-Host "✅ PASS (Container healthy)" -ForegroundColor Green
        $PASS_COUNT++
    } else {
        Write-Host "⚠️  WARNING (Health check not passing yet)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped (Docker not available)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Test Results" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $PASS_COUNT" -ForegroundColor Green
Write-Host "❌ Failed: $FAIL_COUNT" -ForegroundColor Red
Write-Host "🔢 Total:  $($PASS_COUNT + $FAIL_COUNT)" -ForegroundColor White
Write-Host ""

if ($FAIL_COUNT -eq 0) {
    Write-Host "✨ All tests passed! Deployment looks good." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Check the logs and investigate." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Debugging commands:" -ForegroundColor Cyan
    Write-Host "  docker compose -f docker-compose.production.yml logs app" -ForegroundColor Gray
    Write-Host "  docker compose -f docker-compose.production.yml ps" -ForegroundColor Gray
    Write-Host "  Invoke-WebRequest -Uri $BaseUrl/api/health -UseBasicParsing" -ForegroundColor Gray
    exit 1
}
