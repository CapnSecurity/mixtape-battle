import { useState, useEffect } from 'react';

/**
 * React hook to manage CSRF tokens
 * Automatically fetches and refreshes tokens as needed
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = async () => {
    try {
      console.log('[useCsrfToken] Fetching token...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf');
      console.log('[useCsrfToken] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[useCsrfToken] Failed to fetch token:', response.status, errorText);
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      console.log('[useCsrfToken] Token received:', data.csrfToken ? data.csrfToken.substring(0, 20) + '...' : 'null');
      setToken(data.csrfToken);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return { token, loading, error, refetch: fetchToken };
}

/**
 * Helper to add CSRF token to fetch options
 */
export function withCsrfToken(
  csrfToken: string | null,
  options: RequestInit = {}
): RequestInit {
  if (!csrfToken) {
    return options;
  }

  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', csrfToken);

  return {
    ...options,
    headers,
  };
}

/**
 * Helper to add CSRF token to request body
 */
export function withCsrfInBody(
  csrfToken: string | null,
  body: any
): any {
  if (!csrfToken) {
    return body;
  }

  return {
    ...body,
    csrfToken,
  };
}
