import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { songId, youtubeUrl, songsterrUrl, ultimateGuitarUrl, lyricsUrl } = await req.json();

    if (!songId) {
      return NextResponse.json({ error: "Song ID required" }, { status: 400 });
    }

    // Update the song with the provided URLs
    const updated = await prisma.song.update({
      where: { id: Number(songId) },
      data: {
        youtube: youtubeUrl || null,
        songsterr: songsterrUrl || null,
        ultimateGuitar: ultimateGuitarUrl || null,
        lyrics: lyricsUrl || null,
      },
    });

    return NextResponse.json({ success: true, song: updated });
  } catch (error) {
    console.error("Error updating song links:", error);
    return NextResponse.json(
      { error: "Failed to update song links" },
      { status: 500 }
    );
  }
}
