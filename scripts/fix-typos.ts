import { PrismaClient } from '@prisma/client';
import { fetchSongMetadata } from '../lib/musicbrainz';

const prisma = new PrismaClient();

// Artist/title corrections to fix in database
const corrections = [
  // Bruce Springsteen misspellings
  { find: { artist: 'Bruce Springstein', title: 'Fire' }, correct: { artist: 'Bruce Springsteen' } },
  
  // Chris Stapleton typo
  { find: { artist: 'Chris Stapleton', title: 'Parachutte' }, correct: { title: 'Parachute' } },
  
  // Collective Soul - likely missing "The"
  { find: { artist: 'Collective Soul', title: 'World i Know' }, correct: { title: 'The World I Know' } },
  
  // Pam Tillis capitalization
  { find: { artist: 'Pam tillis' }, correct: { artist: 'Pam Tillis' } },
  
  // Brooks & Dunn variations
  { find: { artist: 'Brooks & Dunn', title: 'Nuthin \'bout You' }, correct: { title: 'Nothin\' \'Bout Love' } },
  
  // Bob Seger title variations
  { find: { artist: 'Bob Seger', title: 'Old Time Rock n Roll' }, correct: { title: 'Old Time Rock and Roll' } },
  
  // Buffalo Springfield
  { find: { artist: 'Buffalo Springfield', title: 'For What its Worth' }, correct: { title: 'For What It\'s Worth' } },
];

async function fixTyposAndFetch() {
  console.log('🔧 Fixing typos and fetching album art...\n');
  
  let fixed = 0;
  let artFound = 0;
  let failed = 0;
  
  for (const correction of corrections) {
    const song = await prisma.song.findFirst({
      where: correction.find,
    });
    
    if (!song) {
      console.log(`⚠️  Song not found: ${JSON.stringify(correction.find)}`);
      failed++;
      continue;
    }
    
    const newArtist = correction.correct.artist || song.artist;
    const newTitle = correction.correct.title || song.title;
    
    console.log(`\n[${song.id}] ${song.artist} - ${song.title}`);
    console.log(`  → Correcting to: ${newArtist} - ${newTitle}`);
    
    // Try to fetch metadata with corrected spelling
    try {
      const metadata = await fetchSongMetadata(newArtist, newTitle);
      
      if (metadata) {
        const updates: any = {
          artist: newArtist,
          title: newTitle,
        };
        
        if (metadata.albumArtUrl) {
          updates.albumArtUrl = metadata.albumArtUrl;
          console.log(`  ✅ Found album art!`);
          artFound++;
        }
        if (metadata.genre) updates.genre = metadata.genre;
        if (metadata.durationMs) updates.durationMs = metadata.durationMs;
        if (metadata.decade) updates.decade = metadata.decade;
        if (metadata.album) updates.album = metadata.album;
        if (metadata.releaseDate) updates.releaseDate = metadata.releaseDate;
        
        await prisma.song.update({
          where: { id: song.id },
          data: updates,
        });
        
        console.log(`  ✅ Updated database with corrections`);
        fixed++;
      } else {
        // Still update the typo even if no metadata found
        await prisma.song.update({
          where: { id: song.id },
          data: {
            artist: newArtist,
            title: newTitle,
          },
        });
        console.log(`  ✅ Fixed typo (no metadata found)`);
        fixed++;
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (err) {
      console.log(`  ❌ Error: ${err}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Fix Summary:`);
  console.log(`  ✅ Fixed: ${fixed}`);
  console.log(`  🎨 Art found: ${artFound}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📝 Total: ${corrections.length}`);
  
  await prisma.$disconnect();
}

fixTyposAndFetch().catch(console.error);
