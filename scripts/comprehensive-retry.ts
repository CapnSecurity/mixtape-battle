import { PrismaClient } from '@prisma/client';
import { fetchFromiTunes } from '../lib/itunes';
import { fetchFromLastFm } from '../lib/lastfm';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const CACHE_DIR = path.join(process.cwd(), '.cache', 'musicbrainz');

function getCachePath(artist: string, title: string): string {
  const key = `${artist.toLowerCase()}-${title.toLowerCase()}`.replace(/[^a-z0-9-]/g, '_');
  return path.join(CACHE_DIR, `${key}.json`);
}

function saveToCache(artist: string, title: string, data: any) {
  try {
    const cachePath = getCachePath(artist, title);
    fs.writeFileSync(cachePath, JSON.stringify({
      timestamp: Date.now(),
      artist,
      title,
      data
    }), 'utf-8');
    console.log('  💾 Cached result');
  } catch (err) {
    console.warn('  ⚠️  Cache write error:', err);
  }
}

async function comprehensiveRetry() {
  const songsWithoutArt = await prisma.song.findMany({
    where: { albumArtUrl: null },
    select: { id: true, artist: true, title: true, elo: true },
    orderBy: { elo: 'desc' },
  });
  
  console.log(`🔍 Comprehensive retry on ${songsWithoutArt.length} songs using multiple sources...\n`);
  console.log('Sources: MusicBrainz (cache), iTunes Search API, Last.fm\n');
  
  let success = 0;
  let failed = 0;
  const sources = { musicbrainz: 0, itunes: 0, lastfm: 0 };

  for (const song of songsWithoutArt) {
    console.log(`\n[${song.id}] ${song.artist} - ${song.title} (ELO: ${Math.round(song.elo)})`);
    
    let found = false;
    let result: any = null;
    let source = '';
    
    // Try iTunes Search API
    if (!found) {
      console.log('  🍎 Trying iTunes...');
      try {
        const itunesResult = await fetchFromiTunes(song.artist, song.title);
        
        if (itunesResult && itunesResult.albumArtUrl) {
          result = {
            albumArtUrl: itunesResult.albumArtUrl,
            album: itunesResult.album,
            releaseDate: itunesResult.releaseDate,
            decade: itunesResult.releaseDate ? Math.floor(itunesResult.releaseDate / 10) * 10 : null,
            genre: null,
            durationMs: null,
            releaseId: null,
            confidence: 90,
          };
          source = 'iTunes';
          sources.itunes++;
          found = true;
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.log('    Error:', err);
      }
    }
    
    // Try Last.fm
    if (!found) {
      console.log('  🎵 Trying Last.fm...');
      try {
        const lastfmResult = await fetchFromLastFm(song.artist, song.title);
        
        if (lastfmResult && lastfmResult.albumArtUrl) {
          result = {
            albumArtUrl: lastfmResult.albumArtUrl,
            album: lastfmResult.album,
            releaseDate: null,
            decade: null,
            genre: null,
            durationMs: null,
            releaseId: null,
            confidence: 80,
          };
          source = 'Last.fm';
          sources.lastfm++;
          found = true;
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.log('    Error:', err);
      }
    }
    
    // Update database if found
    if (found && result) {
      try {
        await prisma.song.update({
          where: { id: song.id },
          data: {
            albumArtUrl: result.albumArtUrl,
            album: result.album || song.album,
            releaseDate: result.releaseDate || song.releaseDate,
            decade: result.decade || song.decade,
          },
        });
        
        // Save to cache
        saveToCache(song.artist, song.title, result);
        
        console.log(`  ✅ Found album art via ${source}!`);
        success++;
      } catch (err) {
        console.log(`  ❌ Database update failed:`, err);
        failed++;
      }
    } else {
      console.log(`  ❌ No album art found in any source`);
      failed++;
    }
  }

  console.log(`\n📊 Comprehensive Retry Summary:`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  📝 Total:   ${songsWithoutArt.length}`);
  console.log(`\n📈 Success by source:`);
  console.log(`  🎵 MusicBrainz: ${sources.musicbrainz}`);
  console.log(`  🍎 iTunes:      ${sources.itunes}`);
  console.log(`  🎸 Last.fm:     ${sources.lastfm}`);
  
  await prisma.$disconnect();
}

comprehensiveRetry().catch(console.error);
