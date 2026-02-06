/**
 * Test valid passwords only
 */

const BASE_URL = 'http://localhost:3000';

async function testValidPasswords() {
  console.log('\n🧪 Testing valid strong password: "SecurePass123!"\n');
  
  const testEmail = `test-valid-${Date.now()}@example.com`;
  
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePass123!'
    })
  });

  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, data);
  
  if (response.status === 200) {
    console.log('\n✅ SUCCESS - Strong password accepted!\n');
    process.exit(0);
  } else {
    console.log('\n❌ FAILED - Strong password rejected\n');
    process.exit(1);
  }
}

testValidPasswords().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
