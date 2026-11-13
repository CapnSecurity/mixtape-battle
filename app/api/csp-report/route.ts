import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit } from '@/lib/rate-limit';

// Collects CSP Report-Only violations into the server log so enforcement can be evaluated
// from real browser traffic without any third-party reporting service.
const limiter = createRateLimit({ maxRequests: 30, windowMs: 60 * 1000 }, 'csp-report');

const MAX_BODY_BYTES = 8 * 1024;

// Drop query/fragment (they can carry tokens) and bound length before logging.
function clean(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.split(/[?#]/)[0].replace(/[^\x20-\x7e]/g, '').slice(0, 200);
}

export async function POST(req: NextRequest) {
  const limited = await limiter(req);
  if (!limited.success) return limited.response as NextResponse;

  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  try {
    const report = JSON.parse(text)?.['csp-report'];
    if (report && typeof report === 'object') {
      console.warn(
        '[CSP-REPORT]',
        JSON.stringify({
          directive: clean(report['effective-directive'] || report['violated-directive']),
          blocked: clean(report['blocked-uri']),
          page: clean(report['document-uri']),
          disposition: clean(report['disposition']),
        })
      );
    }
  } catch {
    // Malformed report bodies are ignored.
  }
  return new NextResponse(null, { status: 204 });
}
