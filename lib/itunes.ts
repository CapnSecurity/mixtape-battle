// iTunes Search API helper
// Free API, no authentication required

const ITUNES_API = 'https://itunes.apple.com/search';

export interface iTunesResult {
  albumArtUrl: string | null;
  album: string | null;
  releaseDate: number | null;
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
    
    // Find best match
    const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const result of data.results) {
      const resultArtist = (result.artistName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const resultTitle = (result.trackName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const artistMatch = resultArtist.includes(normalizedArtist) || normalizedArtist.includes(resultArtist);
      const titleMatch = resultTitle.includes(normalizedTitle) || normalizedTitle.includes(resultTitle);
      
      if (artistMatch && titleMatch) {
        const score = (artistMatch ? 50 : 0) + (titleMatch ? 50 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = result;
        }
      }
    }
    
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
    };
  } catch (error) {
    console.error('[iTunes] Error:', error);
    return null;
  }
}
