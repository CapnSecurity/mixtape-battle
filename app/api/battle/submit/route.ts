import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { expectedScore, newRating, kFactor } from "../../../../lib/elo";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit battle votes to prevent spam
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      console.log("[BATTLE] Rate limit exceeded");
      return rateLimitResult.response;
    }

    const body = await req.json();
    const { winnerId, loserId, skipped } = body;

    if (skipped) {
      await prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: null } });
      return NextResponse.json({ ok: true });
    }

    const winner = await prisma.song.findUnique({ where: { id: winnerId } });
    const loser = await prisma.song.findUnique({ where: { id: loserId } });
    if (!winner || !loser) {
      console.log("[BATTLE] Invalid song IDs:", winnerId, loserId);
      return NextResponse.json({ error: "Invalid song IDs" }, { status: 400 });
    }

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

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[BATTLE] ERROR:", error);
    console.error("[BATTLE] Error stack:", error?.stack);
    return NextResponse.json(
      { error: 'Failed to submit battle vote: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
