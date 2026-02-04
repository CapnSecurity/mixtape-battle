import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Configure nodemailer (use your env vars)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'You are invited to Mixtape Battle',
    text: `You have been invited to join Mixtape Battle! Click here to sign up: ${inviteUrl}`,
    html: `<p>You have been invited to join <b>Mixtape Battle</b>!<br/>Click here to sign up: <a href="${inviteUrl}">${inviteUrl}</a></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
