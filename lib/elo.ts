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
