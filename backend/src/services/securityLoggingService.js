/**
 * Security Logging Service
 * Provides interface for logging security, auth, and audit events
 */

import { SecurityLog } from '../models/SecurityLog.js';

export class SecurityLoggingService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(auditLog) {
    try {
      return await SecurityLog.logAuditEvent(auditLog);
    } catch (error) {
      console.error('❌ SecurityLoggingService.logAuditEvent failed:', error.message);
      // Don't throw - logging failure should not crash the app
      return null;
    }
  }

  /**
   * Log an authentication event
   */
  static async logAuthEvent(event) {
    try {
      return await SecurityLog.logAuthEvent(event);
    } catch (error) {
      console.error('❌ SecurityLoggingService.logAuthEvent failed:', error.message);
      // Don't throw - logging failure should not crash the app
      return null;
    }
  }

  /**
   * Log a security event
   */
  static async logSecurityEvent(event) {
    try {
      return await SecurityLog.logSecurityEvent(event);
    } catch (error) {
      console.error('❌ SecurityLoggingService.logSecurityEvent failed:', error.message);
      // Don't throw - logging failure should not crash the app
      return null;
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(startDate, endDate, limit = 100) {
    try {
      return await SecurityLog.getLogs('AUDIT', startDate, endDate, limit);
    } catch (error) {
      console.error('❌ Failed to get audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Get auth logs
   */
  static async getAuthLogs(startDate, endDate, limit = 100) {
    try {
      return await SecurityLog.getLogs('AUTH', startDate, endDate, limit);
    } catch (error) {
      console.error('❌ Failed to get auth logs:', error.message);
      throw error;
    }
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(startDate, endDate, limit = 100) {
    try {
      return await SecurityLog.getLogs('SECURITY', startDate, endDate, limit);
    } catch (error) {
      console.error('❌ Failed to get security events:', error.message);
      throw error;
    }
  }

  /**
   * Get recent audit logs
   */
  static async getRecentAuditLogs(limit = 50) {
    try {
      return await SecurityLog.getRecentLogs('AUDIT', limit);
    } catch (error) {
      console.error('❌ Failed to get recent audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Get recent auth logs
   */
  static async getRecentAuthLogs(limit = 50) {
    try {
      return await SecurityLog.getRecentLogs('AUTH', limit);
    } catch (error) {
      console.error('❌ Failed to get recent auth logs:', error.message);
      throw error;
    }
  }

  /**
   * Get recent security events
   */
  static async getRecentSecurityEvents(limit = 50) {
    try {
      return await SecurityLog.getRecentLogs('SECURITY', limit);
    } catch (error) {
      console.error('❌ Failed to get recent security events:', error.message);
      throw error;
    }
  }

  /**
   * Get storage statistics for all log collections
   */
  static async getStorageStats() {
    try {
      return await SecurityLog.getStorageStats();
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error.message);
      throw error;
    }
  }

  /**
   * Clear old logs
   */
  static async clearOldLogs(daysOld = 90) {
    try {
      return await SecurityLog.clearOldLogs(daysOld);
    } catch (error) {
      console.error('❌ Failed to clear old logs:', error.message);
      throw error;
    }
  }

  /**
   * Initialize logging (create indexes)
   */
  static async initialize() {
    try {
      await SecurityLog.createIndexes();
      console.log('✅ Security logging initialized');
    } catch (error) {
      console.error('❌ Failed to initialize security logging:', error.message);
    }
  }
}
