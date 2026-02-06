import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "../../../../lib/prisma";

const DEFAULTS = {
  pairingCooldownDays: 7,
  skipCooldownHours: 6,
  weights: {
    genre: 2,
    decade: 1.5,
    artist: 2,
    energyMood: 1.5,
  },
};

function normalizedPair(aId: number, bId: number) {
  return aId < bId ? [aId, bId] : [bId, aId];
}

function pickWeighted<T>(items: T[], weightFor: (item: T) => number) {
  const weights = items.map((item) => Math.max(0, weightFor(item)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const songs = await prisma.song.findMany({ take: 200, orderBy: { elo: "desc" } });
  if (songs.length < 2) return new Response(null, { status: 204 });

  const now = new Date();
  const prefs = userId
    ? await prisma.userPreference.findUnique({ where: { userId } })
    : null;

  const excludedSongIds = new Set<number>(prefs?.excludedSongIds ?? []);
  if (userId) {
    const skipCutoff = new Date(now.getTime() - DEFAULTS.skipCooldownHours * 60 * 60 * 1000);
    const skips = await prisma.battleSkip.findMany({
      where: { userId, lastSkippedAt: { gte: skipCutoff } },
      select: { songId: true },
    });
    for (const skip of skips) excludedSongIds.add(skip.songId);
  }

  const candidates = songs.filter((song) => !excludedSongIds.has(song.id));
  if (candidates.length < 2) return new Response(null, { status: 204 });

  const recentPairKeys = new Set<string>();
  if (userId) {
    const pairCutoff = new Date(now.getTime() - DEFAULTS.pairingCooldownDays * 24 * 60 * 60 * 1000);
    const recentPairs = await prisma.battlePairingHistory.findMany({
      where: { userId, createdAt: { gte: pairCutoff } },
      select: { songAId: true, songBId: true },
    });
    for (const pair of recentPairs) {
      const [aId, bId] = normalizedPair(pair.songAId, pair.songBId);
      recentPairKeys.add(`${aId}-${bId}`);
    }
  }

  const weightFor = (song: (typeof candidates)[number]) => {
    if (!prefs) return 1;
    let weight = 1;
    if (song.genre && prefs.genres.includes(song.genre)) weight += DEFAULTS.weights.genre;
    if (song.artist && prefs.artists.includes(song.artist)) weight += DEFAULTS.weights.artist;
    if (song.energyMood && prefs.energyMoods.includes(song.energyMood)) weight += DEFAULTS.weights.energyMood;
    const decade = song.decade ?? (song.releaseDate ? Math.floor(song.releaseDate / 10) * 10 : null);
    if (decade && prefs.decades.includes(decade)) weight += DEFAULTS.weights.decade;
    return weight;
  };

  const pivot = pickWeighted(candidates, weightFor);
  const eligible = candidates.filter((song) => song.id !== pivot.id);
  const filtered = eligible.filter((song) => {
    if (!userId) return true;
    const [aId, bId] = normalizedPair(pivot.id, song.id);
    return !recentPairKeys.has(`${aId}-${bId}`);
  });

  const pool = filtered.length ? filtered : eligible;
  const candidate = pool.sort(
    (a, b) => Math.abs(a.elo - pivot.elo) - Math.abs(b.elo - pivot.elo)
  )[0];

  return new Response(JSON.stringify({ a: pivot, b: candidate }), {
    headers: { "Content-Type": "application/json" },
  });
}
