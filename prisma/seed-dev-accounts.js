#!/usr/bin/env node

/**
 * Seed dev database with test accounts
 * Run: node prisma/seed-dev-accounts.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dev test accounts...');

  // Test admin account
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.local' },
    update: {
      password: adminPassword,
      isAdmin: true,
      emailVerified: new Date(),
    },
    create: {
      email: 'admin@test.local',
      password: adminPassword,
      isAdmin: true,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin account:', admin.email, '(isAdmin:', admin.isAdmin, ') - Password: admin1234');

  // Test regular user account
  const userPassword = await bcrypt.hash('user1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.local' },
    update: {
      password: userPassword,
      isAdmin: false,
      emailVerified: new Date(),
    },
    create: {
      email: 'user@test.local',
      password: userPassword,
      isAdmin: false,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Regular user:', user.email, '(isAdmin:', user.isAdmin, ') - Password: user1234');

  console.log('\n🔐 Dev accounts ready!');
  console.log('   Admin: admin@test.local / admin1234');
  console.log('   User: user@test.local / user1234\n');
}

main()
  .catch((e) => {
    console.error('Error seeding dev accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
