/**
 * Logs Controller
 * Endpoints for viewing security logs and audit trails
 */

import { SecurityLoggingService } from '../services/securityLoggingService.js';

/**
 * Get audit logs for date range
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const logs = await SecurityLoggingService.getAuditLogs(
      startDate,
      endDate,
      Math.min(parseInt(limit), 1000)
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

/**
 * Get recent audit logs
 */
export const getRecentAuditLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await SecurityLoggingService.getRecentAuditLogs(
      Math.min(parseInt(limit), 500)
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('❌ Error fetching recent audit logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent audit logs',
      error: error.message
    });
  }
};

/**
 * Get auth logs for date range
 */
export const getAuthLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const logs = await SecurityLoggingService.getAuthLogs(
      startDate,
      endDate,
      Math.min(parseInt(limit), 1000)
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('❌ Error fetching auth logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auth logs',
      error: error.message
    });
  }
};

/**
 * Get recent auth logs
 */
export const getRecentAuthLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await SecurityLoggingService.getRecentAuthLogs(
      Math.min(parseInt(limit), 500)
    );

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('❌ Error fetching recent auth logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent auth logs',
      error: error.message
    });
  }
};

/**
 * Get security events for date range
 */
export const getSecurityEvents = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const events = await SecurityLoggingService.getSecurityEvents(
      startDate,
      endDate,
      Math.min(parseInt(limit), 1000)
    );

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('❌ Error fetching security events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events',
      error: error.message
    });
  }
};

/**
 * Get recent security events
 */
export const getRecentSecurityEvents = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const events = await SecurityLoggingService.getRecentSecurityEvents(
      Math.min(parseInt(limit), 500)
    );

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('❌ Error fetching recent security events:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent security events',
      error: error.message
    });
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = async (req, res) => {
  try {
    const stats = await SecurityLoggingService.getStorageStats();

    const totalSize = Object.values(stats).reduce((sum, s) => sum + parseFloat(s.sizeMB), 0);
    const totalCount = Object.values(stats).reduce((sum, s) => sum + s.count, 0);

    res.json({
      success: true,
      stats,
      summary: {
        totalLogs: totalCount,
        totalSizeMB: totalSize.toFixed(2),
        collections: Object.keys(stats).length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching storage stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storage statistics',
      error: error.message
    });
  }
};

/**
 * Clear old logs (admin only)
 */
export const clearOldLogs = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    if (daysOld < 7) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete logs less than 7 days old'
      });
    }

    const deleted = await SecurityLoggingService.clearOldLogs(daysOld);

    res.json({
      success: true,
      message: `Cleared ${deleted} log entries older than ${daysOld} days`,
      deleted
    });
  } catch (error) {
    console.error('❌ Error clearing old logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old logs',
      error: error.message
    });
  }
};

/**
 * Get logs summary/dashboard
 */
export const getLogsSummary = async (req, res) => {
  try {
    const [auditLogs, authLogs, securityEvents, stats] = await Promise.all([
      SecurityLoggingService.getRecentAuditLogs(10),
      SecurityLoggingService.getRecentAuthLogs(10),
      SecurityLoggingService.getRecentSecurityEvents(10),
      SecurityLoggingService.getStorageStats()
    ]);

    res.json({
      success: true,
      summary: {
        recentAuditLogs: auditLogs,
        recentAuthLogs: authLogs,
        recentSecurityEvents: securityEvents,
        storage: stats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching logs summary:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs summary',
      error: error.message
    });
  }
};
