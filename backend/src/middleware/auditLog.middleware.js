/**
 * Audit Logging Middleware
 * Logs all security-relevant events for compliance and investigation
 * 
 * ⚡ COST OPTIMIZATION: Audit logging disabled by default to reduce MongoDB writes.
 * Each request generates a database write which adds up quickly.
 * Enable with: ENABLE_AUDIT_LOGGING=true (only when diagnosing issues)
 */

import { SecurityLoggingService } from '../services/securityLoggingService.js';

/**
 * Log all API requests for audit trail
 */
export const auditLogMiddleware = (req, res, next) => {
  // ⚡ COST OPT: Disable logging to reduce database writes
  // Enable only when diagnosing issues via ENABLE_AUDIT_LOGGING env var
  if (process.env.ENABLE_AUDIT_LOGGING !== 'true') {
    return next();
  }
  
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log security-relevant events (non-blocking)
    if (shouldLogRequest(req, statusCode)) {
      logRequest(req, statusCode, duration).catch(err => {
        console.error('Failed to log audit event:', err);
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Determine if request should be logged
 */
function shouldLogRequest(req, statusCode) {
  const method = req.method;
  const path = req.path;
  
  // Log all state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }
  
  // Log authentication endpoints
  if (path.includes('/auth/')) {
    return true;
  }
  
  // Log admin endpoints
  if (path.includes('/admin/')) {
    return true;
  }
  
  // Log failed requests
  if (statusCode >= 400) {
    return true;
  }
  
  return false;
}

/**
 * Log request to audit trail
 */
async function logRequest(req, statusCode, duration) {
  try {
    const auditLog = {
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null,
      email: req.user?.email || null,
      body: sanitizeBody(req.body),
      query: req.query
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${auditLog.method} ${auditLog.path} - ${auditLog.statusCode} (${auditLog.duration}ms)`);
    }
    
    // Log to database in production
    if (process.env.NODE_ENV === 'production') {
      await SecurityLoggingService.logAuditEvent(auditLog);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeBody(body) {
  if (!body) return null;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'creditCard', 'cvv', 'ssn'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Log authentication events
 */
export const logAuthEvent = async (eventType, userId, email, ip, userAgent, details = {}) => {
  try {
    const event = {
      timestamp: new Date(),
      eventType, // LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, PASSWORD_CHANGE, etc.
      userId,
      email,
      ip,
      userAgent,
      details
    };
    
    if (process.env.NODE_ENV === 'production') {
      await SecurityLoggingService.logAuthEvent(event);
    } else {
      console.log(`[AUTH] ${eventType} - from ${ip}`);
    }
  } catch (error) {
    console.error('Auth logging error:', error);
  }
};

/**
 * Log security events
 */
export const logSecurityEvent = async (eventType, severity, description, details = {}) => {
  try {
    const event = {
      timestamp: new Date(),
      eventType, // BRUTE_FORCE, UNAUTHORIZED_ACCESS, INVALID_TOKEN, etc.
      severity, // LOW, MEDIUM, HIGH, CRITICAL
      description,
      details
    };
    
    if (process.env.NODE_ENV === 'production') {
      await SecurityLoggingService.logSecurityEvent(event);
    } else {
      console.log(`[SECURITY] ${severity} - ${eventType}: ${description}`);
    }
  } catch (error) {
    console.error('Security logging error:', error);
  }
};
