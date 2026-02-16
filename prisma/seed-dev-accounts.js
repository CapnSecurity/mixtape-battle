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
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.local' },
    update: {},
    create: {
      email: 'admin@test.local',
      name: 'Dev Admin',
      password: adminPassword,
      isAdmin: true,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin account:', admin.email);

  // Test user account
  const userPassword = await bcrypt.hash('user1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.local' },
    update: {},
    create: {
      email: 'user@test.local',
      name: 'Dev User',
      password: userPassword,
      isAdmin: false,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created user account:', user.email);

  console.log('Dev accounts ready');
}

main()
  .catch((e) => {
    console.error('Error seeding dev accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
