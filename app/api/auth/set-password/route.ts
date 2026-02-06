import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-with-credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";

export async function POST(req: NextRequest) {
  const { password, resetToken } = await req.json();

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  let userEmail: string;

  // Handle password reset via token
  if (resetToken) {
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token: resetToken },
    });

    if (!passwordReset) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (passwordReset.expiresAt < new Date()) {
      return NextResponse.json({ error: "Reset token expired" }, { status: 400 });
    }

    if (passwordReset.usedAt) {
      return NextResponse.json({ error: "Reset token already used" }, { status: 400 });
    }

    userEmail = passwordReset.email;

    // Mark token as used
    await prisma.passwordReset.update({
      where: { token: resetToken },
      data: { usedAt: new Date() },
    });
  } else {
    // Handle password set via authenticated session
    const session = (await getServerSession(authOptions as any)) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userEmail = session.user.email;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}
