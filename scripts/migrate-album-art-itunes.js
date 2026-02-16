/**
 * One-time script to update album art for existing songs using new iTunes-first approach
 * Run this after deploying the new metadata fetching code
 * Usage: node scripts/update-album-art.js [--dry-run] [--limit=N]
 */

const { PrismaClient } = require('@prisma/client');
const { fetchSongMetadataWithFallbacks } = require('../lib/musicbrainz');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitMatch = args.find(arg => arg.startsWith('--limit='));
const limit = limitMatch ? parseInt(limitMatch.split('=')[1]) : null;

async function updateAlbumArt() {
  console.log('🎨 Album Art Update Script');
  console.log('==========================');
  console.log('Mode:', dryRun ? 'DRY RUN (no changes will be saved)' : 'LIVE');
  if (limit) console.log('Limit:', limit, 'songs');
  console.log('');

  try {
    // Fetch all songs, ordered by ID
    const songs = await prisma.song.findMany({
      orderBy: { id: 'asc' },
      take: limit || undefined,
    });

    console.log(`Found ${songs.length} songs to process`);
    console.log('');

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let noChangeCount = 0;

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const progress = `[${i + 1}/${songs.length}]`;
      
      console.log(`${progress} Processing: ${song.artist} - ${song.title}`);
      console.log(`  Current album art: ${song.albumArt ? 'Yes' : 'No'}`);

      try {
        // Fetch new metadata using iTunes-first approach
        const metadata = await fetchSongMetadataWithFallbacks(song.artist, song.title);

        if (!metadata || !metadata.albumArtUrl) {
          console.log(`  ⚠️  No album art found`);
          skippedCount++;
          console.log('');
          continue;
        }

        // Check if the new album art URL is different
        if (song.albumArt === metadata.albumArtUrl) {
          console.log(`  ℹ️  Album art unchanged`);
          noChangeCount++;
          console.log('');
          continue;
        }

        console.log(`  ✅ New album art URL: ${metadata.albumArtUrl.substring(0, 60)}...`);
        
        if (!dryRun) {
          // Update the song with new metadata
          await prisma.song.update({
            where: { id: song.id },
            data: {
              albumArt: metadata.albumArtUrl,
              // Also update other fields if they're missing
              ...(metadata.album && !song.album ? { album: metadata.album } : {}),
              ...(metadata.releaseDate && !song.releaseDate ? { releaseDate: metadata.releaseDate } : {}),
              ...(metadata.decade && !song.decade ? { decade: metadata.decade } : {}),
              ...(metadata.genre && !song.genre ? { genre: metadata.genre } : {}),
              ...(metadata.durationMs && !song.durationMs ? { durationMs: metadata.durationMs } : {}),
            },
          });
          console.log(`  💾 Updated in database`);
          updatedCount++;
        } else {
          console.log(`  🔍 Would update (dry run)`);
          updatedCount++;
        }

        console.log('');

        // Rate limiting - wait 1 second between requests to be nice to APIs
        if (i < songs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`  ❌ Error processing song:`, error.message);
        errorCount++;
        console.log('');
      }
    }

    console.log('==========================');
    console.log('Summary:');
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  No change: ${noChangeCount}`);
    console.log(`  Skipped (no art found): ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total processed: ${songs.length}`);
    
    if (dryRun) {
      console.log('');
      console.log('ℹ️  This was a dry run. Run without --dry-run to apply changes.');
    }

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAlbumArt()
  .then(() => {
    console.log('');
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
