const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function countSongs() {
  const total = await prisma.song.count();
  const withArt = await prisma.song.count({ where: { albumArtUrl: { not: null } } });
  const withoutArt = await prisma.song.count({ where: { albumArtUrl: null } });
  
  console.log('Total songs:', total);
  console.log('With album art:', withArt);
  console.log('Without album art:', withoutArt);
  
  await prisma.$disconnect();
}

countSongs().catch(console.error);
