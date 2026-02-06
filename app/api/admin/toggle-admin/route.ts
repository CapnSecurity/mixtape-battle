import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth-with-credentials";
import { prisma } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.admin(req);
    if (!rateLimitResult.success) {
      console.log('[toggle-admin] Rate limit exceeded');
      return rateLimitResult.response;
    }

    console.log('[toggle-admin] Processing admin toggle request');
    
    // Check authentication and admin status
    const session = (await getServerSession(authOptions as any)) as Session | null;
    
    if (!session?.user?.email) {
      console.log('[toggle-admin] Unauthorized - no session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, email: true }
    });

    if (!currentUser?.isAdmin) {
      console.log('[toggle-admin] Forbidden - user is not admin:', session.user.email);
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { email } = body;

    if (!email) {
      console.log('[toggle-admin] Bad request - missing email');
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log('[toggle-admin] Toggling admin status for:', email);

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isAdmin: true }
    });

    if (!targetUser) {
      console.log('[toggle-admin] User not found:', email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-demotion (optional safety check)
    if (targetUser.email === currentUser.email && targetUser.isAdmin) {
      console.log('[toggle-admin] Prevented self-demotion:', email);
      return NextResponse.json({ 
        error: "Cannot remove your own admin privileges" 
      }, { status: 400 });
    }

    // Toggle admin status
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: !targetUser.isAdmin },
      select: { id: true, email: true, isAdmin: true }
    });

    console.log('[toggle-admin] Successfully toggled admin status:', {
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('[toggle-admin] Error:', error);
    return NextResponse.json({ 
      error: "Failed to toggle admin status",
      details: error.message 
    }, { status: 500 });
  }
}
