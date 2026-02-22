/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove punctuation and special characters
 * - Normalize whitespace
 * - Trim
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of edits needed to change one string into another
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 * 1 = identical, 0 = completely different
 */
export function similarityRatio(str1: string, str2: string): number {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  if (normalized1 === normalized2) {
    return 1;
  }

  const maxLen = Math.max(normalized1.length, normalized2.length);
  if (maxLen === 0) {
    return 1;
  }

  const distance = levenshteinDistance(normalized1, normalized2);
  return 1 - distance / maxLen;
}

/**
 * Check if two strings are similar based on a threshold
 * Default threshold: 0.85 (85% similar)
 */
export function areSimilar(str1: string, str2: string, threshold: number = 0.85): boolean {
  return similarityRatio(str1, str2) >= threshold;
}

/**
 * Find similar songs in a list
 * Returns songs where both title and artist are similar
 */
export interface SimilarSong {
  id: number;
  title: string;
  artist: string;
  titleSimilarity: number;
  artistSimilarity: number;
  overallSimilarity: number;
}

export function findSimilarSongs(
  targetTitle: string,
  targetArtist: string,
  songs: Array<{ id: number; title: string; artist: string }>,
  threshold: number = 0.85
): SimilarSong[] {
  const similar: SimilarSong[] = [];

  for (const song of songs) {
    const titleSim = similarityRatio(targetTitle, song.title);
    const artistSim = similarityRatio(targetArtist, song.artist);
    
    // Overall similarity: weighted average (title 60%, artist 40%)
    const overallSim = titleSim * 0.6 + artistSim * 0.4;

    // Consider similar if both title and artist meet threshold, or overall is very high
    if ((titleSim >= threshold && artistSim >= threshold) || overallSim >= 0.9) {
      similar.push({
        id: song.id,
        title: song.title,
        artist: song.artist,
        titleSimilarity: titleSim,
        artistSimilarity: artistSim,
        overallSimilarity: overallSim,
      });
    }
  }

  // Sort by overall similarity (most similar first)
  return similar.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
}
