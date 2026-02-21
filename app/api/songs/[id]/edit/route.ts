import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';

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
    const songId = Number(id);
    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[SONG-EDIT] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { title, artist, album, releaseDate, genre } = body;

    // Validate required fields
    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      );
    }

    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        title: title.trim(),
        artist: artist.trim(),
        album: album?.trim() || null,
        releaseDate: releaseDate ? Number(releaseDate) : null,
        genre: genre?.trim() || null,
      },
    });

    console.log('[SONG-EDIT] Updated song:', songId, 'by', session.user.email);
    return NextResponse.json({ song: updatedSong });
  } catch (error) {
    console.error('[SONG-EDIT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}
