import express from 'express';
import { checkSystemHealth, getStorageInfo, getSecurityInsights, testEmailService } from '../controllers/health.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/health/ping
 * @desc    Simple public health check (no auth required)
 * @access  Public
 */
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @route   GET /api/health
 * @desc    Check system health (MongoDB, Cloudinary, Server)
 * @access  Public
 */
router.get('/', checkSystemHealth);

/**
 * @route   GET /api/health/storage
 * @desc    Get detailed storage information (MongoDB and Cloudinary)
 * @access  Private (Admin only)
 */
router.get('/storage', requireAuth, requireAdmin, getStorageInfo);

/**
 * @route   GET /api/health/security
 * @desc    Get security insights and threat analysis
 * @access  Private (Admin only)
 */
router.get('/security', requireAuth, requireAdmin, getSecurityInsights);

/**
 * @route   POST /api/health/test-email
 * @desc    Test email service by sending a test email
 * @access  Private (Admin only)
 */
router.post('/test-email', requireAuth, requireAdmin, testEmailService);

export default router;
