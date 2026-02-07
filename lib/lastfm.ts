// Last.fm API helper
// Free API, requires API key but we can use track.getInfo method

const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = '43693f63705cd4ede3aeff8755d96965'; // Public demo key for testing

export interface LastFmResult {
  albumArtUrl: string | null;
  album: string | null;
}

export async function fetchFromLastFm(artist: string, title: string): Promise<LastFmResult | null> {
  try {
    const url = `${LASTFM_API}?method=track.getInfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${LASTFM_API_KEY}&format=json`;
    
    console.log('[Last.fm] Searching for:', artist, '-', title);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MixtapeBattle/1.0.0',
      },
    });

    if (!response.ok) {
      console.error('[Last.fm] API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.track) {
      console.log('[Last.fm] No track found');
      return null;
    }

    const track = data.track;
    
    // Last.fm provides album images in multiple sizes
    let albumArtUrl = null;
    if (track.album?.image) {
      // Get the largest size available (usually "extralarge" or "mega")
      const images = track.album.image;
      const largeImage = images.find((img: any) => img.size === 'extralarge') || 
                         images.find((img: any) => img.size === 'large') ||
                         images[images.length - 1];
      
      if (largeImage && largeImage['#text']) {
        albumArtUrl = largeImage['#text'];
        console.log('[Last.fm] Found album art:', albumArtUrl);
      }
    }
    
    if (!albumArtUrl) {
      console.log('[Last.fm] No album art found');
      return null;
    }
    
    return {
      albumArtUrl,
      album: track.album?.title || null,
    };
  } catch (error) {
    console.error('[Last.fm] Error:', error);
    return null;
  }
}
