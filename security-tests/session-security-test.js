/**
 * Session Security Settings Verification
 * Tests that session cookies have proper security attributes
 */

const BASE_URL = 'http://localhost:3000';

async function testSessionSecurity() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         Session Security Verification Test              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // First create a test user
  const testEmail = `session-test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  console.log('📝 Step 1: Creating test user...');
  const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });

  if (!signupResponse.ok) {
    console.error('❌ Failed to create test user');
    console.error(await signupResponse.text());
    process.exit(1);
  }

  console.log('✅ Test user created\n');

  // Now login to get session cookie
  console.log('🔐 Step 2: Logging in to get session cookie...');
  
  const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      callbackUrl: `${BASE_URL}/dashboard`
    })
  });

  const cookies = loginResponse.headers.get('set-cookie');
  
  console.log('\n🍪 Session Cookie Analysis:\n');
  
  if (cookies) {
    console.log('Raw Cookie Header:');
    console.log(cookies);
    console.log('\n---\n');

    const checks = {
      httpOnly: cookies.toLowerCase().includes('httponly'),
      sameSite: cookies.toLowerCase().includes('samesite=lax'),
      secure: cookies.toLowerCase().includes('secure') || process.env.NODE_ENV !== 'production',
      hasSessionToken: cookies.includes('next-auth.session-token') || cookies.includes('__Secure-next-auth.session-token')
    };

    console.log('Security Attribute Checks:');
    console.log(`  HttpOnly: ${checks.httpOnly ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  SameSite=lax: ${checks.sameSite ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Secure (production): ${checks.secure ? '✅ PASS' : '⚠️  Development mode'}`);
    console.log(`  Has session token: ${checks.hasSessionToken ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = checks.httpOnly && checks.sameSite && checks.hasSessionToken;
    
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 All session security checks PASSED!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some session security checks FAILED\n');
      process.exit(1);
    }
  } else {
    console.log('❌ No cookies received from login\n');
    console.log('Response status:', loginResponse.status);
    console.log('Response body:', await loginResponse.text());
    process.exit(1);
  }
}

testSessionSecurity().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
