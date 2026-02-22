import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';

// POST /api/setlist/add - Add a song to the setlist (admin only)
export async function POST(req: NextRequest) {
  try {
    console.log('[SETLIST-ADD] === Request started ===');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    console.log('[SETLIST-ADD] Session:', { hasSession: !!session, hasUser: !!user, isAdmin: !!user?.isAdmin });
    
    if (!user?.isAdmin) {
      console.log('[SETLIST-ADD] Rejected - not admin');
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[SETLIST-ADD] Request body:', body);
    console.log('[SETLIST-ADD] Headers:', Object.fromEntries(req.headers.entries()));

    // Verify CSRF token
    console.log('[SETLIST-ADD] Verifying CSRF token...');
    if (!verifyCsrfToken(req, body)) {
      console.log('[SETLIST-ADD] CSRF verification FAILED');
      return csrfErrorResponse();
    }
    console.log('[SETLIST-ADD] CSRF verification PASSED');

    const { songId, notes } = body;

    if (!songId || typeof songId !== 'number') {
      return NextResponse.json({ error: 'Invalid songId' }, { status: 400 });
    }

    // Check if song exists
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check if already in setlist
    const existing = await prisma.setlistEntry.findUnique({ where: { songId } });
    if (existing) {
      return NextResponse.json({ error: 'Song already in setlist' }, { status: 400 });
    }

    // Get the next position (max + 1)
    const maxPosition = await prisma.setlistEntry.aggregate({
      _max: { position: true },
    });
    const nextPosition = (maxPosition._max.position || 0) + 1;

    // Create setlist entry
    const entry = await prisma.setlistEntry.create({
      data: {
        songId,
        position: nextPosition,
        notes: notes || null,
        addedBy: user.email || 'unknown',
      },
      include: {
        song: true,
      },
    });

    console.log(`[SETLIST-ADD] Added song ${songId} at position ${nextPosition} by ${user.email}`);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('[SETLIST-ADD] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add to setlist' },
      { status: 500 }
    );
  }
}
