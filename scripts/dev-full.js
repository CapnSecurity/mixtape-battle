// Cross-platform full dev environment startup script
const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');

// Parse .env.development file
function loadEnvFile(filename) {
  try {
    const envPath = path.join(__dirname, '..', filename);
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          env[key.trim()] = value;
        }
      }
    });
    return env;
  } catch (err) {
    console.error(`Could not load ${filename}:`, err.message);
    return {};
  }
}

async function main() {
  console.log('🚀 Starting full dev environment...\n');

  // Step 1: Start Docker services
  console.log('📦 Starting Docker containers...');
  try {
    execSync('docker compose up -d', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to start Docker containers');
    process.exit(1);
  }

  // Step 2: Wait for Postgres
  console.log('\n⏳ Waiting for Postgres...');
  try {
    execSync('node ./scripts/wait-for-postgres.js', { stdio: 'inherit' });
  } catch (err) {
    console.error('Postgres did not become available');
    process.exit(1);
  }

  // Step 3: Load dev environment variables
  console.log('\n📝 Loading development environment...');
  const devEnv = loadEnvFile('.env.development');
  const envForPrisma = { ...process.env, ...devEnv };

  // Step 4: Prisma DB push
  console.log('\n🔄 Syncing database schema...');
  try {
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: envForPrisma 
    });
  } catch (err) {
    console.error('Failed to sync database schema');
    process.exit(1);
  }

  // Step 5: Prisma DB seed
  console.log('\n🌱 Seeding database...');
  try {
    execSync('npx prisma db seed', { 
      stdio: 'inherit',
      env: envForPrisma 
    });
  } catch (err) {
    console.error('Failed to seed database');
    process.exit(1);
  }

  // Step 6: Seed dev accounts
  console.log('\n👤 Creating dev test accounts...');
  try {
    execSync('node ./prisma/seed-dev-accounts.js', { 
      stdio: 'inherit',
      env: envForPrisma 
    });
  } catch (err) {
    console.error('Failed to seed dev accounts');
    process.exit(1);
  }

  // Step 7: Start Next.js dev server
  console.log('\n🎉 Starting Next.js dev server...\n');
  try {
    execSync('next dev', { stdio: 'inherit' });
  } catch (err) {
    // User likely pressed Ctrl+C to stop the server
    console.log('\n👋 Dev server stopped');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
