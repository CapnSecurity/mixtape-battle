import { prisma } from "../../../../lib/prisma";
import { expectedScore, newRating, kFactor } from "../../../../lib/elo";

export async function POST(request: Request) {
  const body = await request.json();
  const { winnerId, loserId, skipped } = body;

  if (skipped) {
    await prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: null } });
    return new Response(JSON.stringify({ ok: true }));
  }

  const winner = await prisma.song.findUnique({ where: { id: winnerId } });
  const loser = await prisma.song.findUnique({ where: { id: loserId } });
  if (!winner || !loser) return new Response(null, { status: 400 });

  const expectedW = expectedScore(winner.elo, loser.elo);
  const expectedL = expectedScore(loser.elo, winner.elo);

  const kW = kFactor(winner.elo);
  const kL = kFactor(loser.elo);

  const newW = newRating(winner.elo, expectedW, 1, kW);
  const newL = newRating(loser.elo, expectedL, 0, kL);

  await prisma.$transaction([
    prisma.song.update({ where: { id: winner.id }, data: { elo: newW } }),
    prisma.song.update({ where: { id: loser.id }, data: { elo: newL } }),
    prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: winnerId } }),
  ]);

  return new Response(JSON.stringify({ ok: true }));
}
