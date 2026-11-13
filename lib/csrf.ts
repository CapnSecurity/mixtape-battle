import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { debug } from './log';

const CSRF_TOKEN_LENGTH = 32;
const ONE_HOUR = 60 * 60 * 1000;

// Resolved lazily so `next build` can import this module without runtime secrets.
// In production a missing secret must fail closed instead of signing with a well-known value.
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required to sign CSRF tokens');
  }
  return 'dev-only-csrf-secret';
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('hex');
}

/**
 * Generate a CSRF token
 * Token format: timestamp.randomBytes.signature
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const randomData = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const data = `${timestamp}.${randomData}`;
  return `${data}.${sign(data)}`;
}

/**
 * Validate a CSRF token
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    debug('[CSRF] validation failed: missing token');
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    debug('[CSRF] validation failed: malformed token');
    return false;
  }

  const [timestamp, randomData, signature] = parts;
  const expected = Buffer.from(sign(`${timestamp}.${randomData}`));
  const received = Buffer.from(signature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    debug('[CSRF] validation failed: bad signature');
    return false;
  }

  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (!Number.isFinite(tokenAge) || tokenAge < 0 || tokenAge > ONE_HOUR) {
    debug('[CSRF] validation failed: expired or invalid timestamp');
    return false;
  }

  return true;
}

/**
 * Middleware to verify CSRF token from request
 * Checks X-CSRF-Token header or csrfToken in body
 */
export function verifyCsrfToken(req: NextRequest, body?: any): boolean {
  const headerToken = req.headers.get('X-CSRF-Token');
  if (headerToken && validateCsrfToken(headerToken)) {
    return true;
  }

  if (body?.csrfToken && validateCsrfToken(body.csrfToken)) {
    return true;
  }

  console.warn('[CSRF] rejected request: no valid token', req.method, req.nextUrl.pathname);
  return false;
}

/**
 * Helper to create CSRF error response
 */
export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid or missing CSRF token' },
    { status: 403 }
  );
}
