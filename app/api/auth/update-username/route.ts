import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { sanitizeError, logError } from "@/lib/error-handler";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit
    const rateLimitResult = await rateLimiters.api(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { username } = body;

    // Validate username
    if (username && typeof username !== 'string') {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    if (username && username.length > 8) {
      return NextResponse.json({ error: "Username must be 8 characters or less" }, { status: 400 });
    }

    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ 
        error: "Username can only contain letters, numbers, hyphens, and underscores" 
      }, { status: 400 });
    }

    // Update user's name field
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: username.trim() || null },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError('[UPDATE_USERNAME]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to update username') },
      { status: 500 }
    );
  }
}
