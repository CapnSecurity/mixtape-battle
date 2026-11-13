import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/password-validation';
import { sanitizeError, logError, ErrorMessages } from '@/lib/error-handler';
import { userRef } from '@/lib/log';
import { isValidEmail } from '@/lib/input-sanitization';
import { readJsonObject } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    // Rate limit signup to prevent account creation spam
    const rateLimitResult = await rateLimiters.auth(req);
    if (!rateLimitResult.success) {
      console.log("[SIGNUP] Rate limit exceeded");
      return rateLimitResult.response;
    }

    // Public registration is opt-in; otherwise accounts are created via the invite flow
    // (/signup?token=... -> /api/invite/accept).
    if (process.env.ALLOW_PUBLIC_SIGNUP !== 'true') {
      console.log("[SIGNUP] Rejected: public signup is disabled");
      return NextResponse.json(
        { error: 'Public sign-up is disabled. Please use the link in your invitation email.' },
        { status: 403 }
      );
    }

    const body = await readJsonObject(req);
    if (body instanceof NextResponse) return body;
    const { email, password } = body;

    if (!isValidEmail(email) || typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'Valid email and password required' }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors 
      }, { status: 400 });
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Use generic message to prevent account enumeration
      return NextResponse.json({ error: 'Unable to create account. Email may already be registered.' }, { status: 400 });
    }
    
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash },
    });
    
    console.log("[SIGNUP] User created:", userRef(email));
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    logError('[SIGNUP]', error);
    return NextResponse.json(
      { error: sanitizeError(error, ErrorMessages.ACCOUNT_ERROR) },
      { status: 500 }
    );
  }
}
