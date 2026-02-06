import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Generate secure token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  // Store password reset token in DB
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  // Email password reset link
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/settings?token=${token}`;
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - Mixtape Battle',
    text: `You have requested to reset your password for Mixtape Battle. Click here to set a new password: ${resetUrl}\n\nThis link will expire in 24 hours.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Reset Your Password</h2>
        <p>You have requested to reset your password for <strong>Mixtape Battle</strong>.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b, #ec4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[PASSWORD RESET] Email sent successfully to:', email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PASSWORD RESET] Error sending email:', e);
    return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 });
  }
}
