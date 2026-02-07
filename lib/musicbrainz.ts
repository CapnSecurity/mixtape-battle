// MusicBrainz API helper to fetch song metadata
// No API key required - just need to set a user agent

import fs from 'fs';
import path from 'path';
import { fetchFromiTunes } from './itunes';
import { fetchFromLastFm } from './lastfm';

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const COVERART_API = 'https://coverartarchive.org';
const USER_AGENT = 'MixtapeBattle/1.0.0 (https://mixtape.levesques.net)';
const CACHE_DIR = path.join(process.cwd(), '.cache', 'musicbrainz');
const RATE_LIMIT_MS = 1000; // MusicBrainz asks for 1 request per second

// Ensure cache directory exists
if (typeof window === 'undefined') {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn('[MusicBrainz] Could not create cache directory:', err);
  }
}

let lastRequestTime = 0;

/**
 * Rate limiter - ensures we don't exceed 1 request per second
 */
async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Get cache file path for an artist-title combination
 */
function getCachePath(artist: string, title: string): string {
  const key = `${artist.toLowerCase()}-${title.toLowerCase()}`.replace(/[^a-z0-9-]/g, '_');
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * Load cached metadata if available
 */
function loadCache(artist: string, title: string): MusicBrainzMetadata | null {
  if (typeof window !== 'undefined') return null; // Only cache on server
  
  try {
    const cachePath = getCachePath(artist, title);
    if (fs.existsSync(cachePath)) {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const age = Date.now() - cached.timestamp;
      // Cache valid for 30 days
      if (age < 30 * 24 * 60 * 60 * 1000) {
        console.log('[MusicBrainz] Using cached data for:', artist, '-', title);
        return cached.data;
      }
    }
  } catch (err) {
    console.warn('[MusicBrainz] Cache read error:', err);
  }
  return null;
}

/**
 * Save metadata to cache
 */
function saveCache(artist: string, title: string, data: MusicBrainzMetadata | null) {
  if (typeof window !== 'undefined') return; // Only cache on server
  
  try {
    const cachePath = getCachePath(artist, title);
    fs.writeFileSync(cachePath, JSON.stringify({
      timestamp: Date.now(),
      artist,
      title,
      data
    }), 'utf-8');
    console.log('[MusicBrainz] Cached data for:', artist, '-', title);
  } catch (err) {
    console.warn('[MusicBrainz] Cache write error:', err);
  }
}

/**
 * Normalize artist name (fix common typos and variations)
 */
function normalizeArtist(artist: string): string {
  const normalized = artist.trim();
  
  // Common artist corrections
  const corrections: Record<string, string> = {
    'Bruce Springstein': 'Bruce Springsteen',
    'CCR': 'Creedence Clearwater Revival',
    'The Eagles': 'Eagles',
    'The Black Crowes': 'Black Crowes',
    'Concrete Blondes': 'Concrete Blonde',
    'Bad Co.': 'Bad Company',
  };
  
  return corrections[normalized] || normalized;
}

/**
 * Normalize title (fix common typos)
 */
function normalizeTitle(title: string): string {
  let normalized = title.trim();
  
  // Common title corrections
  const corrections: Record<string, string> = {
    'Parachutte': 'Parachute',
    'World i Know': 'The World I Know',
    'Old Time Rock n Roll': 'Old Time Rock and Roll',
    'For What its Worth': 'For What It\'s Worth',
    'Nuthin \'bout You': 'Nothin\' \'Bout Love',
  };
  
  if (corrections[normalized]) {
    normalized = corrections[normalized];
  }
  
  return normalized;
}

interface MusicBrainzMetadata {
  album: string | null;
  releaseDate: number | null;
  decade: number | null;
  albumArtUrl: string | null;
  genre: string | null;
  durationMs: number | null;
  releaseId: string | null;
  confidence: number;
}

/**
 * Fetch album art from Cover Art Archive
 */
async function fetchAlbumArt(releaseId: string): Promise<string | null> {
  try {
    // Try to get the front cover at 500px size (good balance of quality and size)
    const url = `${COVERART_API}/release/${releaseId}/front-500`;
    
    const response = await fetch(url, {
      method: 'HEAD', // Just check if it exists
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (response.ok) {
      console.log('[CoverArt] Found album art for release:', releaseId);
      return url;
    }

    console.log('[CoverArt] No album art found for release:', releaseId);
    return null;
  } catch (error) {
    console.error('[CoverArt] Error fetching album art:', error);
    return null;
  }
}

export async function fetchSongMetadata(artist: string, title: string): Promise<MusicBrainzMetadata | null> {
  // Check cache with original names first
  const originalCache = loadCache(artist, title);
  if (originalCache) {
    return originalCache;
  }
  
  // Normalize artist and title
  const normalizedArtist = normalizeArtist(artist);
  const normalizedTitle = normalizeTitle(title);
  
  // If normalized, check cache with normalized names
  if (normalizedArtist !== artist || normalizedTitle !== title) {
    console.log(`[MusicBrainz] Normalized: "${artist}" → "${normalizedArtist}", "${title}" → "${normalizedTitle}"`);
    const normalizedCache = loadCache(normalizedArtist, normalizedTitle);
    if (normalizedCache) {
      // Save to cache with original names too
      saveCache(artist, title, normalizedCache);
      return normalizedCache;
    }
  }
  
  // Use normalized names for API search
  const searchArtist = normalizedArtist;
  const searchTitle = normalizedTitle;
  
  try {
    // Search for recordings (songs) matching artist and title
    // Request tags and release info in the same query
    const searchQuery = encodeURIComponent(`artist:"${searchArtist}" AND recording:"${searchTitle}"`);
    const url = `${MUSICBRAINZ_API}/recording?query=${searchQuery}&fmt=json&limit=10&inc=tags+releases+artist-credits`;
    
    console.log('[MusicBrainz] Searching for:', searchArtist, '-', searchTitle);
    console.log('[MusicBrainz] URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[MusicBrainz] API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.recordings || data.recordings.length === 0) {
      console.log('[MusicBrainz] No recordings found for:', searchArtist, searchTitle);
      return null;
    }

    console.log(`[MusicBrainz] Found ${data.recordings.length} recordings`);
    
    // Find the best match by checking artist and title similarity
    const normalizedSearchArtist = searchArtist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedSearchTitle = searchTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const recording of data.recordings) {
      // Check if this recording matches our search
      const recordingTitle = (recording.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const recordingArtist = (recording['artist-credit']?.[0]?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      console.log(`[MusicBrainz] Comparing: "${recordingArtist}" vs "${normalizedSearchArtist}", "${recordingTitle}" vs "${normalizedSearchTitle}"`);
      
      // Simple similarity score: both title and artist must contain the search terms
      const titleMatch = recordingTitle.includes(normalizedSearchTitle) || normalizedSearchTitle.includes(recordingTitle);
      const artistMatch = recordingArtist.includes(normalizedSearchArtist) || normalizedSearchArtist.includes(recordingArtist);
      
      console.log(`[MusicBrainz] Title match: ${titleMatch}, Artist match: ${artistMatch}`);
      
      if (titleMatch && artistMatch) {
        const score = (recording.score || 0) + (titleMatch && artistMatch ? 100 : 0);
        console.log(`[MusicBrainz] Match found! Score: ${score}`);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = recording;
        }
      }
    }
    
    if (!bestMatch) {
      console.log('[MusicBrainz] No good match found after filtering');
      return null;
    }
    
    console.log('[MusicBrainz] Best match:', bestMatch.title, 'by', bestMatch['artist-credit']?.[0]?.name);
    
    // Extract release info (album and date)
    let album = null;
    let releaseDate = null;
    let releaseId = null;
    let decade = null;

    if (bestMatch.releases && bestMatch.releases.length > 0) {
      // Get the earliest official release
      const officialReleases = bestMatch.releases
        .filter((r: any) => r.status === 'Official')
        .sort((a: any, b: any) => {
          const dateA = a.date || '9999';
          const dateB = b.date || '9999';
          return dateA.localeCompare(dateB);
        });

      const primaryRelease = officialReleases[0] || bestMatch.releases[0];
      album = primaryRelease.title;
      releaseId = primaryRelease.id;
      
      // Extract year from date (format: YYYY-MM-DD or YYYY)
      if (primaryRelease.date) {
        const year = primaryRelease.date.split('-')[0];
        releaseDate = parseInt(year, 10);
        
        // Calculate decade (e.g., 1989 → 1980, 2005 → 2000)
        if (!isNaN(releaseDate)) {
          decade = Math.floor(releaseDate / 10) * 10;
        }
      }
      
      console.log('[MusicBrainz] Found album:', album, 'year:', releaseDate, 'decade:', decade);
    }

    // Extract genre from tags (MusicBrainz has user-submitted tags)
    let genre = null;
    if (bestMatch.tags && bestMatch.tags.length > 0) {
      // Sort by count (most popular tag first) and pick the first one
      const sortedTags = [...bestMatch.tags].sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
      genre = sortedTags[0].name;
      console.log('[MusicBrainz] Found genre:', genre, 'from', bestMatch.tags.length, 'tags');
    }

    // Extract duration (in milliseconds)
    let durationMs = null;
    if (bestMatch.length) {
      durationMs = bestMatch.length; // MusicBrainz returns duration in milliseconds
    }

    // Fetch album art if we have a release ID
    let albumArtUrl = null;
    if (releaseId) {
      await rateLimit(); // Respect rate limit before making another request
      albumArtUrl = await fetchAlbumArt(releaseId);
    }

    const result = {
      album,
      releaseDate,
      decade,
      albumArtUrl,
      genre,
      durationMs,
      releaseId,
      confidence: bestScore,
    };

    // Cache the result with original names
    saveCache(artist, title, result);
    
    // Also cache with normalized names if different
    if (normalizedArtist !== artist || normalizedTitle !== title) {
      saveCache(normalizedArtist, normalizedTitle, result);
    }

    return result;
  } catch (error) {
    console.error('[MusicBrainz] Error fetching data:', error);
    // Cache the null result to avoid repeated failed lookups
    saveCache(artist, title, null);
    if (normalizedArtist !== artist || normalizedTitle !== title) {
      saveCache(normalizedArtist, normalizedTitle, null);
    }
    return null;
  }
}

/**
 * Comprehensive metadata fetcher with automatic fallbacks
 * Tries MusicBrainz first, then iTunes, then Last.fm
 */
export async function fetchSongMetadataWithFallbacks(artist: string, title: string): Promise<MusicBrainzMetadata | null> {
  console.log('[MetadataFetch] Starting comprehensive search for:', artist, '-', title);
  
  // Try MusicBrainz first
  const mbData = await fetchSongMetadata(artist, title);
  
  // If MusicBrainz found complete data with album art, we're done
  if (mbData?.albumArtUrl) {
    console.log('[MetadataFetch] ✅ MusicBrainz found complete data');
    return mbData;
  }
  
  // Initialize result with MusicBrainz data (if any)
  let result: MusicBrainzMetadata = mbData || {
    album: null,
    releaseDate: null,
    decade: null,
    albumArtUrl: null,
    genre: null,
    durationMs: null,
    releaseId: null,
    confidence: 0,
  };
  
  // Try iTunes as fallback
  if (!result.albumArtUrl) {
    console.log('[MetadataFetch] 🔄 Trying iTunes fallback...');
    const itunesData = await fetchFromiTunes(artist, title);
    
    if (itunesData?.albumArtUrl) {
      console.log('[MetadataFetch] ✅ iTunes found album art!');
      result.albumArtUrl = itunesData.albumArtUrl;
      // Use iTunes data for missing fields
      if (!result.album && itunesData.album) {
        result.album = itunesData.album;
      }
      if (!result.releaseDate && itunesData.releaseDate) {
        result.releaseDate = itunesData.releaseDate;
        result.decade = Math.floor(itunesData.releaseDate / 10) * 10;
      }
      result.confidence = Math.max(result.confidence, 75); // iTunes is pretty reliable
      
      // Cache the combined result
      saveCache(artist, title, result);
      return result;
    }
  }
  
  // Try Last.fm as final fallback
  if (!result.albumArtUrl) {
    console.log('[MetadataFetch] 🔄 Trying Last.fm fallback...');
    const lastfmData = await fetchFromLastFm(artist, title);
    
    if (lastfmData?.albumArtUrl) {
      console.log('[MetadataFetch] ✅ Last.fm found album art!');
      result.albumArtUrl = lastfmData.albumArtUrl;
      // Use Last.fm data for missing fields
      if (!result.album && lastfmData.album) {
        result.album = lastfmData.album;
      }
      result.confidence = Math.max(result.confidence, 70);
      
      // Cache the combined result
      saveCache(artist, title, result);
      return result;
    }
  }
  
  // Return whatever we have (even if incomplete)
  if (result.album || result.releaseDate || result.genre) {
    console.log('[MetadataFetch] ⚠️  Partial data found (no album art)');
    return result;
  }
  
  console.log('[MetadataFetch] ❌ No metadata found from any source');
  return null;
}
