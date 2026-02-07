const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listMissing() {
  const songsWithoutArt = await prisma.song.findMany({
    where: { albumArtUrl: null },
    select: { id: true, artist: true, title: true },
    orderBy: { artist: 'asc' },
  });
  
  console.log(`\nSongs without album art (${songsWithoutArt.length} total):\n`);
  songsWithoutArt.forEach(s => {
    console.log(`[${s.id}] ${s.artist} - ${s.title}`);
  });
  
  await prisma.$disconnect();
}

listMissing().catch(console.error);
