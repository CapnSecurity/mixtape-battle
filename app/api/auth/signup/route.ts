import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimiters } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/password-validation';
import { sanitizeError, logError, ErrorMessages } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    // Rate limit signup to prevent account creation spam
    const rateLimitResult = await rateLimiters.auth(req);
    if (!rateLimitResult.success) {
      console.log("[SIGNUP] Rate limit exceeded");
      return rateLimitResult.response;
    }

    const { email, password } = await req.json();
    console.log("[SIGNUP] Signup attempt for:", email);
    
    if (!email || !password) {
      console.log("[SIGNUP] Missing email or password");
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log("[SIGNUP] Password validation failed:", passwordValidation.errors);
      return NextResponse.json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors 
      }, { status: 400 });
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("[SIGNUP] User already exists:", email);
      // Use generic message to prevent account enumeration
      return NextResponse.json({ error: 'Unable to create account. Email may already be registered.' }, { status: 400 });
    }
    
    console.log("[SIGNUP] Creating user:", email);
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash },
    });
    
    console.log("[SIGNUP] User created successfully:", email);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    logError('[SIGNUP]', error);
    return NextResponse.json(
      { error: sanitizeError(error, ErrorMessages.ACCOUNT_ERROR) },
      { status: 500 }
    );
  }
}
