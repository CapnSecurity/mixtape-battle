import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimiters } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limit invite creation
    const rateLimitResult = await rateLimiters.admin(req);
    if (!rateLimitResult.success) {
      console.log("[INVITE] Rate limit exceeded");
      return rateLimitResult.response;
    }

    const { email } = await req.json();
    console.log("[INVITE] Invite request for:", email);
    
    if (!email || typeof email !== 'string') {
      console.log("[INVITE] Invalid email format");
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Only allow admin (tim@levesques.net) to invite
    // (In production, check session or JWT)
    // For now, allow all POSTs for local dev

    // Generate secure token
    console.log("[INVITE] Generating invite token");
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
    
    console.log('[INVITE] Email config:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
    });
    
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

    const info = await transporter.sendMail(mailOptions);
    console.log('[INVITE] Email sent successfully to:', email);
    console.log('[INVITE] Response:', info.response);
    console.log('[INVITE] MessageId:', info.messageId);
    console.log('[INVITE] Accepted:', info.accepted);
    console.log('[INVITE] Rejected:', info.rejected);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[INVITE] ERROR:', error);
    console.error('[INVITE] Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to send invite: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
