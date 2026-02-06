import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log("[DELETE USER] Invalid CSRF token");
      return csrfErrorResponse();
    }

    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (session.user?.email === email) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete the user and all related data
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete related invites
    await prisma.invite.deleteMany({ where: { email } });
    
    // Delete the user (cascade will handle related data)
    await prisma.user.delete({ where: { email } });

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} deleted successfully` 
    });
  } catch (error) {
    console.error("[DELETE USER ERROR]", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
