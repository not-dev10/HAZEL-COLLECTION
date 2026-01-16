import { getDB } from '../config/mongodb.js';

/**
 * Security Audit Logging Service
 * Tracks security-relevant events for incident investigation
 */

// Security event types
export const SecurityEvents = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  
  // Authorization
  AUTHORIZATION_FAILURE: 'AUTHORIZATION_FAILURE',
  IDOR_ATTEMPT: 'IDOR_ATTEMPT',
  
  // Admin Actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  USER_DELETED: 'USER_DELETED',
  REVIEW_STATUS_CHANGED: 'REVIEW_STATUS_CHANGED',
  
  // Security
  CSRF_FAILURE: 'CSRF_FAILURE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Data Access
  SENSITIVE_DATA_ACCESS: 'SENSITIVE_DATA_ACCESS',
  BULK_DATA_EXPORT: 'BULK_DATA_EXPORT'
};

/**
 * Log a security event
 * @param {string} event - Event type from SecurityEvents
 * @param {object} details - Event details
 * @param {object} req - Express request object
 */
export async function logSecurityEvent(event, details = {}, req = null) {
  try {
    const db = getDB();
    const auditLogs = db.collection('audit_logs');
    
    const logEntry = {
      event,
      timestamp: new Date(),
      userId: req?.user?.id || details.userId || null,
      userEmail: req?.user?.email || details.userEmail || null,
      role: req?.user?.role || details.role || 'guest',
      ip: getClientIP(req),
      userAgent: req?.get('user-agent') || null,
      method: req?.method || null,
      path: req?.path || null,
      details: sanitizeDetails(details),
      severity: getEventSeverity(event)
    };
    
    await auditLogs.insertOne(logEntry);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 [AUDIT] ${event}:`, {
        user: logEntry.userId,
        ip: logEntry.ip,
        path: logEntry.path
      });
    }
    
    // Alert on critical events
    if (logEntry.severity === 'CRITICAL') {
      console.error(`🚨 [CRITICAL SECURITY EVENT] ${event}:`, logEntry);
      // TODO: Send alert (email, Slack, etc.)
    }
    
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Get client IP address
 * @param {object} req - Express request
 * @returns {string} - Client IP
 */
function getClientIP(req) {
  if (!req) return null;
  
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

/**
 * Sanitize log details (remove sensitive data)
 * @param {object} details - Raw details
 * @returns {object} - Sanitized details
 */
function sanitizeDetails(details) {
  const sanitized = { ...details };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  delete sanitized.creditCard;
  delete sanitized.cvv;
  
  // Mask email if present
  if (sanitized.email) {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local.substring(0, 2)}***@${domain}`;
  }
  
  // Mask phone if present
  if (sanitized.phone) {
    sanitized.phone = `***${sanitized.phone.slice(-4)}`;
  }
  
  return sanitized;
}

/**
 * Get event severity level
 * @param {string} event - Event type
 * @returns {string} - Severity level
 */
function getEventSeverity(event) {
  const criticalEvents = [
    SecurityEvents.AUTHORIZATION_FAILURE,
    SecurityEvents.IDOR_ATTEMPT,
    SecurityEvents.CSRF_FAILURE,
    SecurityEvents.USER_DELETED,
    SecurityEvents.BULK_DATA_EXPORT
  ];
  
  const highEvents = [
    SecurityEvents.LOGIN_FAILURE,
    SecurityEvents.PASSWORD_CHANGE,
    SecurityEvents.ADMIN_LOGIN,
    SecurityEvents.INVALID_TOKEN,
    SecurityEvents.RATE_LIMIT_EXCEEDED
  ];
  
  if (criticalEvents.includes(event)) return 'CRITICAL';
  if (highEvents.includes(event)) return 'HIGH';
  return 'INFO';
}

/**
 * Middleware to log security events
 * @param {string} event - Event type
 * @returns {Function} - Express middleware
 */
export function auditLog(event) {
  return async (req, res, next) => {
    // Log before request
    await logSecurityEvent(event, {}, req);
    
    // Continue to next middleware
    next();
  };
}

/**
 * Get audit logs for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of logs to return
 * @returns {Array} - Audit logs
 */
export async function getUserAuditLogs(userId, limit = 50) {
  try {
    const db = getDB();
    const auditLogs = db.collection('audit_logs');
    
    return await auditLogs
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Get recent security events
 * @param {number} hours - Hours to look back
 * @param {string} severity - Severity filter
 * @returns {Array} - Security events
 */
export async function getRecentSecurityEvents(hours = 24, severity = null) {
  try {
    const db = getDB();
    const auditLogs = db.collection('audit_logs');
    
    const query = {
      timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
    };
    
    if (severity) {
      query.severity = severity;
    }
    
    return await auditLogs
      .find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();
  } catch (error) {
    console.error('Failed to get security events:', error);
    return [];
  }
}

/**
 * Create indexes for audit logs collection
 */
export async function createAuditLogIndexes() {
  try {
    const db = getDB();
    const auditLogs = db.collection('audit_logs');
    
    await auditLogs.createIndex({ userId: 1, timestamp: -1 });
    await auditLogs.createIndex({ event: 1, timestamp: -1 });
    await auditLogs.createIndex({ severity: 1, timestamp: -1 });
    await auditLogs.createIndex({ timestamp: -1 });
    
    // TTL index - auto-delete logs older than 90 days
    await auditLogs.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60 }
    );
    
    console.log('✅ Audit log indexes created');
  } catch (error) {
    console.error('Failed to create audit log indexes:', error);
  }
}
