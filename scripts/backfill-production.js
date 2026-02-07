// Simple Node.js script to backfill album art in production (no TypeScript dependencies needed)
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const CACHE_DIR = path.join(process.cwd(), '.cache', 'musicbrainz');

function getCachePath(artist, title) {
  const key = `${artist.toLowerCase()}-${title.toLowerCase()}`.replace(/[^a-z0-9-]/g, '_');
  return path.join(CACHE_DIR, `${key}.json`);
}

function loadCache(artist, title) {
  try {
    const cachePath = getCachePath(artist, title);
    if (fs.existsSync(cachePath)) {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      return cached.data;
    }
  } catch (err) {
    console.warn('Cache read error:', err);
  }
  return null;
}

async function backfillProduction() {
  console.log('🎨 Starting production backfill from cache...\n');

  // Get all songs without album art
  const songs = await prisma.song.findMany({
    where: {
      albumArtUrl: null,
    },
    orderBy: {
      elo: 'desc',
    },
  });

  console.log(`Found ${songs.length} songs to process\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const song of songs) {
    console.log(`Processing: ${song.artist} - ${song.title}`);
    
    const cached = loadCache(song.artist, song.title);
    
    if (cached) {
      try {
        await prisma.song.update({
          where: { id: song.id },
          data: {
            albumArtUrl: cached.albumArtUrl,
            genre: cached.genre,
            durationMs: cached.durationMs,
            decade: cached.decade,
          },
        });
        
        const updates = [];
        if (cached.albumArtUrl) updates.push('album art');
        if (cached.genre) updates.push('genre');
        if (cached.durationMs) updates.push('duration');
        if (cached.decade) updates.push('decade');
        
        console.log(`  ✅ Updated: ${updates.join(', ')}`);
        success++;
      } catch (err) {
        console.log(`  ❌ Failed to update database:`, err.message);
        failed++;
      }
    } else {
      console.log(`  ⏭️  No cache found`);
      skipped++;
    }
  }

  console.log(`\n📊 Backfill Summary:`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  📝 Total:   ${songs.length}`);
  console.log(`\n✨ Backfill complete!`);

  await prisma.$disconnect();
}

backfillProduction().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
