import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting to prevent abuse
  const rateLimitResult = await rateLimiters.api(request);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const songs = await prisma.song.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        artist: true,
        elo: true,
        album: true,
        releaseDate: true,
        albumArtUrl: true,
        genre: true,
        durationMs: true,
        spotify: true,
        apple: true,
        youtube: true,
        bandcamp: true,
        soundcloud: true,
        lyrics: true,
        songsterr: true,
        ultimateGuitar: true,
      },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
