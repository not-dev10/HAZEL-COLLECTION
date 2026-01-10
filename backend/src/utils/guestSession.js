import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique session ID for guest users
 * @returns {string} Unique session ID
 */
export const generateSessionId = () => {
  return `guest_${uuidv4()}`;
};

/**
 * Extract session ID from request (from headers or cookies)
 * @param {Object} req - Express request object
 * @returns {string|null} Session ID or null if not found
 */
export const getSessionIdFromRequest = (req) => {
  // Check Authorization header for session ID
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Guest ')) {
    return authHeader.substring(6);
  }
  
  // Check X-Session-ID header
  const sessionIdHeader = req.headers['x-session-id'];
  if (sessionIdHeader) {
    return sessionIdHeader;
  }
  
  // Check cookies
  if (req.cookies?.sessionId) {
    return req.cookies.sessionId;
  }
  
  return null;
};

/**
 * Check if request is from a guest user
 * @param {Object} req - Express request object
 * @returns {boolean} True if guest session
 */
export const isGuestSession = (req) => {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.startsWith('Guest ');
};

/**
 * Extract and verify JWT token from request
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null if not found
 */
export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};
