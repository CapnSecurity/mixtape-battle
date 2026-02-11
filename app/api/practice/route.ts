import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

// GET /api/practice - Fetch user's practice list
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const practiceList = await prisma.practiceListItem.findMany({
      where: { userId },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            albumArtUrl: true,
            elo: true,
            spotify: true,
            youtube: true,
            songsterr: true,
            ultimateGuitar: true,
            lyrics: true,
            keyNotes: true,
            tuningNotes: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // LEARNING first, then NOT_STARTED, then CONFIDENT
        { priority: 'desc' },
        { addedAt: 'desc' },
      ],
    });

    return NextResponse.json(practiceList);
  } catch (error) {
    console.error("Error fetching practice list:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice list" },
      { status: 500 }
    );
  }
}

// POST /api/practice - Add song to practice list
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { songId, priority, notes } = body;

    if (!songId || typeof songId !== 'number') {
      return NextResponse.json(
        { error: "Invalid songId" },
        { status: 400 }
      );
    }

    // Check if song exists
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Check if already in practice list
    const existing = await prisma.practiceListItem.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Song already in practice list" },
        { status: 409 }
      );
    }

    // Create practice list item
    const practiceItem = await prisma.practiceListItem.create({
      data: {
        userId,
        songId,
        priority: priority || 3,
        notes: notes || null,
        status: 'NOT_STARTED',
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            albumArtUrl: true,
          },
        },
      },
    });

    // Create initial readiness status (NOT_STARTED = NOT_READY)
    await prisma.songReadiness.upsert({
      where: {
        songId_userId: {
          songId: songId,
          userId: userId,
        },
      },
      update: {
        status: 'NOT_READY',
      },
      create: {
        songId: songId,
        userId: userId,
        status: 'NOT_READY',
      },
    });
    
    return NextResponse.json(practiceItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to practice list:", error);
    return NextResponse.json(
      { error: "Failed to add to practice list" },
      { status: 500 }
    );
  }
}
