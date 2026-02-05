// MusicBrainz API helper to fetch song metadata
// No API key required - just need to set a user agent

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'MixtapeBattle/1.0.0 (https://mixtape.levesques.net)';

export async function fetchSongMetadata(artist: string, title: string) {
  try {
    // Search for recordings (songs) matching artist and title
    // Use MusicBrainz query syntax for more precise results
    const searchQuery = encodeURIComponent(`artist:"${artist}" AND recording:"${title}"`);
    const url = `${MUSICBRAINZ_API}/recording?query=${searchQuery}&fmt=json&limit=10`;
    
    console.log('[MusicBrainz] Searching for:', artist, '-', title);
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
      console.log('[MusicBrainz] No recordings found for:', artist, title);
      return null;
    }

    console.log(`[MusicBrainz] Found ${data.recordings.length} recordings`);
    
    // Find the best match by checking artist and title similarity
    const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const recording of data.recordings) {
      // Check if this recording matches our search
      const recordingTitle = (recording.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const recordingArtist = (recording['artist-credit']?.[0]?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      console.log(`[MusicBrainz] Comparing: "${recordingArtist}" vs "${normalizedArtist}", "${recordingTitle}" vs "${normalizedTitle}"`);
      
      // Simple similarity score: both title and artist must contain the search terms
      const titleMatch = recordingTitle.includes(normalizedTitle) || normalizedTitle.includes(recordingTitle);
      const artistMatch = recordingArtist.includes(normalizedArtist) || normalizedArtist.includes(recordingArtist);
      
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
      
      // Extract year from date (format: YYYY-MM-DD or YYYY)
      if (primaryRelease.date) {
        const year = primaryRelease.date.split('-')[0];
        releaseDate = parseInt(year, 10);
      }
      
      console.log('[MusicBrainz] Found album:', album, 'year:', releaseDate);
    }

    return {
      album,
      releaseDate,
      confidence: bestScore,
    };
  } catch (error) {
    console.error('[MusicBrainz] Error fetching data:', error);
    return null;
  }
}
