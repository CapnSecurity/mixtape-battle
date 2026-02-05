export function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function kFactor(rating: number, gamesPlayed = 0) {
  if (rating < 2100) return 32;
  if (rating >= 2100 && rating < 2400) return 24;
  return 16;
}

export function newRating(oldRating: number, expected: number, score: number, k = 32) {
  return oldRating + k * (score - expected);
}

// Convert an ELO rating to a 0-5 star value.
// Uses a simple linear mapping with sensible defaults; clamp to [0,5].
export function eloToStars(elo: number, min = 1000, max = 1600) {
  const clamped = Math.max(min, Math.min(max, elo));
  const ratio = (clamped - min) / Math.max(1, max - min);
  const stars = ratio * 5;
  return Math.round(stars * 10) / 10; // round to one decimal
}
