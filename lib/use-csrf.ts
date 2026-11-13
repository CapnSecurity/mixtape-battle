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
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf');
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
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
