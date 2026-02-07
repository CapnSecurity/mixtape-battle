/**
 * Backfill Script: Fetch album art and metadata for existing songs
 * 
 * This script queries all songs without album art and fetches metadata
 * from MusicBrainz. Results are cached to avoid re-fetching.
 * 
 * Usage:
 *   npx ts-node scripts/backfill-album-art.ts
 *   npx ts-node scripts/backfill-album-art.ts --limit 10  # Process only 10 songs
 *   npx ts-node scripts/backfill-album-art.ts --force     # Ignore cache, fetch fresh data
 */

import { PrismaClient } from '@prisma/client';
import { fetchSongMetadata } from '../lib/musicbrainz';

const prisma = new PrismaClient();

interface BackfillOptions {
  limit?: number;
  force?: boolean;
  dryRun?: boolean;
}

async function backfillAlbumArt(options: BackfillOptions = {}) {
  console.log('🎨 Starting album art backfill...\n');

  // Get all songs without album art
  const songs = await prisma.song.findMany({
    where: options.force ? {} : {
      albumArtUrl: null,
    },
    orderBy: { elo: 'desc' }, // Process highest-rated songs first
    take: options.limit,
  });

  console.log(`Found ${songs.length} song(s) to process\n`);

  if (songs.length === 0) {
    console.log('✅ All songs already have album art!');
    await prisma.$disconnect();
    return;
  }

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const progress = `[${i + 1}/${songs.length}]`;

    console.log(`${progress} Processing: ${song.artist} - ${song.title}`);

    try {
      // Fetch metadata from MusicBrainz (with caching)
      const metadata = await fetchSongMetadata(song.artist, song.title);

      if (!metadata) {
        console.log(`  ⚠️  No metadata found on MusicBrainz`);
        failedCount++;
        continue;
      }

      // Prepare update data
      const updateData: any = {};
      let hasUpdates = false;

      if (metadata.albumArtUrl && metadata.albumArtUrl !== song.albumArtUrl) {
        updateData.albumArtUrl = metadata.albumArtUrl;
        hasUpdates = true;
        console.log(`  ✅ Album art: ${metadata.albumArtUrl.substring(0, 50)}...`);
      }

      if (metadata.genre && !song.genre) {
        updateData.genre = metadata.genre;
        hasUpdates = true;
        console.log(`  ✅ Genre: ${metadata.genre}`);
      }

      if (metadata.durationMs && !song.durationMs) {
        updateData.durationMs = metadata.durationMs;
        hasUpdates = true;
        console.log(`  ✅ Duration: ${Math.floor(metadata.durationMs / 1000)}s`);
      }

      if (metadata.decade && !song.decade) {
        updateData.decade = metadata.decade;
        hasUpdates = true;
        console.log(`  ✅ Decade: ${metadata.decade}s`);
      }

      // Update missing album/releaseDate if we have them
      if (metadata.album && !song.album) {
        updateData.album = metadata.album;
        hasUpdates = true;
        console.log(`  ✅ Album: ${metadata.album}`);
      }

      if (metadata.releaseDate && !song.releaseDate) {
        updateData.releaseDate = metadata.releaseDate;
        hasUpdates = true;
        console.log(`  ✅ Year: ${metadata.releaseDate}`);
      }

      if (!hasUpdates) {
        console.log(`  ⏭️  No new data to update`);
        skippedCount++;
        continue;
      }

      // Update the song in the database
      if (!options.dryRun) {
        await prisma.song.update({
          where: { id: song.id },
          data: updateData,
        });
        console.log(`  💾 Saved to database`);
      } else {
        console.log(`  🔍 DRY RUN - Would update database`);
      }

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
      failedCount++;
    }

    console.log(''); // Empty line for readability
  }

  console.log('\n📊 Backfill Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
  console.log(`  ❌ Failed:  ${failedCount}`);
  console.log(`  📝 Total:   ${songs.length}`);

  await prisma.$disconnect();
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: BackfillOptions = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (arg === '--force') {
    options.force = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--help') {
    console.log(`
Usage: npx ts-node scripts/backfill-album-art.ts [options]

Options:
  --limit <n>   Process only N songs (default: all)
  --force       Re-fetch data for all songs, even if they have album art
  --dry-run     Show what would be updated without saving to database
  --help        Show this help message

Examples:
  npx ts-node scripts/backfill-album-art.ts
  npx ts-node scripts/backfill-album-art.ts --limit 10
  npx ts-node scripts/backfill-album-art.ts --dry-run
  npx ts-node scripts/backfill-album-art.ts --force --limit 5
`);
    process.exit(0);
  }
}

// Run the backfill
backfillAlbumArt(options)
  .then(() => {
    console.log('\n✨ Backfill complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Backfill failed:', error);
    process.exit(1);
  });
