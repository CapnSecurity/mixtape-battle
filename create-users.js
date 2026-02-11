const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@test.local' },
    update: {},
    create: {
      email: 'admin@test.local',
      password: adminHash,
      isAdmin: true
    }
  });
  
  await prisma.user.upsert({
    where: { email: 'user@test.local' },
    update: {},
    create: {
      email: 'user@test.local',
      password: userHash,
      isAdmin: false
    }
  });
  
  console.log('Dev accounts ready');
}

main()
  .catch(e => {
    console.error('Error creating dev accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
