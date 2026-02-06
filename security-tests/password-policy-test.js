/**
 * Password Policy Enforcement Test
 * Tests that password validation is working correctly
 */

const BASE_URL = 'http://localhost:3000';

// Test cases
const passwordTests = [
  {
    name: 'Too short (7 chars)',
    password: 'Pass1!a',
    shouldFail: true,
    expectedError: 'at least 8 characters'
  },
  {
    name: 'No uppercase',
    password: 'password1!',
    shouldFail: true,
    expectedError: 'uppercase letter'
  },
  {
    name: 'No lowercase',
    password: 'PASSWORD1!',
    shouldFail: true,
    expectedError: 'lowercase letter'
  },
  {
    name: 'No number',
    password: 'Password!',
    shouldFail: true,
    expectedError: 'number'
  },
  {
    name: 'No special char',
    password: 'Password1',
    shouldFail: true,
    expectedError: 'special character'
  },
  {
    name: 'Valid strong password',
    password: 'SecurePass123!',
    shouldFail: false,
    expectedError: null
  },
  {
    name: 'Valid with all requirements',
    password: 'MyP@ssw0rd',
    shouldFail: false,
    expectedError: null
  }
];

async function testPasswordPolicy() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     Password Policy Enforcement Test                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  for (const test of passwordTests) {
    const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log(`   Password: "${test.password}"`);
      
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: test.password
        })
      });

      const data = await response.json();
      
      const testResult = {
        name: test.name,
        password: test.password,
        expectedToFail: test.shouldFail,
        actuallyFailed: response.status !== 200,
        responseStatus: response.status,
        responseData: data
      };

      // Validate the result
      if (test.shouldFail) {
        // Should have failed with 400 and error message
        if (response.status === 400 && data.error) {
          const hasExpectedError = test.expectedError ? 
            JSON.stringify(data).toLowerCase().includes(test.expectedError.toLowerCase()) : 
            true;
          
          if (hasExpectedError) {
            console.log(`   ✅ PASS - Correctly rejected`);
            console.log(`      Status: ${response.status}`);
            console.log(`      Error: ${data.error}`);
            if (data.details) console.log(`      Details: ${data.details.join(', ')}`);
            results.passed++;
            testResult.passed = true;
          } else {
            console.log(`   ❌ FAIL - Wrong error message`);
            console.log(`      Expected error containing: "${test.expectedError}"`);
            console.log(`      Got: ${JSON.stringify(data)}`);
            results.failed++;
            testResult.passed = false;
          }
        } else {
          console.log(`   ❌ FAIL - Should have been rejected but wasn't`);
          console.log(`      Status: ${response.status}`);
          console.log(`      Response: ${JSON.stringify(data)}`);
          results.failed++;
          testResult.passed = false;
        }
      } else {
        // Should have succeeded
        if (response.status === 200) {
          console.log(`   ✅ PASS - Correctly accepted strong password`);
          console.log(`      Status: ${response.status}`);
          results.passed++;
          testResult.passed = true;
        } else {
          console.log(`   ❌ FAIL - Should have been accepted but was rejected`);
          console.log(`      Status: ${response.status}`);
          console.log(`      Response: ${JSON.stringify(data)}`);
          results.failed++;
          testResult.passed = false;
        }
      }

      results.tests.push(testResult);

    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      results.failed++;
      results.tests.push({
        name: test.name,
        error: error.message,
        passed: false
      });
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const total = results.passed + results.failed;
  const passRate = ((results.passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  if (results.failed === 0) {
    console.log('🎉 All password policy tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Review the output above.\n');
  }

  // Save results to file
  const timestamp = new Date().toISOString();
  const resultsFile = `password-policy-test-results-${timestamp.replace(/:/g, '-')}.json`;
  
  const fs = require('fs');
  fs.writeFileSync(
    resultsFile,
    JSON.stringify({ timestamp, results }, null, 2)
  );
  
  console.log(`Results saved to: ${resultsFile}\n`);

  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run the test
testPasswordPolicy().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
