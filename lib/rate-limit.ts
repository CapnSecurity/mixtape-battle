import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider Redis for production scaling)
const limitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limitStore.entries()) {
    if (entry.resetTime < now) {
      limitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 * Uses IP address from various headers or falls back to unknown
 */
function getClientId(req: NextRequest): string {
  // Try x-forwarded-for first (from proxies like nginx)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Try x-real-ip (alternative proxy header)
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fall back to unknown for local development
  return 'unknown';
}

/**
 * Rate limiting middleware for API routes
 * 
 * @param config - Rate limit configuration
 * @param keyPrefix - Optional prefix for rate limit key (to separate different endpoints)
 * @returns Function to check rate limit for a request
 */
export function createRateLimit(config: RateLimitConfig, keyPrefix: string = 'global') {
  return async (req: NextRequest): Promise<{ success: boolean; response?: NextResponse }> => {
    const clientId = getClientId(req);
    const key = `${keyPrefix}:${clientId}`;
    const now = Date.now();

    let entry = limitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      limitStore.set(key, entry);
      
      console.log(`[RATE-LIMIT] ${keyPrefix} - New window for ${clientId}: 1/${config.maxRequests}`);
      return { success: true };
    }

    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      const resetTimeSeconds = Math.ceil(entry.resetTime / 1000);
      console.log(`[RATE-LIMIT] ${keyPrefix} - BLOCKED ${clientId}: ${entry.count}/${config.maxRequests} (retry in ${retryAfter}s)`);
      
      return {
        success: false,
        response: NextResponse.json(
          {
            error: config.message || 'Too many requests. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTimeSeconds.toString(),
            },
          }
        ),
      };
    }

    // Increment count
    entry.count++;
    limitStore.set(key, entry);
    
    console.log(`[RATE-LIMIT] ${keyPrefix} - ${clientId}: ${entry.count}/${config.maxRequests}`);
    return { success: true };
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: For authentication endpoints to prevent brute force
  auth: createRateLimit({
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many login attempts. Please wait a minute before trying again.',
  }, 'auth'),

  // Very strict: For password reset to prevent email spam
  passwordReset: createRateLimit({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset requests. Please wait an hour before trying again.',
  }, 'password-reset'),

  // Moderate: For general API endpoints
  api: createRateLimit({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please slow down.',
  }, 'api'),

  // Strict: For admin endpoints
  admin: createRateLimit({
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many admin requests. Please wait before trying again.',
  }, 'admin'),
};

/**
 * Helper to get rate limit status without incrementing
 */
export function getRateLimitStatus(
  keyPrefix: string,
  clientId: string,
  maxRequests: number
): {
  count: number;
  remaining: number;
  resetTime: number;
} | null {
  const key = `${keyPrefix}:${clientId}`;
  const entry = limitStore.get(key);
  
  if (!entry) return null;
  
  return {
    count: entry.count,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: Math.ceil(entry.resetTime / 1000),
  };
}
