import { PrismaClient } from '@prisma/client';
import { fetchSongMetadata } from '../lib/musicbrainz';

const prisma = new PrismaClient();

// Common artist name corrections and variations
const artistMappings: Record<string, string[]> = {
  'Bruce Springstein': ['Bruce Springsteen'],
  'CCR': ['Creedence Clearwater Revival'],
  'Joan Jett & The Blackhearts': ['Joan Jett', 'Joan Jett and the Blackhearts'],
  'Stevie Ray Vaughan & Double Trouble': ['Stevie Ray Vaughan', 'Stevie Ray Vaughan and Double Trouble'],
  'Brooks & Dunn': ['Brooks and Dunn'],
  'Bad Co.': ['Bad Company'],
  'The Eagles': ['Eagles'],
  'The Black Crowes': ['Black Crowes'],
  'Concrete Blondes': ['Concrete Blonde'], // Note: might be misspelled
};

// Common title variations
function getTitleVariations(title: string): string[] {
  const variations = [title];
  
  // Remove possessive apostrophes
  if (title.includes("'")) {
    variations.push(title.replace(/'/g, ''));
  }
  
  // Try with/without contractions
  if (title.includes("'")) {
    variations.push(title.replace("'", ''));
  }
  
  return variations;
}

async function retryMissingSongs() {
  const songsWithoutArt = await prisma.song.findMany({
    where: { albumArtUrl: null },
    select: { id: true, artist: true, title: true },
    orderBy: { elo: 'desc' },
  });
  
  console.log(`🔍 Retrying ${songsWithoutArt.length} songs with variations...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const song of songsWithoutArt) {
    console.log(`\n[${song.id}] ${song.artist} - ${song.title}`);
    
    // Get artist variations
    const artistVariations = artistMappings[song.artist] || [song.artist];
    const titleVariations = getTitleVariations(song.title);
    
    let found = false;
    
    // Try all combinations
    for (const artist of artistVariations) {
      if (found) break;
      
      for (const title of titleVariations) {
        if (artist === song.artist && title === song.title) {
          // Skip original (already tried)
          continue;
        }
        
        console.log(`  Trying: "${artist}" - "${title}"`);
        
        try {
          const metadata = await fetchSongMetadata(artist, title);
          
          if (metadata && (metadata.albumArtUrl || metadata.genre || metadata.durationMs)) {
            console.log(`  ✅ Found metadata!`);
            if (metadata.albumArtUrl) console.log(`     Album art: ✓`);
            if (metadata.genre) console.log(`     Genre: ${metadata.genre}`);
            if (metadata.durationMs) console.log(`     Duration: ${Math.floor(metadata.durationMs/1000)}s`);
            
            // Update database
            await prisma.song.update({
              where: { id: song.id },
              data: {
                albumArtUrl: metadata.albumArtUrl,
                genre: metadata.genre,
                durationMs: metadata.durationMs,
                decade: metadata.decade,
              },
            });
            
            success++;
            found = true;
            break;
          }
        } catch (err) {
          console.log(`     Error: ${err}`);
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    }
    
    if (!found) {
      console.log(`  ❌ No metadata found with any variation`);
      failed++;
    }
  }
  
  console.log(`\n📊 Retry Summary:`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  📝 Total:   ${songsWithoutArt.length}`);
  
  await prisma.$disconnect();
}

retryMissingSongs().catch(console.error);
