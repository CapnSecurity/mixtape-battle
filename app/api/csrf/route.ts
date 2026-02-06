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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = generateCsrfToken();
    
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
