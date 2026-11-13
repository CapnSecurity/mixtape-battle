import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimiters } from '@/lib/rate-limit';
import { sanitizeError, logError } from '@/lib/error-handler';
import { verifyCsrfToken, csrfErrorResponse } from '@/lib/csrf';
import { userRef } from '@/lib/log';

export async function POST(req: NextRequest) {
  try {
    // Rate limit invite creation
    const rateLimitResult = await rateLimiters.admin(req);
    if (!rateLimitResult.success) {
      console.log("[INVITE] Rate limit exceeded");
      return rateLimitResult.response;
    }

    // Check if user is admin
    const session = await getServerSession(authOptions as any);
    const user = (session as any)?.user as { isAdmin?: boolean } | undefined;
    if (!user?.isAdmin) {
      console.log('[INVITE] Unauthorized - not admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log('[INVITE] Invalid CSRF token');
      return csrfErrorResponse();
    }

    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days

    // Store invite in DB
    await prisma.invite.create({
      data: {
        email,
        token,
        expiresAt,
        invitedById: null, // TODO: set to admin user id if available
      },
    });

    // Email invite link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/signup?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'You are invited to Mixtape Battle',
      text: `You have been invited to join Mixtape Battle! Click here to sign up: ${inviteUrl}`,
      html: `<p>You have been invited to join <b>Mixtape Battle</b>!<br/>Click here to sign up: <a href="${inviteUrl}">${inviteUrl}</a></p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('[INVITE] Invite email sent to', userRef(email));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    logError('[INVITE]', error);
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to send invite') },
      { status: 500 }
    );
  }
}
