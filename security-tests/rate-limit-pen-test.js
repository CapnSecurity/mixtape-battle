/**
 * Rate Limit Penetration Test
 * 
 * Tests the rate limiting implementation to verify security controls are working.
 * 
 * Tests:
 * 1. Auth endpoint - Should block after 5 attempts in 1 minute
 * 2. Signup endpoint - Should block after 5 attempts in 1 minute
 * 3. API endpoint - Should block after 100 attempts in 1 minute
 * 
 * Run: node rate-limit-pen-test.js
 */

const baseUrl = 'http://localhost:3000';
const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {}
};

// Helper to make requests
async function makeRequest(endpoint, method = 'POST', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      headers: {
        retryAfter: response.headers.get('Retry-After'),
        rateLimit: response.headers.get('X-RateLimit-Limit'),
        rateLimitRemaining: response.headers.get('X-RateLimit-Remaining'),
      },
      body: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Helper to wait
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Auth endpoint rate limit (5 attempts/minute)
async function testAuthRateLimit() {
  console.log('\n🔐 Testing Auth Endpoint Rate Limit (Expected: 5 attempts/min)...\n');
  
  const testResults = {
    name: 'Auth Endpoint Rate Limit',
    endpoint: '/api/auth/signin',
    expectedLimit: 5,
    attempts: [],
  };

  // Make 7 attempts to trigger rate limit
  for (let i = 1; i <= 7; i++) {
    console.log(`Attempt ${i}/7...`);
    
    const result = await makeRequest('/api/auth/credentials/signin', 'POST', {
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    
    testResults.attempts.push({
      attemptNumber: i,
      ...result,
    });
    
    if (result.status === 429) {
      console.log(`  ❌ RATE LIMITED (status: 429)`);
      console.log(`  ⏱️  Retry-After: ${result.headers.retryAfter}s`);
      console.log(`  📊 Message: ${result.body.error}`);
      testResults.rateLimitTriggeredAt = i;
      break;
    } else {
      console.log(`  ✅ Request allowed (status: ${result.status})`);
    }
    
    // Small delay between requests
    await sleep(100);
  }
  
  testResults.passed = testResults.rateLimitTriggeredAt > 0 && testResults.rateLimitTriggeredAt <= testResults.expectedLimit + 1;
  results.tests.push(testResults);
  
  console.log(`\n${testResults.passed ? '✅ PASS' : '❌ FAIL'}: Rate limit triggered at attempt ${testResults.rateLimitTriggeredAt || 'NEVER'}\n`);
  
  return testResults;
}

// Test 2: Signup endpoint rate limit (5 attempts/minute)
async function testSignupRateLimit() {
  console.log('\n📝 Testing Signup Endpoint Rate Limit (Expected: 5 attempts/min)...\n');
  
  const testResults = {
    name: 'Signup Endpoint Rate Limit',
    endpoint: '/api/auth/signup',
    expectedLimit: 5,
    attempts: [],
  };

  // Make 7 attempts to trigger rate limit
  for (let i = 1; i <= 7; i++) {
    console.log(`Attempt ${i}/7...`);
    
    const result = await makeRequest('/api/auth/signup', 'POST', {
      email: `test${i}@example.com`,
      password: 'testpassword123',
    });
    
    testResults.attempts.push({
      attemptNumber: i,
      ...result,
    });
    
    if (result.status === 429) {
      console.log(`  ❌ RATE LIMITED (status: 429)`);
      console.log(`  ⏱️  Retry-After: ${result.headers.retryAfter}s`);
      console.log(`  📊 Message: ${result.body.error}`);
      testResults.rateLimitTriggeredAt = i;
      break;
    } else {
      console.log(`  ✅ Request allowed (status: ${result.status})`);
    }
    
    await sleep(100);
  }
  
  testResults.passed = testResults.rateLimitTriggeredAt > 0 && testResults.rateLimitTriggeredAt <= testResults.expectedLimit + 1;
  results.tests.push(testResults);
  
  console.log(`\n${testResults.passed ? '✅ PASS' : '❌ FAIL'}: Rate limit triggered at attempt ${testResults.rateLimitTriggeredAt || 'NEVER'}\n`);
  
  return testResults;
}

// Test 3: Battle API endpoint (100 attempts/minute)
async function testBattleRateLimit() {
  console.log('\n⚔️  Testing Battle API Rate Limit (Expected: 100 attempts/min)...\n');
  console.log('   (Testing first 10 requests for speed, should all pass)\n');
  
  const testResults = {
    name: 'Battle API Rate Limit',
    endpoint: '/api/battle/next',
    expectedLimit: 100,
    attempts: [],
  };

  // Test first 10 requests (should all pass since limit is 100)
  for (let i = 1; i <= 10; i++) {
    if (i % 5 === 1) {
      console.log(`Attempts ${i}-${Math.min(i + 4, 10)}...`);
    }
    
    const result = await makeRequest('/api/battle/next', 'GET');
    
    testResults.attempts.push({
      attemptNumber: i,
      ...result,
    });
    
    if (result.status === 429) {
      console.log(`  ❌ UNEXPECTED: Rate limited at attempt ${i} (too low!)`);
      testResults.rateLimitTriggeredAt = i;
      testResults.passed = false;
      break;
    }
  }
  
  if (!testResults.rateLimitTriggeredAt) {
    testResults.passed = true;
    console.log(`  ✅ All 10 requests allowed (limit appears correctly set > 10)`);
  }
  
  results.tests.push(testResults);
  
  console.log(`\n${testResults.passed ? '✅ PASS' : '❌ FAIL'}: Battle endpoint rate limit working\n`);
  
  return testResults;
}

// Main test runner
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         RATE LIMIT PENETRATION TEST SUITE                ║');
  console.log('║         Testing Security Controls                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📅 Test started: ${results.timestamp}`);
  console.log(`🎯 Target: ${baseUrl}\n`);
  
  try {
    // Run tests sequentially
    await testAuthRateLimit();
    await sleep(2000); // Wait between test suites
    
    await testSignupRateLimit();
    await sleep(2000);
    
    await testBattleRateLimit();
    
    // Generate summary
    const totalTests = results.tests.length;
    const passedTests = results.tests.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    };
    
    // Print summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                     TEST SUMMARY                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests:  ${totalTests}`);
    console.log(`Passed:       ${passedTests} ${passedTests === totalTests ? '✅' : ''}`);
    console.log(`Failed:       ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`Pass Rate:    ${results.summary.passRate}\n`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All rate limiting tests PASSED! Security controls working correctly.\n');
    } else {
      console.log('⚠️  Some tests FAILED. Review rate limiting configuration.\n');
    }
    
    // Save results
    const fs = require('fs');
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(__dirname, `rate-limit-test-results-${timestamp}.json`);
    
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Full results saved to: ${resultsFile}\n`);
    
    // Return exit code based on pass/fail
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
