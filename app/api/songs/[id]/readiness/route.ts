import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

type Params = Promise<{ id: string }>;

// GET readiness for a song
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const songId = parseInt(id);
    const userId = (session.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all readiness entries for this song
    const allReadiness = await prisma.songReadiness.findMany({
      where: { songId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get current user's readiness
    const userReadiness = allReadiness.find((r) => r.userId === userId);

    // Calculate aggregate statistics
    const counts = {
      SOLID: allReadiness.filter((r) => r.status === "SOLID").length,
      NEEDS_WORK: allReadiness.filter((r) => r.status === "NEEDS_WORK").length,
      NOT_READY: allReadiness.filter((r) => r.status === "NOT_READY").length,
    };

    // Calculate aggregate status
    let aggregateStatus: "SOLID" | "NEEDS_WORK" | "NOT_READY" | "NONE" = "NONE";
    if (allReadiness.length > 0) {
      if (counts.NOT_READY > 0) {
        aggregateStatus = "NOT_READY";
      } else if (counts.NEEDS_WORK > 0) {
        aggregateStatus = "NEEDS_WORK";
      } else if (counts.SOLID > 0) {
        aggregateStatus = "SOLID";
      }
    }

    // Calculate average readiness score (SOLID=2, NEEDS_WORK=1, NOT_READY=0)
    const totalScore = allReadiness.reduce((sum, r) => {
      const score = r.status === "SOLID" ? 2 : r.status === "NEEDS_WORK" ? 1 : 0;
      return sum + score;
    }, 0);
    const avgScore = allReadiness.length > 0 ? totalScore / allReadiness.length : 0;

    return NextResponse.json({
      userReadiness: userReadiness?.status || null,
      aggregate: {
        status: aggregateStatus,
        counts,
        avgScore,
        totalVotes: allReadiness.length,
      },
    });
  } catch (error) {
    console.error("Error fetching readiness:", error);
    return NextResponse.json(
      { error: "Failed to fetch readiness" },
      { status: 500 }
    );
  }
}

// POST set readiness for current user
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const songId = parseInt(id);
    const userId = (session.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { status } = body;

    // Validate status
    if (!["SOLID", "NEEDS_WORK", "NOT_READY"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify song exists
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Upsert readiness
    const readiness = await prisma.songReadiness.upsert({
      where: {
        songId_userId: {
          songId,
          userId,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        songId,
        userId,
        status,
      },
    });

    return NextResponse.json({ success: true, readiness });
  } catch (error) {
    console.error("Error setting readiness:", error);
    return NextResponse.json(
      { error: "Failed to set readiness" },
      { status: 500 }
    );
  }
}
