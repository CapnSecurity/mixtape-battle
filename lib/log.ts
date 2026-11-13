import { createHash } from 'crypto';

// Operational logging helpers. Goals: no secrets, tokens, cookies or raw personal data in logs,
// and verbose diagnostics only outside production (or when LOG_LEVEL=debug is set deliberately).
const debugEnabled = process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug';

/** Verbose diagnostics; silent in production unless LOG_LEVEL=debug. Never pass secrets or tokens. */
export function debug(...args: unknown[]): void {
  if (debugEnabled) console.log(...args);
}

/**
 * Stable, non-reversible reference for an email address so events for the same account can be
 * correlated across log lines without writing the address itself.
 */
export function userRef(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return 'u_unknown';
  return 'u_' + createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 8);
}
