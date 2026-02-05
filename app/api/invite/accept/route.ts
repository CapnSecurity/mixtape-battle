import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
  }
  // Create user if not exists
  let user = await prisma.user.findUnique({ where: { email: invite.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: invite.email, password: await bcrypt.hash(password, 10) } });
  } else {
    // If user exists, update password
    await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 10) } });
  }
  // Mark invite as used
  await prisma.invite.update({ where: { token }, data: { usedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
