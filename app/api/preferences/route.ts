import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeError, logError } from "@/lib/error-handler";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      preferences: preferences || {
        genres: [],
        decades: [],
        artists: [],
      },
    });
  } catch (error: any) {
    logError('[PREFERENCES]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to load preferences') },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit preference updates
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { genres, decades, artists } = body;

    // Validate input
    if (!Array.isArray(genres) || !Array.isArray(decades) || !Array.isArray(artists)) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    // Validate decades are reasonable years
    if (decades.some(d => typeof d !== 'number' || d < 1900 || d > 2030)) {
      return NextResponse.json({ error: "Invalid decades" }, { status: 400 });
    }

    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        genres: genres.filter(g => typeof g === 'string' && g.length > 0),
        decades: [...new Set(decades)], // Remove duplicates
        artists: artists.filter(a => typeof a === 'string' && a.length > 0),
      },
      create: {
        userId: session.user.id,
        genres: genres.filter(g => typeof g === 'string' && g.length > 0),
        decades: [...new Set(decades)],
        artists: artists.filter(a => typeof a === 'string' && a.length > 0),
      },
    });

    return NextResponse.json({ preferences });
  } catch (error: any) {
    logError('[PREFERENCES]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to save preferences') },
      { status: 500 }
    );
  }
}