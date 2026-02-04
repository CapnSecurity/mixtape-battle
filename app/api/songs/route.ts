import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
        songsterrGuitarUrl: true,
        songsterrBassUrl: true,
        lyricsUrl: true,
        youtubeUrl: true,
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
