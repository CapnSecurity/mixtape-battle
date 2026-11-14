// Album art URLs are rendered as <img src>, so they are limited to https URLs on the hosts the
// Content-Security-Policy allows (see img-src in next.config.js) and the metadata lookups produce.
const ALLOWED_EXACT = new Set(['coverartarchive.org', 'archive.org', 'lastfm.freetls.fastly.net']);
const ALLOWED_SUFFIXES = ['.archive.org', '.mzstatic.com'];

export function isAllowedArtUrl(value: string): boolean {
  if (value.length > 600) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return ALLOWED_EXACT.has(host) || ALLOWED_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export type ArtUpdate =
  | { ok: true; change: false }
  | { ok: true; change: true; value: string | null }
  | { ok: false };

/** undefined leaves the stored art alone; null or an empty string clears it; otherwise it must be an allowed URL. */
export function parseArtUpdate(input: unknown): ArtUpdate {
  if (input === undefined) return { ok: true, change: false };
  if (input === null) return { ok: true, change: true, value: null };
  if (typeof input !== 'string') return { ok: false };
  const trimmed = input.trim();
  if (trimmed === '') return { ok: true, change: true, value: null };
  return isAllowedArtUrl(trimmed) ? { ok: true, change: true, value: trimmed } : { ok: false };
}
