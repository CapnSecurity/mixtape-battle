import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';
import { userRef } from '@/lib/log';
import { readJsonObject, parseIdParam, cleanText } from '@/lib/http';

// PATCH /api/setlist/[id] - Update setlist entry notes (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      console.log('[SETLIST-UPDATE] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { id } = await params;
    const entryId = parseIdParam(id);
    if (entryId === null) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
    }

    const notesCheck = cleanText(body.notes, 500);
    if (!notesCheck.ok) {
      return NextResponse.json({ error: 'Invalid notes' }, { status: 400 });
    }

    // Update the entry
    const entry = await prisma.setlistEntry.update({
      where: { id: entryId },
      data: { notes: notesCheck.value || null },
      include: { song: true },
    });

    console.log(`[SETLIST-UPDATE] Updated notes for entry ${entryId} by ${userRef(user.email)}`);
    return NextResponse.json({ entry });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    console.error('[SETLIST-UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
