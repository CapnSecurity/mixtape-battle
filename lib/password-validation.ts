/**
 * Password validation utilities
 * Enforces strong password requirements for security
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @param requirements - Optional custom requirements (uses defaults if not provided)
 * @returns Validation result with isValid flag and array of error messages
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  // Check for uppercase letter
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (requirements.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (requirements.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets a human-readable description of password requirements
 * @param requirements - Optional custom requirements (uses defaults if not provided)
 * @returns Formatted string describing the requirements
 */
export function getPasswordRequirementsDescription(
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): string {
  const parts: string[] = [];
  
  parts.push(`at least ${requirements.minLength} characters`);
  
  if (requirements.requireUppercase) parts.push('uppercase letter');
  if (requirements.requireLowercase) parts.push('lowercase letter');
  if (requirements.requireNumber) parts.push('number');
  if (requirements.requireSpecialChar) parts.push('special character');
  
  return `Password must include: ${parts.join(', ')}`;
}
