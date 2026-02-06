import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-with-credentials";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const user = session?.user as { isAdmin?: boolean } | undefined;
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[UPDATE LINKS] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { songId, youtubeUrl, songsterrUrl, ultimateGuitarUrl, lyricsUrl } = body;

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
