import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/password-validation';
import { sanitizeError, logError } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimiters.auth(req);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json().catch(() => null);
    const token = body?.token;
    const password = body?.password;
    if (typeof token !== 'string' || typeof password !== 'string' || !token || !password || token.length > 200 || password.length > 200 || token.includes('\u0000')) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    // Claim the invite and create/update the user in one transaction so a token
    // cannot be redeemed twice by concurrent requests.
    const ok = await prisma.$transaction(async (tx) => {
      const claimed = await tx.invite.updateMany({
        where: { token, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) return false;

      const invite = await tx.invite.findUnique({ where: { token } });
      if (!invite) return false;

      const existing = await tx.user.findUnique({ where: { email: invite.email } });
      if (existing) {
        await tx.user.update({ where: { id: existing.id }, data: { password: hash } });
      } else {
        await tx.user.create({ data: { email: invite.email, password: hash } });
      }
      return true;
    });

    if (!ok) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    logError('[INVITE-ACCEPT]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Unable to process invite') },
      { status: 500 }
    );
  }
}
