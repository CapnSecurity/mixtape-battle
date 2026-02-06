/**
 * Clean up test accounts created during security testing
 */

const BASE_URL = 'http://localhost:3000';

const testEmails = [
  'session-test-1770346500510@example.com',
  'test-valid-1770346475528@example.com'
];

async function deleteTestAccounts() {
  console.log('🧹 Cleaning up test accounts...\n');

  for (const email of testEmails) {
    console.log(`Deleting: ${email}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        console.log(`  ✅ Deleted\n`);
      } else {
        const data = await response.json();
        console.log(`  ❌ Failed: ${data.error}\n`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('✨ Cleanup complete!\n');
}

deleteTestAccounts().catch(console.error);
