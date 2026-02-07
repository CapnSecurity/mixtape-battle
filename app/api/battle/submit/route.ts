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
    const dailyVoteLimit = 100;
    const pairDailyLimit = 3;
    const voteCooldownMs = 5 * 1000;

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
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lastVote = await prisma.battleVote.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (lastVote) {
      const elapsedMs = Date.now() - lastVote.createdAt.getTime();
      if (elapsedMs < voteCooldownMs) {
        const retryAfter = Math.ceil((voteCooldownMs - elapsedMs) / 1000);
        return NextResponse.json(
          { error: "You are voting too quickly. Please wait a moment.", retryAfter },
          { status: 429, headers: { "Retry-After": retryAfter.toString() } }
        );
      }
    }

    const normalizedPair = (aId: number, bId: number) => (aId < bId ? [aId, bId] : [bId, aId]);
    const [songAId, songBId] = normalizedPair(winnerId, loserId);

    if (!skipped) {
      const dayStart = new Date();
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const [dailyCount, pairCount] = await Promise.all([
        prisma.battleVote.count({
          where: {
            userId,
            winner: { not: null },
            createdAt: { gte: dayStart },
          },
        }),
        prisma.battleVote.count({
          where: {
            userId,
            songA: songAId,
            songB: songBId,
            winner: { not: null },
            createdAt: { gte: dayStart },
          },
        }),
      ]);

      if (dailyCount >= dailyVoteLimit) {
        const retryAfter = Math.ceil((dayEnd.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          { error: "Daily vote limit reached. Try again tomorrow.", retryAfter },
          { status: 429, headers: { "Retry-After": retryAfter.toString() } }
        );
      }

      if (pairCount >= pairDailyLimit) {
        return NextResponse.json(
          { error: "Pairing vote limit reached. Please try a different matchup." },
          { status: 429 }
        );
      }
    }

    if (skipped) {
      await prisma.$transaction([
        prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: null, userId } }),
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
      prisma.battleVote.create({ data: { songA: winnerId, songB: loserId, winner: winnerId, userId } }),
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
