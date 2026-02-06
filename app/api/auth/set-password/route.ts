import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-with-credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    console.log("[SET-PASSWORD] Request received");
    const body = await req.json();
    const { password, resetToken } = body;
    console.log("[SET-PASSWORD] Has resetToken:", !!resetToken);

    if (!password || password.length < 8) {
      console.log("[SET-PASSWORD] Password validation failed");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    let userEmail: string;

    // Handle password reset via token
    if (resetToken) {
      console.log("[SET-PASSWORD] Processing reset token");
      const passwordReset = await prisma.passwordReset.findUnique({
        where: { token: resetToken },
      });

      if (!passwordReset) {
        console.log("[SET-PASSWORD] Invalid reset token");
        return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
      }

      if (passwordReset.expiresAt < new Date()) {
        console.log("[SET-PASSWORD] Reset token expired");
        return NextResponse.json({ error: "Reset token expired" }, { status: 400 });
      }

      if (passwordReset.usedAt) {
        console.log("[SET-PASSWORD] Reset token already used");
        return NextResponse.json({ error: "Reset token already used" }, { status: 400 });
      }

      userEmail = passwordReset.email;
      console.log("[SET-PASSWORD] Valid token for:", userEmail);

      // Mark token as used
      await prisma.passwordReset.update({
        where: { token: resetToken },
        data: { usedAt: new Date() },
      });
    } else {
      // Handle password set via authenticated session
      console.log("[SET-PASSWORD] Processing session-based request");
      const session = (await getServerSession(authOptions as any)) as Session | null;

      if (!session?.user?.email) {
        console.log("[SET-PASSWORD] No session found");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      userEmail = session.user.email;
      console.log("[SET-PASSWORD] Session user:", userEmail);
    }

    console.log("[SET-PASSWORD] Hashing password for:", userEmail);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("[SET-PASSWORD] Updating user password");
    await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
    });

    console.log("[SET-PASSWORD] Success for:", userEmail);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SET-PASSWORD] ERROR:", error);
    console.error("[SET-PASSWORD] Error stack:", error?.stack);
    console.error("[SET-PASSWORD] Error message:", error?.message);
    return NextResponse.json(
      { error: "Failed to set password: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
