/**
 * Logs Routes
 * Admin endpoints for viewing security logs, audit trails, and storage statistics
 */

import express from 'express';
import {
  getAuditLogs,
  getRecentAuditLogs,
  getAuthLogs,
  getRecentAuthLogs,
  getSecurityEvents,
  getRecentSecurityEvents,
  getStorageStats,
  clearOldLogs,
  getLogsSummary
} from '../controllers/logs.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All logs endpoints require authentication and admin role
router.use(requireAuth, requireAdmin);

/**
 * @route   GET /api/logs/summary
 * @desc    Get logs dashboard summary
 * @access  Private (Admin only)
 */
router.get('/summary', getLogsSummary);

/**
 * @route   GET /api/logs/audit
 * @desc    Get audit logs for date range
 * @access  Private (Admin only)
 * @query   startDate - Start date (ISO format)
 * @query   endDate - End date (ISO format)
 * @query   limit - Max results (default 100, max 1000)
 */
router.get('/audit', getAuditLogs);

/**
 * @route   GET /api/logs/audit/recent
 * @desc    Get recent audit logs
 * @access  Private (Admin only)
 * @query   limit - Max results (default 50, max 500)
 */
router.get('/audit/recent', getRecentAuditLogs);

/**
 * @route   GET /api/logs/auth
 * @desc    Get authentication logs for date range
 * @access  Private (Admin only)
 * @query   startDate - Start date (ISO format)
 * @query   endDate - End date (ISO format)
 * @query   limit - Max results (default 100, max 1000)
 */
router.get('/auth', getAuthLogs);

/**
 * @route   GET /api/logs/auth/recent
 * @desc    Get recent authentication logs
 * @access  Private (Admin only)
 * @query   limit - Max results (default 50, max 500)
 */
router.get('/auth/recent', getRecentAuthLogs);

/**
 * @route   GET /api/logs/security
 * @desc    Get security events for date range
 * @access  Private (Admin only)
 * @query   startDate - Start date (ISO format)
 * @query   endDate - End date (ISO format)
 * @query   limit - Max results (default 100, max 1000)
 */
router.get('/security', getSecurityEvents);

/**
 * @route   GET /api/logs/security/recent
 * @desc    Get recent security events
 * @access  Private (Admin only)
 * @query   limit - Max results (default 50, max 500)
 */
router.get('/security/recent', getRecentSecurityEvents);

/**
 * @route   GET /api/logs/storage
 * @desc    Get storage statistics for all log collections
 * @access  Private (Admin only)
 */
router.get('/storage', getStorageStats);

/**
 * @route   POST /api/logs/clear-old
 * @desc    Clear logs older than specified days (admin only)
 * @access  Private (Admin only)
 * @body    daysOld - Days old threshold (default 90, min 7)
 */
router.post('/clear-old', clearOldLogs);

export default router;
