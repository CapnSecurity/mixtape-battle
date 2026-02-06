import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  // Find the reset token
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  // Check if token was already used
  if (resetToken.usedAt) {
    return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  }

  return NextResponse.json({ email: resetToken.email });
}
