/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

/**
 * Strong password regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Quick validation using regex
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password is strong
 */
export const isStrongPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Get password strength score (0-5)
 * @param {string} password - Password to check
 * @returns {number} - Strength score
 */
export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  return Math.min(strength, 5);
};

/**
 * Get password strength label
 * @param {number} strength - Strength score (0-5)
 * @returns {string} - Strength label
 */
export const getPasswordStrengthLabel = (strength) => {
  const labels = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
    5: 'Very Strong'
  };
  return labels[strength] || 'Unknown';
};

export default {
  validatePassword,
  isStrongPassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  PASSWORD_REGEX
};
