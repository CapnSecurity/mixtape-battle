import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';
import { readJsonObject, parseIdParam, isCleanString, cleanText } from '@/lib/http';
import { userRef } from '@/lib/log';

type Params = Promise<{ id: string }>;

// PATCH /api/songs/[id]/edit - Update song metadata (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const songId = parseIdParam(id);
    const body = await readJsonObject(req);
    if (body instanceof NextResponse) return body;

    if (!verifyCsrfToken(req, body)) {
      console.log('[SONG-EDIT] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { title, artist, album, releaseDate, genre } = body;

    // Validate required fields
    if (songId === null) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    if (!isCleanString(title, 200) || !isCleanString(artist, 200) || !title.trim() || !artist.trim()) {
      return NextResponse.json(
        { error: 'Title and artist are required (200 characters max)' },
        { status: 400 }
      );
    }
    const albumCheck = cleanText(album, 200);
    const genreCheck = cleanText(genre, 100);
    if (!albumCheck.ok || !genreCheck.ok) {
      return NextResponse.json({ error: 'Invalid album or genre' }, { status: 400 });
    }
    let year: number | null = null;
    if (releaseDate !== undefined && releaseDate !== null && releaseDate !== '') {
      year = Number(releaseDate);
      if (!Number.isInteger(year) || year < 1000 || year > 2100) {
        return NextResponse.json({ error: 'Invalid release year' }, { status: 400 });
      }
    }

    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        title: title.trim(),
        artist: artist.trim(),
        album: albumCheck.value?.trim() || null,
        releaseDate: year,
        genre: genreCheck.value?.trim() || null,
      },
    });

    console.log('[SONG-EDIT] Updated song:', songId, 'by', userRef(session.user.email));
    return NextResponse.json({ song: updatedSong });
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    console.error('[SONG-EDIT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}
