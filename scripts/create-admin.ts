import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@test.local';
  
  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Create the user
    user = await prisma.user.create({
      data: {
        email,
        emailVerified: new Date(),
        isAdmin: true,
      },
    });
    console.log(`✅ Created admin user: ${email}`);
  } else {
    // Update existing user to be admin
    user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true, emailVerified: new Date() },
    });
    console.log(`✅ Updated existing user to admin: ${email}`);
  }

  console.log(`\nAdmin user ready!`);
  console.log(`Email: ${email}`);
  console.log(`isAdmin: ${user.isAdmin}`);
  console.log(`\nTo sign in:`);
  console.log(`1. Go to http://localhost:3000/login`);
  console.log(`2. Enter: ${email}`);
  console.log(`3. Check MailHog at http://localhost:8025 for the magic link`);
  console.log(`4. Click the link to sign in`);
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
