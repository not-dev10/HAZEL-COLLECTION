import crypto from 'crypto';

/**
 * Modern CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing operations
 */

// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRY;
  
  csrfTokens.set(sessionId, {
    token,
    expiresAt,
    createdAt: Date.now()
  });
  
  // Cleanup expired tokens
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(sessionId, token) {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  // Validate token
  return stored.token === token;
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * Middleware to generate CSRF token
 */
export const csrfTokenGenerator = (req, res, next) => {
  // Generate session ID if not exists
  const sessionId = req.user?.id || req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');
  
  // Generate CSRF token
  const csrfToken = generateCsrfToken(sessionId);
  
  // Attach to request
  req.csrfToken = () => csrfToken;
  req.sessionId = sessionId;
  
  next();
};

/**
 * Middleware to validate CSRF token
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get session ID
  const sessionId = req.user?.id || req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: No session ID'
    });
  }
  
  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: No token provided'
    });
  }
  
  // Validate token
  if (!validateCsrfToken(sessionId, token)) {
    console.log(`🔒 CSRF validation failed for session: ${sessionId}`);
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: Invalid or expired token'
    });
  }
  
  next();
};

/**
 * Route to get CSRF token
 */
export const getCsrfToken = (req, res) => {
  const sessionId = req.user?.id || req.headers['x-session-id'] || crypto.randomBytes(16).toString('hex');
  const token = generateCsrfToken(sessionId);
  
  res.json({
    success: true,
    csrfToken: token,
    sessionId: sessionId
  });
};
