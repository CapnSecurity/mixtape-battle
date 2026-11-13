// iTunes Search API helper
// Free API, no authentication required

const ITUNES_API = 'https://itunes.apple.com/search';

export interface iTunesResult {
  albumArtUrl: string | null;
  album: string | null;
  releaseDate: number | null;
  genre: string | null;
}

const squash = (s: string | undefined | null) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Acts and albums that re-record someone else's songs; matching them returns the wrong album and year.
// Checked against artist and album names only, so legitimate song titles are never rejected.
const IMITATION = /\b(tribute|karaoke|made famous|originally performed|in the style of|lullaby|renditions?|covers)\b/i;
// Alternate takes of the same song; the original studio version should win.
const ALT_TAKE = /\b(live|remaster(ed)?|re-?recorded|demo|acoustic|remix|version|instrumental)\b/i;

/**
 * Pick the iTunes result that is the original recording by the requested artist.
 * Exact artist and title matches win, imitation acts are rejected, and ties go to the earliest release.
 */
export function pickBestItunesResult(results: any[], artist: string, title: string): any | null {
  const wantArtist = squash(artist);
  const wantTitle = squash(title);
  let best: any = null;
  let bestScore = 0;
  let bestYear = Infinity;

  for (const result of results) {
    if (IMITATION.test(`${result.artistName || ''} ${result.collectionName || ''}`) && !IMITATION.test(`${artist} ${title}`)) continue;

    const gotArtist = squash(result.artistName);
    const gotTitle = squash(result.trackName);
    const artistExact = gotArtist === wantArtist;
    const artistPartial = !artistExact && !!gotArtist && (gotArtist.includes(wantArtist) || wantArtist.includes(gotArtist));
    const titleExact = gotTitle === wantTitle;
    const titlePartial = !titleExact && !!gotTitle && (gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle));
    if (!(artistExact || artistPartial) || !(titleExact || titlePartial)) continue;

    let score = (artistExact ? 60 : 30) + (titleExact ? 40 : 20);
    if (ALT_TAKE.test(`${result.trackName || ''} ${result.collectionName || ''}`) && !ALT_TAKE.test(title)) score -= 15;

    const year = result.releaseDate ? parseInt(String(result.releaseDate).split('-')[0], 10) : Infinity;
    if (score > bestScore || (score === bestScore && year < bestYear)) {
      best = result;
      bestScore = score;
      bestYear = Number.isNaN(year) ? Infinity : year;
    }
  }
  return best;
}

export async function fetchFromiTunes(artist: string, title: string): Promise<iTunesResult | null> {
  try {
    // iTunes search query
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `${ITUNES_API}?term=${query}&entity=song&limit=10`;
    
    console.log('[iTunes] Searching for:', artist, '-', title);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MixtapeBattle/1.0.0',
      },
    });

    if (!response.ok) {
      console.error('[iTunes] API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('[iTunes] No results found');
      return null;
    }

    console.log(`[iTunes] Found ${data.results.length} results`);
    
    const bestMatch = pickBestItunesResult(data.results, artist, title);
    
    if (!bestMatch) {
      console.log('[iTunes] No good match found');
      return null;
    }
    
    console.log('[iTunes] Best match:', bestMatch.trackName, 'by', bestMatch.artistName);
    
    // iTunes provides artwork at 100x100 by default, we can get larger versions
    // by replacing 100x100 with 600x600 in the URL
    let albumArtUrl = bestMatch.artworkUrl100;
    if (albumArtUrl) {
      albumArtUrl = albumArtUrl.replace('100x100', '600x600');
      console.log('[iTunes] Found album art:', albumArtUrl);
    }
    
    // Parse release year from releaseDate (format: YYYY-MM-DDTHH:MM:SSZ)
    let releaseDate = null;
    if (bestMatch.releaseDate) {
      const year = bestMatch.releaseDate.split('-')[0];
      releaseDate = parseInt(year, 10);
    }
    
    return {
      albumArtUrl,
      album: bestMatch.collectionName || null,
      releaseDate,
      // lower-case to match the MusicBrainz tag style already stored on songs
      genre: typeof bestMatch.primaryGenreName === 'string' && bestMatch.primaryGenreName.trim()
        ? bestMatch.primaryGenreName.trim().toLowerCase()
        : null,
    };
  } catch (error) {
    console.error('[iTunes] Error:', error);
    return null;
  }
}
