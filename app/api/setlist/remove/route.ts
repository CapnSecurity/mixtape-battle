import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';

// POST /api/setlist/remove - Remove a song from the setlist and reorder positions (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[SETLIST-REMOVE] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { songId } = body;

    if (!songId || typeof songId !== 'number') {
      return NextResponse.json({ error: 'Invalid songId' }, { status: 400 });
    }

    // Find the entry to get its position
    const entry = await prisma.setlistEntry.findUnique({ where: { songId } });
    if (!entry) {
      return NextResponse.json({ error: 'Song not in setlist' }, { status: 404 });
    }

    // Delete the entry and reorder others
    await prisma.$transaction(async (tx) => {
      // Delete the entry
      await tx.setlistEntry.delete({ where: { songId } });

      // Shift down all entries that were after this one
      await tx.setlistEntry.updateMany({
        where: { position: { gt: entry.position } },
        data: { position: { decrement: 1 } },
      });
    });

    console.log(`[SETLIST-REMOVE] Removed song ${songId} from position ${entry.position} by ${user.email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SETLIST-REMOVE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from setlist' },
      { status: 500 }
    );
  }
}
