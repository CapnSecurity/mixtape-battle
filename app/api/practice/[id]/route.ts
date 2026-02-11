import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

// PATCH /api/practice/[id] - Update practice item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { id } = await params;
    const { status, priority, notes } = body;

    // Verify ownership
    const existing = await prisma.practiceListItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Practice item not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};
    
    let readinessStatusToSet: 'NOT_READY' | 'NEEDS_WORK' | 'SOLID' | null = null;
    
    if (status && ['NOT_STARTED', 'LEARNING', 'CONFIDENT'].includes(status)) {
      updateData.status = status;
      
      // Map practice status to readiness status
      if (status === 'NOT_STARTED') {
        readinessStatusToSet = 'NOT_READY';
      } else if (status === 'LEARNING') {
        readinessStatusToSet = 'NEEDS_WORK';
      } else if (status === 'CONFIDENT') {
        readinessStatusToSet = 'SOLID';
      }
    }
    
    if (priority !== undefined && typeof priority === 'number' && priority >= 1 && priority <= 5) {
      updateData.priority = priority;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    // Update practice item
    const updated = await prisma.practiceListItem.update({
      where: { id },
      data: updateData,
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            albumArtUrl: true,
          },
        },
      },
    });

    // Sync readiness status if practice status was updated
    if (readinessStatusToSet) {
      await prisma.songReadiness.upsert({
        where: {
          songId_userId: {
            songId: existing.songId,
            userId: userId,
          },
        },
        update: {
          status: readinessStatusToSet,
        },
        create: {
          songId: existing.songId,
          userId: userId,
          status: readinessStatusToSet,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating practice item:", error);
    return NextResponse.json(
      { error: "Failed to update practice item" },
      { status: 500 }
    );
  }
}

// DELETE /api/practice/[id] - Remove from practice list
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.practiceListItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Practice item not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete practice item
    await prisma.practiceListItem.delete({
      where: { id },
    });

    // Also remove readiness vote since they're no longer tracking this song
    await prisma.songReadiness.deleteMany({
      where: {
        songId: existing.songId,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting practice item:", error);
    return NextResponse.json(
      { error: "Failed to delete practice item" },
      { status: 500 }
    );
  }
}
