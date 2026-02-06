/**
 * Error handling utilities to prevent information leakage in production
 */

/**
 * Sanitizes error messages for client responses
 * - In development: Returns detailed error message
 * - In production: Returns generic error message
 * 
 * @param error The error object or message
 * @param genericMessage The generic message to show in production
 * @returns Sanitized error message safe for client
 */
export function sanitizeError(error: any, genericMessage = 'An error occurred'): string {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // In development, show detailed errors for debugging
    return error?.message || String(error) || genericMessage;
  }
  
  // In production, only show generic message
  return genericMessage;
}

/**
 * Logs error details server-side (always logs, regardless of environment)
 * This ensures we have error information in logs even when we hide it from clients
 * 
 * @param context A context string (e.g., "[SIGNUP]")
 * @param error The error object
 */
export function logError(context: string, error: any): void {
  console.error(`${context} ERROR:`, error);
  
  if (error?.message) {
    console.error(`${context} Error message:`, error.message);
  }
  
  if (error?.stack) {
    console.error(`${context} Error stack:`, error.stack);
  }
}

/**
 * Generic error messages for common scenarios
 */
export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  SESSION_EXPIRED: 'Your session has expired',
  
  // Account management
  ACCOUNT_ERROR: 'Unable to process account request',
  PASSWORD_CHANGE_FAILED: 'Unable to change password',
  
  // Generic
  SERVER_ERROR: 'An unexpected error occurred',
  INVALID_REQUEST: 'Invalid request',
  NOT_FOUND: 'Resource not found',
};
