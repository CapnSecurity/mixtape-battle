import { NextResponse } from 'next/server';

// Shared request-validation helpers. Goal: hostile or malformed input gets a clear 4xx instead of
// reaching Prisma/Postgres and turning into a 500.

/** Largest value of a Postgres `integer` column. */
export const MAX_DB_INT = 2147483647;

export const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

/**
 * Read the request body as a JSON object. Returns a 400 response for malformed JSON or for a body that
 * is not a plain object (null, array, string, number). Use: `const body = await readJsonObject(req);
 * if (body instanceof NextResponse) return body;`
 */
export async function readJsonObject(req: Request): Promise<Record<string, any> | NextResponse> {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return badRequest('Request body must be a JSON object');
  }
  return parsed as Record<string, any>;
}

/** A positive integer that fits a Postgres `integer` column. */
export function isDbInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= MAX_DB_INT;
}

/** Strict numeric id from a URL segment ("12" ok; "NaN", "1e3", "-1", "' OR 1=1", huge values rejected). */
export function parseIdParam(value: string | undefined | null): number | null {
  if (typeof value !== 'string' || !/^\d{1,10}$/.test(value)) return null;
  const n = Number(value);
  return isDbInt(n) ? n : null;
}

/** Opaque string id (cuid etc.) from a URL segment or body. */
export function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

/**
 * Validate optional free text. `undefined` and `null` pass through as null. Rejects non-strings, values
 * longer than `max`, and NUL bytes (Postgres cannot store `\u0000`).
 */
export function cleanText(value: unknown, max: number): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== 'string' || value.length > max || value.includes('\u0000')) return { ok: false };
  return { ok: true, value };
}

/** True for a string with no NUL bytes and a length within `max`. */
export function isCleanString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max && !value.includes('\u0000');
}
