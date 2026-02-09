import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

type Params = Promise<{ id: string }>;

/**
 * POST /api/songs/[id]/practice
 * 
 * Update practice tracking information for a song (admin-only).
 * 
 * Request body: {
 *   markPracticed?: boolean,
 *   keyNotes?: string,
 *   tuningNotes?: string,
 *   csrfToken: string
 * }
 * 
 * Requires:
 * - Authentication
 * - Admin role
 * - Valid CSRF token
 * 
 * Updates shared band practice data:
 * - lastPracticedAt (if markPracticed=true)
 * - keyNotes (key signature, capo info)
 * - tuningNotes (alternate tunings, etc.)
 * 
 * Response: { song }
 */
// POST update practice date and notes
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = (session.user as any)?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const songId = parseInt(id);

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { markPracticed, keyNotes, tuningNotes } = body;

    // Verify song exists
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Build update data
    const updateData: {
      lastPracticedAt?: Date;
      keyNotes?: string | null;
      tuningNotes?: string | null;
    } = {};

    if (markPracticed) {
      updateData.lastPracticedAt = new Date();
    }

    if (keyNotes !== undefined) {
      updateData.keyNotes = keyNotes || null;
    }

    if (tuningNotes !== undefined) {
      updateData.tuningNotes = tuningNotes || null;
    }

    // Update song
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: updateData,
    });

    return NextResponse.json({ success: true, song: updatedSong });
  } catch (error) {
    console.error("Error updating practice data:", error);
    return NextResponse.json(
      { error: "Failed to update practice data" },
      { status: 500 }
    );
  }
}
