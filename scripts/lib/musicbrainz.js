"use strict";
// MusicBrainz API helper to fetch song metadata
// No API key required - just need to set a user agent
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSongMetadata = fetchSongMetadata;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const COVERART_API = 'https://coverartarchive.org';
const USER_AGENT = 'MixtapeBattle/1.0.0 (https://mixtape.levesques.net)';
const CACHE_DIR = path_1.default.join(process.cwd(), '.cache', 'musicbrainz');
const RATE_LIMIT_MS = 1000; // MusicBrainz asks for 1 request per second
// Ensure cache directory exists
if (typeof window === 'undefined') {
    try {
        fs_1.default.mkdirSync(CACHE_DIR, { recursive: true });
    }
    catch (err) {
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
function getCachePath(artist, title) {
    const key = `${artist.toLowerCase()}-${title.toLowerCase()}`.replace(/[^a-z0-9-]/g, '_');
    return path_1.default.join(CACHE_DIR, `${key}.json`);
}
/**
 * Load cached metadata if available
 */
function loadCache(artist, title) {
    if (typeof window !== 'undefined')
        return null; // Only cache on server
    try {
        const cachePath = getCachePath(artist, title);
        if (fs_1.default.existsSync(cachePath)) {
            const cached = JSON.parse(fs_1.default.readFileSync(cachePath, 'utf-8'));
            const age = Date.now() - cached.timestamp;
            // Cache valid for 30 days
            if (age < 30 * 24 * 60 * 60 * 1000) {
                console.log('[MusicBrainz] Using cached data for:', artist, '-', title);
                return cached.data;
            }
        }
    }
    catch (err) {
        console.warn('[MusicBrainz] Cache read error:', err);
    }
    return null;
}
/**
 * Save metadata to cache
 */
function saveCache(artist, title, data) {
    if (typeof window !== 'undefined')
        return; // Only cache on server
    try {
        const cachePath = getCachePath(artist, title);
        fs_1.default.writeFileSync(cachePath, JSON.stringify({
            timestamp: Date.now(),
            artist,
            title,
            data
        }), 'utf-8');
        console.log('[MusicBrainz] Cached data for:', artist, '-', title);
    }
    catch (err) {
        console.warn('[MusicBrainz] Cache write error:', err);
    }
}
/**
 * Fetch album art from Cover Art Archive
 */
async function fetchAlbumArt(releaseId) {
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
    }
    catch (error) {
        console.error('[CoverArt] Error fetching album art:', error);
        return null;
    }
}
async function fetchSongMetadata(artist, title) {
    try {
        // Search for recordings (songs) matching artist and title
        // Request tags and release info in the same query
        const searchQuery = encodeURIComponent(`artist:"${artist}" AND recording:"${title}"`);
        const url = `${MUSICBRAINZ_API}/recording?query=${searchQuery}&fmt=json&limit=10&inc=tags+releases+artist-credits`;
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
        let releaseId = null;
        let decade = null;
        if (bestMatch.releases && bestMatch.releases.length > 0) {
            // Get the earliest official release
            const officialReleases = bestMatch.releases
                .filter((r) => r.status === 'Official')
                .sort((a, b) => {
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
            const sortedTags = [...bestMatch.tags].sort((a, b) => (b.count || 0) - (a.count || 0));
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
        // Cache the result
        saveCache(artist, title, result);
        return result;
    }
    catch (error) {
        console.error('[MusicBrainz] Error fetching data:', error);
        // Cache the null result to avoid repeated failed lookups
        saveCache(artist, title, null);
        return null;
    }
}
