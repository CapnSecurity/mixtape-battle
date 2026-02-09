# Pre-deployment validation script
# Run this before pushing to prod to catch common issues

param(
    [switch]$Fix
)

$ErrorActionPreference = "Continue"
$issues = @()
$warnings = @()

Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Cyan
Write-Host ""

# Check 1: Verify all files are committed
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
if (-not $env:CI) {
    # Only check for uncommitted changes when running locally
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        $issues += "Uncommitted changes detected:"
        $gitStatus | ForEach-Object { $issues += "  $_" }
    }
} else {
    Write-Host "   ⏭️  Skipping uncommitted changes check (CI environment)" -ForegroundColor Gray
}

# Check 2: Find orphaned routes (routes that exist but aren't linked to)
Write-Host "🔍 Checking for orphaned routes..." -ForegroundColor Yellow
$appDir = "app"
$routeFiles = Get-ChildItem -Path $appDir -Recurse -Include "page.tsx","page.ts" | Where-Object { $_.FullName -notmatch "\\node_modules\\" }

foreach ($routeFile in $routeFiles) {
    $relativePath = $routeFile.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $routePath = $relativePath -replace "app/", "/" -replace "/page\.tsx?", ""
    
    # Skip API routes and special routes
    if ($routePath -match "^/api/" -or $routePath -match "^\/_" -or $routePath -eq "/") {
        continue
    }
    
    # Search for references to this route in the codebase
    $searchPattern = $routePath.Replace("/[", "/\[") # Escape dynamic segments
    $references = git grep -l "$searchPattern" -- "*.tsx" "*.ts" "*.jsx" "*.js" 2>$null
    
    if (-not $references) {
        $warnings += "Route may be orphaned (no references found): $routePath"
        $warnings += "  File: $relativePath"
    }
}

# Check 3: Find broken route references
Write-Host "🔗 Checking for broken route references..." -ForegroundColor Yellow
$linkPattern = 'href=["'']/(.*?)["'']'
$allFiles = Get-ChildItem -Path $appDir -Recurse -Include "*.tsx","*.ts" | Where-Object { 
    $_.FullName -notmatch "\\node_modules\\" -and 
    $_.PSIsContainer -eq $false -and
    (Test-Path $_.FullName -PathType Leaf)
}

# Build a set of valid routes from the filesystem
$validRoutes = @{}
foreach ($routeFile in $routeFiles) {
    $relativePath = $routeFile.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $routePath = $relativePath -replace "app/", "/" -replace "/page\.tsx?", ""
    $validRoutes[$routePath] = $true
}

foreach ($file in $allFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $matches = [regex]::Matches($content, $linkPattern)
        
        foreach ($match in $matches) {
            $route = "/" + $match.Groups[1].Value
            
            # Skip external links, anchors, API routes, and query strings
            if ($route -match "^/http" -or $route -match "^/#" -or $route -match "^/api/" -or $route -eq "/") {
                continue
            }
            
            # Remove query strings
            if ($route -match "\?|&") {
                $route = $route -replace "\?.*", ""
            }
            
            # Skip routes with dynamic segments (we can't validate these easily)
            if ($route -match '\[.*?\]') {
                continue
            }
            
            # Check if this route exists in our valid routes set
            if (-not $validRoutes.ContainsKey($route)) {
                $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
                $issues += "Broken route reference: $route"
                $issues += "  Referenced in: $relativePath"
            }
        }
    } catch {
        # Skip files that can't be read
        continue
    }
}

# Check 4: Verify duplicate routes don't exist
Write-Host "🔄 Checking for duplicate/conflicting routes..." -ForegroundColor Yellow
$routePaths = @{}
foreach ($routeFile in $routeFiles) {
    $relativePath = $routeFile.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $routePath = $relativePath -replace "app/", "/" -replace "/page\.tsx?", ""
    
    if ($routePaths.ContainsKey($routePath)) {
        $issues += "Duplicate route detected: $routePath"
        $issues += "  File 1: $($routePaths[$routePath])"
        $issues += "  File 2: $relativePath"
    } else {
        $routePaths[$routePath] = $relativePath
    }
}

# Check 5: Verify production environment file exists
Write-Host "📝 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.production")) {
    $warnings += ".env.production file not found (production may use defaults)"
}

# Check 6: Ensure docker-compose files are valid
Write-Host "🐳 Validating Docker Compose files..." -ForegroundColor Yellow
if (Test-Path "docker-compose.production.yml") {
    $composeCheck = docker compose -f docker-compose.production.yml config 2>&1
    if ($LASTEXITCODE -ne 0) {
        $issues += "docker-compose.production.yml validation failed:"
        $issues += "  $composeCheck"
    }
}

# Display results
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Pre-Deployment Check Results" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ ISSUES FOUND ($($issues.Count)):" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please fix these issues before deploying to production." -ForegroundColor Red
    
    # Add to GitHub Actions summary if in CI
    if ($env:GITHUB_STEP_SUMMARY) {
        Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value "## ❌ Pre-deployment Validation Failed"
        Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value ""
        Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value "**Issues found:** $($issues.Count)"
        Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value ""
        foreach ($issue in $issues) {
            Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value "- $issue"
        }
    }
    
    exit 1
} else {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    if (-not $env:CI) {
        Write-Host "Ready to deploy:" -ForegroundColor Cyan
        Write-Host "  git push origin main" -ForegroundColor White
        Write-Host ""
    }
    exit 0
}
