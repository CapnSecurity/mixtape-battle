import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    console.log("[SEND-RESET] Request received");
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      console.log("[SEND-RESET] Unauthorized - not admin");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    console.log("[SEND-RESET] Sending reset to:", email);
    if (!email || typeof email !== 'string') {
      console.log("[SEND-RESET] Invalid email format");
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("[SEND-RESET] User not found:", email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate secure token
    console.log("[SEND-RESET] Generating token");
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Store password reset token in DB
    console.log("[SEND-RESET] Storing token in database");
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

  console.log("[SEND-RESET] Sending email to:", email);
  await transporter.sendMail(mailOptions);
  console.log('[SEND-RESET] Email sent successfully');
  return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[SEND-RESET] ERROR:', error);
    console.error('[SEND-RESET] Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to send password reset email: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
