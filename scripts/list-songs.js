const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listSongs() {
  const withArt = await prisma.song.findMany({
    where: { albumArtUrl: { not: null } },
    select: { id: true, artist: true, title: true, albumArtUrl: true, genre: true, durationMs: true },
    orderBy: { id: 'asc' },
    take: 10,
  });
  
  console.log('Sample songs WITH album art:');
  withArt.forEach(s => {
    const extras = [];
    if (s.genre) extras.push(`genre: ${s.genre}`);
    if (s.durationMs) extras.push(`${Math.floor(s.durationMs/1000)}s`);
    console.log(`  [${s.id}] ${s.artist} - ${s.title}`);
    if (extras.length) console.log(`      ${extras.join(', ')}`);
  });
  
  await prisma.$disconnect();
}

listSongs().catch(console.error);
