import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-with-credentials';
import { generateCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Returns a CSRF token for the current session
 * Requires authentication
 */
export async function GET() {
  try {
    console.log('[CSRF-GET] Request for CSRF token');
    const session = await getServerSession(authOptions);
    
    console.log('[CSRF-GET] Session:', { hasSession: !!session, user: session?.user?.email });
    
    if (!session) {
      console.log('[CSRF-GET] No session - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = generateCsrfToken();
    console.log('[CSRF-GET] Generated token:', token.substring(0, 20) + '...');
    
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
