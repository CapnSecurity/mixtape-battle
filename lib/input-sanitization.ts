/**
 * Input sanitization and validation utilities for XSS protection
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and scripts from user input
 * 
 * @param input The user input to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeHTML(input: string | null | undefined): string {
  if (!input) return '';
  
  // Strip all HTML tags, only allow plain text
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Strict-enough email check for addresses we send mail to or store.
 * Rejects control characters (CR/LF header injection), spaces, display names and over-long values.
 */
const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}

/**
 * Validate an optional http(s) URL supplied by a user.
 * Empty/null/undefined clears the value; anything that is not an absolute http or https URL
 * (javascript:, data:, relative, malformed, too long) is rejected.
 */
export function normalizeHttpUrl(value: unknown): { ok: boolean; url: string | null } {
  if (value === undefined || value === null || value === '') return { ok: true, url: null };
  if (typeof value !== 'string') return { ok: false, url: null };
  const trimmed = value.trim();
  if (trimmed === '') return { ok: true, url: null };
  if (trimmed.length > 2048) return { ok: false, url: null };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return { ok: false, url: null };
    return { ok: true, url: trimmed };
  } catch {
    return { ok: false, url: null };
  }
}

/**
 * Validate and sanitize song title
 * - Max 200 characters
 * - No HTML/scripts
 * - Required field
 */
export function validateSongTitle(title: string | null | undefined): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (title != null && typeof title !== 'string') {
    return { isValid: false, sanitized: '', error: 'Song title must be text' };
  }
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Song title is required'
    };
  }

  const sanitized = sanitizeHTML(title).trim();
  
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Song title cannot be empty after sanitization'
    };
  }

  if (sanitized.length > 200) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, 200),
      error: 'Song title must be 200 characters or less'
    };
  }

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Validate and sanitize artist name
 * - Max 200 characters
 * - No HTML/scripts
 * - Required field
 */
export function validateArtistName(artist: string | null | undefined): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (artist != null && typeof artist !== 'string') {
    return { isValid: false, sanitized: '', error: 'Artist name must be text' };
  }
  if (!artist || artist.trim().length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Artist name is required'
    };
  }

  const sanitized = sanitizeHTML(artist).trim();
  
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Artist name cannot be empty after sanitization'
    };
  }

  if (sanitized.length > 200) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, 200),
      error: 'Artist name must be 200 characters or less'
    };
  }

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Validate and sanitize album name
 * - Max 200 characters
 * - No HTML/scripts
 * - Optional field
 */
export function validateAlbumName(album: string | null | undefined): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (album != null && typeof album !== 'string') {
    return { isValid: false, sanitized: '', error: 'Album name must be text' };
  }
  // Album is optional
  if (!album || album.trim().length === 0) {
    return {
      isValid: true,
      sanitized: ''
    };
  }

  const sanitized = sanitizeHTML(album).trim();

  if (sanitized.length > 200) {
    return {
      isValid: false,
      sanitized: sanitized.slice(0, 200),
      error: 'Album name must be 200 characters or less'
    };
  }

  return {
    isValid: true,
    sanitized
  };
}

/**
 * Validate release year
 * - Optional field
 * - Must be between 1900 and current year + 1
 * - Must be a valid number
 */
export function validateReleaseYear(year: string | number | null | undefined): {
  isValid: boolean;
  year: number | null;
  error?: string;
} {
  // Year is optional
  if (!year) {
    return {
      isValid: true,
      year: null
    };
  }

  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;

  if (isNaN(yearNum)) {
    return {
      isValid: false,
      year: null,
      error: 'Release year must be a valid number'
    };
  }

  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return {
      isValid: false,
      year: null,
      error: `Release year must be between 1900 and ${currentYear + 1}`
    };
  }

  return {
    isValid: true,
    year: yearNum
  };
}

/**
 * Comprehensive validation for adding a song
 */
export function validateSongInput(input: {
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  releaseDate?: string | number | null;
}): {
  isValid: boolean;
  sanitized: {
    title: string;
    artist: string;
    album: string;
    releaseDate: number | null;
  };
  errors: string[];
} {
  const errors: string[] = [];

  const titleResult = validateSongTitle(input.title);
  const artistResult = validateArtistName(input.artist);
  const albumResult = validateAlbumName(input.album);
  const yearResult = validateReleaseYear(input.releaseDate);

  if (!titleResult.isValid && titleResult.error) {
    errors.push(titleResult.error);
  }

  if (!artistResult.isValid && artistResult.error) {
    errors.push(artistResult.error);
  }

  if (!albumResult.isValid && albumResult.error) {
    errors.push(albumResult.error);
  }

  if (!yearResult.isValid && yearResult.error) {
    errors.push(yearResult.error);
  }

  return {
    isValid: errors.length === 0,
    sanitized: {
      title: titleResult.sanitized,
      artist: artistResult.sanitized,
      album: albumResult.sanitized,
      releaseDate: yearResult.year
    },
    errors
  };
}
