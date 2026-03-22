/**
 * Security Log Model
 * Stores audit, auth, and security events for compliance and investigation
 */

import { getDB } from '../config/mongodb.js';

export class SecurityLog {
  /**
   * Log an audit event
   */
  static async logAuditEvent(auditLog) {
    try {
      const db = getDB();
      const collection = db.collection('auditLogs');
      
      const logEntry = {
        timestamp: auditLog.timestamp || new Date(),
        type: 'AUDIT',
        method: auditLog.method,
        path: auditLog.path,
        statusCode: auditLog.statusCode,
        duration: auditLog.duration,
        ip: auditLog.ip,
        userAgent: auditLog.userAgent,
        userId: auditLog.userId,
        email: auditLog.email,
        body: auditLog.body,
        query: auditLog.query,
        createdAt: new Date()
      };
      
      const result = await collection.insertOne(logEntry);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Failed to log audit event:', error.message);
      throw error;
    }
  }

  /**
   * Log an authentication event
   */
  static async logAuthEvent(event) {
    try {
      const db = getDB();
      const collection = db.collection('authLogs');
      
      const logEntry = {
        timestamp: event.timestamp || new Date(),
        type: 'AUTH',
        eventType: event.eventType, // LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, etc.
        userId: event.userId,
        email: event.email,
        ip: event.ip,
        userAgent: event.userAgent,
        details: event.details,
        createdAt: new Date()
      };
      
      const result = await collection.insertOne(logEntry);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Failed to log auth event:', error.message);
      throw error;
    }
  }

  /**
   * Log a security event
   */
  static async logSecurityEvent(event) {
    try {
      const db = getDB();
      const collection = db.collection('securityEvents');
      
      const logEntry = {
        timestamp: event.timestamp || new Date(),
        type: 'SECURITY',
        eventType: event.eventType, // BRUTE_FORCE, UNAUTHORIZED_ACCESS, INVALID_TOKEN, etc.
        severity: event.severity, // LOW, MEDIUM, HIGH, CRITICAL
        description: event.description,
        details: event.details,
        createdAt: new Date()
      };
      
      const result = await collection.insertOne(logEntry);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Failed to log security event:', error.message);
      throw error;
    }
  }

  /**
   * Get logs by type and date range
   */
  static async getLogs(logType, startDate, endDate, limit = 100) {
    try {
      const db = getDB();
      let collectionName;

      if (logType === 'AUDIT') {
        collectionName = 'auditLogs';
      } else if (logType === 'AUTH') {
        collectionName = 'authLogs';
      } else if (logType === 'SECURITY') {
        collectionName = 'securityEvents';
      } else {
        throw new Error('Invalid log type');
      }

      const collection = db.collection(collectionName);
      
      const query = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const logs = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return logs;
    } catch (error) {
      console.error('❌ Failed to retrieve logs:', error.message);
      throw error;
    }
  }

  /**
   * Get recent logs
   */
  static async getRecentLogs(logType, limit = 50) {
    try {
      const db = getDB();
      let collectionName;

      if (logType === 'AUDIT') {
        collectionName = 'auditLogs';
      } else if (logType === 'AUTH') {
        collectionName = 'authLogs';
      } else if (logType === 'SECURITY') {
        collectionName = 'securityEvents';
      } else {
        throw new Error('Invalid log type');
      }

      const collection = db.collection(collectionName);
      
      const logs = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return logs;
    } catch (error) {
      console.error('❌ Failed to retrieve recent logs:', error.message);
      throw error;
    }
  }

  /**
   * Create indexes for performance
   */
  static async createIndexes() {
    try {
      const db = getDB();
      
      // Audit logs indexes
      const auditCollection = db.collection('auditLogs');
      await auditCollection.createIndex({ timestamp: 1 });
      await auditCollection.createIndex({ userId: 1 });
      await auditCollection.createIndex({ email: 1 });
      await auditCollection.createIndex({ ip: 1 });
      await auditCollection.createIndex({ statusCode: 1 });
      
      // Auth logs indexes
      const authCollection = db.collection('authLogs');
      await authCollection.createIndex({ timestamp: 1 });
      await authCollection.createIndex({ userId: 1 });
      await authCollection.createIndex({ email: 1 });
      await authCollection.createIndex({ eventType: 1 });
      
      // Security events indexes
      const securityCollection = db.collection('securityEvents');
      await securityCollection.createIndex({ timestamp: 1 });
      await securityCollection.createIndex({ severity: 1 });
      await securityCollection.createIndex({ eventType: 1 });
      
      // TTL index - auto-delete logs after 30 days (instead of 90 to save storage)
      await auditCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
      await authCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
      await securityCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
      
      console.log('✅ Security log indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
    }
  }

  /**
   * Clear old logs (manual cleanup)
   */
  static async clearOldLogs(daysOld = 90) {
    try {
      const db = getDB();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const collections = ['auditLogs', 'authLogs', 'securityEvents'];
      let totalDeleted = 0;

      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({
          createdAt: { $lt: cutoffDate }
        });
        totalDeleted += result.deletedCount;
      }

      console.log(`✅ Cleared ${totalDeleted} old log entries`);
      return totalDeleted;
    } catch (error) {
      console.error('❌ Failed to clear old logs:', error.message);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats() {
    try {
      const db = getDB();
      
      const collections = ['auditLogs', 'authLogs', 'securityEvents'];
      const stats = {};

      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        // Estimate storage size
        const stats_result = await db.collection(collectionName).stats();
        const size = stats_result.size || 0;

        stats[collectionName] = {
          count,
          sizeBytes: size,
          sizeMB: (size / 1024 / 1024).toFixed(2)
        };
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error.message);
      throw error;
    }
  }
}
