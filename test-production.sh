#!/bin/bash
# Production canary tests for mixtape-battle
# Run this after deployment to verify everything is working

set -e

BASE_URL="${1:-http://localhost:3000}"
FAIL_COUNT=0
PASS_COUNT=0

echo "🧪 Mixtape Battle - Production Canary Tests"
echo "=========================================="
echo "Testing: $BASE_URL"
echo ""

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ PASS (HTTP $response)"
        ((PASS_COUNT++))
    else
        echo "❌ FAIL (Expected HTTP $expected_status, got $response)"
        ((FAIL_COUNT++))
    fi
}

# Helper function to test JSON response
test_json_endpoint() {
    local name="$1"
    local url="$2"
    local expected_field="$3"
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$http_code" = "200" ] && echo "$response" | grep -q "$expected_field"; then
        echo "✅ PASS"
        ((PASS_COUNT++))
    else
        echo "❌ FAIL (HTTP $http_code, looking for '$expected_field')"
        echo "   Response: $response"
        ((FAIL_COUNT++))
    fi
}

echo "📊 Basic Endpoints"
echo "------------------"
test_endpoint "Home page" "$BASE_URL/"
test_endpoint "Login page" "$BASE_URL/login"
test_endpoint "Battle page" "$BASE_URL/battle" "401"  # Should require auth
test_json_endpoint "Health check" "$BASE_URL/api/health" "ok"
echo ""

echo "🔒 Authentication Endpoints"
echo "---------------------------"
test_endpoint "CSRF token" "$BASE_URL/api/csrf"
test_endpoint "Auth session" "$BASE_URL/api/auth/session"
echo ""

echo "🎵 Public API Endpoints"
echo "-----------------------"
test_json_endpoint "Songs list" "$BASE_URL/api/songs" "songs"
test_endpoint "Battle next (unauthorized)" "$BASE_URL/api/battle/next" "401"
echo ""

echo "📄 Static Assets"
echo "----------------"
test_endpoint "Favicon" "$BASE_URL/favicon.ico"
echo ""

echo "🐳 Docker Health"
echo "----------------"
if command -v docker &> /dev/null; then
    echo -n "Docker containers... "
    if docker compose -f docker-compose.production.yml ps | grep -q "Up"; then
        echo "✅ PASS (Containers running)"
        ((PASS_COUNT++))
    else
        echo "❌ FAIL (Containers not running)"
        ((FAIL_COUNT++))
    fi
    
    echo -n "App health check... "
    if docker compose -f docker-compose.production.yml ps app | grep -q "healthy"; then
        echo "✅ PASS (Container healthy)"
        ((PASS_COUNT++))
    else
        echo "⚠️  WARNING (Health check not passing yet)"
    fi
else
    echo "⏭️  Skipped (Docker not available)"
fi
echo ""

echo "=========================================="
echo "📊 Test Results"
echo ""
echo "✅ Passed: $PASS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "🔢 Total:  $((PASS_COUNT + FAIL_COUNT))"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✨ All tests passed! Deployment looks good."
    exit 0
else
    echo "⚠️  Some tests failed. Check the logs and investigate."
    echo ""
    echo "Debugging commands:"
    echo "  docker compose -f docker-compose.production.yml logs app"
    echo "  docker compose -f docker-compose.production.yml ps"
    echo "  curl -v $BASE_URL/api/health"
    exit 1
fi
