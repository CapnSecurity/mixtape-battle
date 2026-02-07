import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  // Get total count
  const totalCount = await prisma.song.count();
  console.log('📊 Total songs:', totalCount);

  // Find duplicates (same artist + title)
  const duplicates = await prisma.$queryRaw<Array<{ artist: string; title: string; count: bigint }>>`
    SELECT artist, title, COUNT(*) as count 
    FROM "Song" 
    GROUP BY artist, title 
    HAVING COUNT(*) > 1 
    ORDER BY count DESC
  `;

  console.log('\n🔍 Duplicate songs:', duplicates.length);
  
  if (duplicates.length > 0) {
    console.log('\n❌ Found duplicates:');
    for (const dup of duplicates) {
      console.log(`  ${dup.artist} - ${dup.title} (${dup.count}x)`);
      
      // Get the IDs of all duplicates
      const songs = await prisma.song.findMany({
        where: {
          artist: dup.artist,
          title: dup.title,
        },
        select: {
          id: true,
          elo: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      songs.forEach((song, idx) => {
        console.log(`    [${song.id}] ELO: ${song.elo.toFixed(0)}, Created: ${song.createdAt.toISOString().split('T')[0]}${idx === 0 ? ' ← KEEP' : ' ← DELETE?'}`);
      });
    }
    
    const totalDuplicates = duplicates.reduce((sum, dup) => sum + Number(dup.count) - 1, 0);
    console.log(`\n💡 ${totalDuplicates} duplicate records should be removed`);
    console.log(`📉 After cleanup: ${totalCount - totalDuplicates} unique songs`);
  } else {
    console.log('✅ No duplicates found!');
  }

  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
