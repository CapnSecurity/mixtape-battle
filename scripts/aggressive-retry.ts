import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const COVERART_API = 'https://coverartarchive.org';
const USER_AGENT = 'MixtapeBattle/1.0.0 (https://mixtape.levesques.net)';
const CACHE_DIR = path.join(process.cwd(), '.cache', 'musicbrainz');

let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise(resolve => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
}

async function tryFetchWithReleases(artist: string, title: string) {
  await rateLimit();
  
  const searchQuery = encodeURIComponent(`artist:"${artist}" AND recording:"${title}"`);
  const url = `${MUSICBRAINZ_API}/recording?query=${searchQuery}&fmt=json&limit=20&inc=releases`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) return null;
  
  const data = await response.json();
  if (!data.recordings || data.recordings.length === 0) return null;

  // Find best recording match
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let bestRecording = null;
  let bestScore = 0;
  
  for (const recording of data.recordings) {
    const recordingTitle = (recording.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const recordingArtist = (recording['artist-credit']?.[0]?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const titleMatch = recordingTitle.includes(normalizedTitle) || normalizedTitle.includes(recordingTitle);
    const artistMatch = recordingArtist.includes(normalizedArtist) || normalizedArtist.includes(recordingArtist);
    
    if (titleMatch && artistMatch) {
      const score = (recording.score || 0) + 100;
      if (score > bestScore) {
        bestScore = score;
        bestRecording = recording;
      }
    }
  }
  
  if (!bestRecording || !bestRecording.releases) return null;

  // Try ALL releases to find one with cover art
  // Prioritize: Official studio albums > EPs > compilations > live > other
  const releaseScores = bestRecording.releases.map((release: any) => {
    let score = 0;
    if (release.status === 'Official') score += 100;
    if (release['release-group']?.['primary-type'] === 'Album') score += 50;
    if (release['release-group']?.['primary-type'] === 'EP') score += 30;
    if (release['release-group']?.['secondary-types']?.includes('Compilation')) score += 10;
    if (release.date) score += 5; // Prefer releases with dates
    return { release, score };
  }).sort((a: any, b: any) => b.score - a.score);

  console.log(`  Trying ${releaseScores.length} releases...`);

  for (const { release } of releaseScores.slice(0, 10)) { // Try top 10
    await rateLimit();
    
    try {
      const artUrl = `${COVERART_API}/release/${release.id}/front-500`;
      const artResponse = await fetch(artUrl, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } });
      
      if (artResponse.ok) {
        console.log(`  ✅ Found art on: ${release.title || 'Unknown'} (${release.date || 'no date'})`);
        return {
          albumArtUrl: artUrl,
          album: release.title,
          releaseDate: release.date ? parseInt(release.date.split('-')[0]) : null,
        };
      }
    } catch (err) {
      // Continue to next release
    }
  }

  return null;
}

async function aggressiveRetry() {
  const songsWithoutArt = await prisma.song.findMany({
    where: { albumArtUrl: null },
    select: { id: true, artist: true, title: true, elo: true },
    orderBy: { elo: 'desc' },
  });
  
  console.log(`🔍 Aggressive retry on ${songsWithoutArt.length} songs...\n`);
  
  let success = 0;
  let failed = 0;
  const limit = Math.min(20, songsWithoutArt.length); // Process up to 20 songs

  for (const song of songsWithoutArt.slice(0, limit)) {
    console.log(`\n[${song.id}] ${song.artist} - ${song.title}`);
    
    // Try variations
    const variations = [
      { artist: song.artist, title: song.title },
      { artist: song.artist.replace(/^The /, ''), title: song.title }, // Remove "The"
      { artist: song.artist, title: song.title.replace(/^The /, '') }, // Remove "The" from title
    ];
    
    let found = false;
    
    for (const variation of variations) {
      if (variation.artist === song.artist && variation.title === song.title) {
        // Original already tried, skip
        continue;
      }
      
      console.log(`  Trying: "${variation.artist}" - "${variation.title}"`);
      
      try {
        const result = await tryFetchWithReleases(variation.artist, variation.title);
        
        if (result && result.albumArtUrl) {
          await prisma.song.update({
            where: { id: song.id },
            data: {
              albumArtUrl: result.albumArtUrl,
              album: result.album,
              releaseDate: result.releaseDate,
              decade: result.releaseDate ? Math.floor(result.releaseDate / 10) * 10 : null,
            },
          });
          
          // Save to cache
          const cachePath = path.join(CACHE_DIR, `${song.artist.toLowerCase()}-${song.title.toLowerCase()}`.replace(/[^a-z0-9-]/g, '_') + '.json');
          fs.writeFileSync(cachePath, JSON.stringify({
            timestamp: Date.now(),
            artist: song.artist,
            title: song.title,
            data: {
              ...result,
              decade: result.releaseDate ? Math.floor(result.releaseDate / 10) * 10 : null,
              genre: null,
              durationMs: null,
              releaseId: null,
              confidence: 100,
            }
          }));
          
          success++;
          found = true;
          break;
        }
      } catch (err) {
        console.log(`    Error: ${err}`);
      }
    }
    
    if (!found) {
      // Try original with expanded release search
      console.log(`  Trying expanded search: "${song.artist}" - "${song.title}"`);
      try {
        const result = await tryFetchWithReleases(song.artist, song.title);
        
        if (result && result.albumArtUrl) {
          await prisma.song.update({
            where: { id: song.id },
            data: {
              albumArtUrl: result.albumArtUrl,
              album: result.album,
              releaseDate: result.releaseDate,
              decade: result.releaseDate ? Math.floor(result.releaseDate / 10) * 10 : null,
            },
          });
          
          success++;
          found = true;
        }
      } catch (err) {
        console.log(`    Error: ${err}`);
      }
    }
    
    if (!found) {
      console.log(`  ❌ No album art found`);
      failed++;
    }
  }

  console.log(`\n📊 Aggressive Retry Summary:`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  📝 Total:   ${limit}`);
  
  await prisma.$disconnect();
}

aggressiveRetry().catch(console.error);
