/**
 * Session Management Middleware
 * Handles session timeout and token rotation for enhanced security
 */

import jwt from 'jsonwebtoken';

// Session timeout: 2 hours (as requested)
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const TOKEN_REFRESH_THRESHOLD = 60 * 60 * 1000; // Refresh if token expires in 1 hour

/**
 * Track user sessions and last activity
 */
const activeSessions = new Map();

/**
 * Middleware to check session timeout and auto-logout inactive users
 */
export const sessionTimeoutMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(); // No token, let other middleware handle it
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const now = Date.now();

    // Check if session exists
    const session = activeSessions.get(userId);

    if (session) {
      const timeSinceLastActivity = now - session.lastActivity;

      // Check if session has timed out (2 hours of inactivity)
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        activeSessions.delete(userId);
        console.log(`⏰ Session timeout`);
        return res.status(401).json({
          success: false,
          message: "Session expired due to inactivity. Please login again.",
          code: "SESSION_TIMEOUT"
        });
      }

      // Update last activity
      session.lastActivity = now;
      activeSessions.set(userId, session);
    } else {
      // Create new session
      activeSessions.set(userId, {
        userId,
        email: decoded.email,
        lastActivity: now,
        createdAt: now
      });
    }

    // Attach session info to request
    req.session = activeSessions.get(userId);
    next();
  } catch (error) {
    // Invalid token, let auth middleware handle it
    next();
  }
};

/**
 * Middleware to automatically rotate tokens that are about to expire
 */
export const tokenRotationMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(); // No authenticated user
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.decode(token);
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    // If token expires in less than 1 hour, issue a new one
    if (expiresIn < 3600 && expiresIn > 0) {
      const newToken = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Send new token in response header
      res.setHeader('X-New-Token', newToken);
      res.setHeader('X-Token-Rotated', 'true');
      
      console.log(`🔄 Token rotated`);
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Clear session on logout
 */
export const clearSession = (userId) => {
  activeSessions.delete(userId);
  console.log(`🚪 Session cleared for user: ${userId}`);
};

/**
 * Get active sessions count (for monitoring)
 */
export const getActiveSessionsCount = () => {
  return activeSessions.size;
};

/**
 * Clean up expired sessions (run periodically)
 */
export const cleanupExpiredSessions = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      activeSessions.delete(userId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
  }

  return cleaned;
};

// Run cleanup every 30 minutes
setInterval(cleanupExpiredSessions, 30 * 60 * 1000);

export default {
  sessionTimeoutMiddleware,
  tokenRotationMiddleware,
  clearSession,
  getActiveSessionsCount,
  cleanupExpiredSessions
};
