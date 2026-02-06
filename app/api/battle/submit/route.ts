import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "../../../../lib/prisma";
import { expectedScore, newRating, kFactor } from "../../../../lib/elo";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeError, logError } from "@/lib/error-handler";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    // Check authentication - battles require sign in
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("[BATTLE] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit battle votes to prevent spam
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      console.log("[BATTLE] Rate limit exceeded");
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log("[BATTLE] Invalid CSRF token");
      return csrfErrorResponse();
    }
    const { winnerId, loserId, skipped } = body;
    const userId = session.user.id as string;
    const normalizedPair = (aId: number, bId: number) => (aId < bId ? [aId, bId] : [bId, aId]);
    const [songAId, songBId] = normalizedPair(winnerId, loserId);

    if (skipped) {
      await prisma.$transaction([
        prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: null } }),
        prisma.battlePairingHistory.upsert({
          where: { userId_songAId_songBId: { userId, songAId, songBId } },
          create: { userId, songAId, songBId },
          update: { createdAt: new Date() },
        }),
        prisma.battleSkip.upsert({
          where: { userId_songId: { userId, songId: winnerId } },
          create: { userId, songId: winnerId },
          update: { lastSkippedAt: new Date() },
        }),
        prisma.battleSkip.upsert({
          where: { userId_songId: { userId, songId: loserId } },
          create: { userId, songId: loserId },
          update: { lastSkippedAt: new Date() },
        }),
      ]);
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
      prisma.battlePairingHistory.upsert({
        where: { userId_songAId_songBId: { userId, songAId, songBId } },
        create: { userId, songAId, songBId },
        update: { createdAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    logError('[BATTLE]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to submit battle vote') },
      { status: 500 }
    );
  }
}
