import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';
import { userRef } from '@/lib/log';
import { readJsonObject, isDbInt } from '@/lib/http';

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

    const body = await readJsonObject(req);
    if (body instanceof NextResponse) return body;

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[SETLIST-REORDER] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { order } = body;

    if (!Array.isArray(order) || order.length > 500) {
      return NextResponse.json({ error: 'Invalid order array' }, { status: 400 });
    }

    // Validate order array
    for (const item of order) {
      if (
        item === null || typeof item !== 'object' ||
        !isDbInt(item.songId) ||
        typeof item.position !== 'number' || !Number.isInteger(item.position) || item.position < 0 || item.position > 100000
      ) {
        return NextResponse.json({ error: 'Invalid order item format' }, { status: 400 });
      }
    }

    // Update all positions in a transaction
    try {
      await prisma.$transaction(
        order.map((item) =>
          prisma.setlistEntry.update({
            where: { songId: item.songId },
            data: { position: item.position },
          })
        )
      );
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return NextResponse.json({ error: 'Order contains a song that is not in the setlist' }, { status: 400 });
      }
      throw error;
    }

    console.log(`[SETLIST-REORDER] Reordered ${order.length} songs by ${userRef(user.email)}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SETLIST-REORDER] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder setlist' },
      { status: 500 }
    );
  }
}
