/**
 * Token Management Utility
 * Handles JWT token lifecycle with secure httpOnly cookies
 */

/**
 * Generate and set JWT token in httpOnly cookie
 * @param {object} res - Express response object
 * @param {string} token - JWT token to set
 * @param {number} expiresIn - Expiration time in ms
 */
export function setTokenCookie(res, token, expiresIn = 7 * 24 * 60 * 60 * 1000) {
  res.cookie('authToken', token, {
    httpOnly: true,        // Not accessible via JavaScript (prevents XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: expiresIn,     // 7 days by default
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  });
}

/**
 * Clear JWT token cookie
 * @param {object} res - Express response object
 */
export function clearTokenCookie(res) {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
}

/**
 * Get token from cookies or Authorization header
 * @param {object} req - Express request object
 * @returns {string|null} - JWT token or null
 */
export function getTokenFromRequest(req) {
  // Try to get from httpOnly cookie first (most secure)
  if (req.cookies && req.cookies.authToken) {
    return req.cookies.authToken;
  }

  // Fallback to Authorization header (for backward compatibility)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Token configuration constants
 */
export const tokenConfig = {
  EXPIRATION_TIME: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_EXPIRATION_TIME: 30 * 24 * 60 * 60, // 30 days in seconds
  ALGORITHM: 'HS256'
};
