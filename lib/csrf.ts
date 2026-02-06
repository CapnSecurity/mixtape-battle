import { randomBytes, createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token
 * Token format: timestamp.randomBytes.signature
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const randomData = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const data = `${timestamp}.${randomData}`;
  
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');
  
  return `${data}.${signature}`;
}

/**
 * Validate a CSRF token
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, randomData, signature] = parts;
  
  // Verify signature
  const data = `${timestamp}.${randomData}`;
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return false;
  }

  // Check token age (max 1 hour)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (tokenAge > ONE_HOUR) {
    return false;
  }

  return true;
}

/**
 * Middleware to verify CSRF token from request
 * Checks X-CSRF-Token header or csrfToken in body
 */
export function verifyCsrfToken(req: NextRequest, body?: any): boolean {
  // Check header first
  const headerToken = req.headers.get('X-CSRF-Token');
  if (headerToken && validateCsrfToken(headerToken)) {
    return true;
  }

  // Check body if provided
  if (body?.csrfToken && validateCsrfToken(body.csrfToken)) {
    return true;
  }

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
