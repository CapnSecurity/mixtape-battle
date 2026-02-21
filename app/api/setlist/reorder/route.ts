import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';

// POST /api/setlist/reorder - Reorder setlist positions (admin only)
// Accepts array of { songId, position } objects
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
      console.log('[SETLIST-REORDER] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order array' }, { status: 400 });
    }

    // Validate order array
    for (const item of order) {
      if (typeof item.songId !== 'number' || typeof item.position !== 'number') {
        return NextResponse.json({ error: 'Invalid order item format' }, { status: 400 });
      }
    }

    // Update all positions in a transaction
    await prisma.$transaction(
      order.map((item) =>
        prisma.setlistEntry.update({
          where: { songId: item.songId },
          data: { position: item.position },
        })
      )
    );

    console.log(`[SETLIST-REORDER] Reordered ${order.length} songs by ${user.email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SETLIST-REORDER] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder setlist' },
      { status: 500 }
    );
  }
}
