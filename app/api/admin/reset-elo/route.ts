import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";
import { sanitizeError, logError } from "@/lib/error-handler";

const DEFAULT_ELO = 1500;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin privileges
    const user = session.user as { email?: string; isAdmin?: boolean };
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log("[RESET ELO] Invalid CSRF token");
      return csrfErrorResponse();
    }

    console.log(`[RESET ELO] Admin ${user.email} is resetting all ELO ratings to ${DEFAULT_ELO}`);

    // Reset all songs to default ELO
    const result = await prisma.song.updateMany({
      data: {
        elo: DEFAULT_ELO,
      },
    });

    // Optionally, clear all battle votes (uncomment if you want to also clear vote history)
    // await prisma.battleVote.deleteMany({});
    // await prisma.battlePairingHistory.deleteMany({});
    // await prisma.battleSkip.deleteMany({});

    console.log(`[RESET ELO] Successfully reset ELO for ${result.count} songs`);

    return NextResponse.json({
      success: true,
      message: `Reset ${result.count} songs to ELO ${DEFAULT_ELO}`,
      count: result.count,
    });
  } catch (error) {
    logError('[RESET ELO]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to reset ELO ratings') },
      { status: 500 }
    );
  }
}
