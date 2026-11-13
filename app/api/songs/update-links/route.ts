import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-with-credentials";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";
import { normalizeHttpUrl } from "@/lib/input-sanitization";
import { readJsonObject, isDbInt, parseIdParam } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const user = session?.user as { isAdmin?: boolean } | undefined;
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readJsonObject(req);
    if (body instanceof NextResponse) return body;

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[UPDATE LINKS] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { songId, youtubeUrl, songsterrUrl, ultimateGuitarUrl, lyricsUrl } = body;

    const id = typeof songId === 'string' ? parseIdParam(songId) : songId;
    if (!isDbInt(id)) {
      return NextResponse.json({ error: "Song ID required" }, { status: 400 });
    }

    // Only absolute http(s) URLs are stored; these are rendered as links for every user.
    const links = {
      youtube: normalizeHttpUrl(youtubeUrl),
      songsterr: normalizeHttpUrl(songsterrUrl),
      ultimateGuitar: normalizeHttpUrl(ultimateGuitarUrl),
      lyrics: normalizeHttpUrl(lyricsUrl),
    };
    const invalid = Object.entries(links).find(([, r]) => !r.ok);
    if (invalid) {
      return NextResponse.json(
        { error: `Invalid ${invalid[0]} URL: it must start with http:// or https://` },
        { status: 400 }
      );
    }

    // Update the song with the provided URLs
    const updated = await prisma.song.update({
      where: { id },
      data: {
        youtube: links.youtube.url,
        songsterr: links.songsterr.url,
        ultimateGuitar: links.ultimateGuitar.url,
        lyrics: links.lyrics.url,
      },
    });

    return NextResponse.json({ success: true, song: updated });
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }
    console.error("Error updating song links:", error);
    return NextResponse.json(
      { error: "Failed to update song links" },
      { status: 500 }
    );
  }
}
