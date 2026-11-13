import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-with-credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";
import { validatePassword } from "@/lib/password-validation";
import { sanitizeError, logError, ErrorMessages } from "@/lib/error-handler";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";
import { userRef } from "@/lib/log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, resetToken } = body;

    // Require CSRF token for session-based password changes
    if (!resetToken && !verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: "Password does not meet requirements",
          details: passwordValidation.errors 
        },
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
        return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
      }

      if (passwordReset.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
      }

      if (passwordReset.usedAt) {
        return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword },
    });

    console.log("[SET-PASSWORD] Password changed for", userRef(userEmail), resetToken ? "(reset link)" : "(session)");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError('[SET-PASSWORD]', error);
    return NextResponse.json(
      { error: sanitizeError(error, ErrorMessages.PASSWORD_CHANGE_FAILED) },
      { status: 500 }
    );
  }
}
