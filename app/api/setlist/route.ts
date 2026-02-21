import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';

// GET /api/setlist - Get all setlist entries ordered by position
export async function GET() {
  try {
    const entries = await prisma.setlistEntry.findMany({
      include: {
        song: {
          include: {
            readiness: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('[SETLIST] Error fetching setlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setlist' },
      { status: 500 }
    );
  }
}
