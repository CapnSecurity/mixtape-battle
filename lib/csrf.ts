import { randomBytes, createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;

// Log secret status on module load (only first few characters for security)
if (typeof window === 'undefined') { // Server-side only
  console.log('[CSRF-MODULE] Secret configured:', CSRF_SECRET ? CSRF_SECRET.substring(0, 8) + '...' : 'NONE');
  console.log('[CSRF-MODULE] Using fallback:', !process.env.NEXTAUTH_SECRET);
}

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
  
  const token = `${data}.${signature}`;
  console.log('[CSRF-GEN] Generated token parts:', {
    timestamp,
    randomLength: randomData.length,
    signaturePrefix: signature.substring(0, 8),
    fullTokenLength: token.length
  });
  
  return token;
}

/**
 * Validate a CSRF token
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    console.log('[CSRF] Token validation failed: token is null/undefined or not string');
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('[CSRF] Token validation failed: invalid format (expected 3 parts, got', parts.length, ')');
    return false;
  }

  const [timestamp, randomData, signature] = parts;
  
  console.log('[CSRF-VAL] Token parts:', {
    timestamp,
    randomDataLength: randomData?.length,
    signaturePrefix: signature?.substring(0, 8)
  });
  
  // Verify signature
  const data = `${timestamp}.${randomData}`;
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');
  
  console.log('[CSRF-VAL] Signature comparison:', {
    received: signature?.substring(0, 8),
    expected: expectedSignature.substring(0, 8),
    match: signature === expectedSignature
  });
  
  if (signature !== expectedSignature) {
    console.log('[CSRF] Token validation failed: invalid signature');
    return false;
  }

  // Check token age (max 1 hour)
  const tokenTimestamp = parseInt(timestamp, 10);
  const tokenAge = Date.now() - tokenTimestamp;
  const ONE_HOUR = 60 * 60 * 1000;
  
  console.log('[CSRF-VAL] Token age:', {
    tokenTimestamp,
    currentTime: Date.now(),
    ageMs: tokenAge,
    ageMinutes: Math.round(tokenAge / 60000),
    maxMinutes: 60,
    expired: tokenAge > ONE_HOUR
  });
  
  if (tokenAge > ONE_HOUR) {
    console.log('[CSRF] Token validation failed: token expired (age:', tokenAge, 'ms)');
    return false;
  }

  console.log('[CSRF] Token validation successful');
  return true;
}

/**
 * Middleware to verify CSRF token from request
 * Checks X-CSRF-Token header or csrfToken in body
 */
export function verifyCsrfToken(req: NextRequest, body?: any): boolean {
  // Check header first
  const headerToken = req.headers.get('X-CSRF-Token');
  console.log('[CSRF] Header token present:', !!headerToken);
  
  if (headerToken) {
    const isValid = validateCsrfToken(headerToken);
    console.log('[CSRF] Header token valid:', isValid);
    if (isValid) {
      return true;
    }
  }

  // Check body if provided
  if (body?.csrfToken) {
    console.log('[CSRF] Body token present: true');
    const isValid = validateCsrfToken(body.csrfToken);
    console.log('[CSRF] Body token valid:', isValid);
    if (isValid) {
      return true;
    }
  }

  console.log('[CSRF] No valid token found in header or body');
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
