import express from 'express';
import { checkSystemHealth } from '../controllers/health.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check system health (MongoDB, Cloudinary, Server)
 * @access  Private (Admin only)
 */
router.get('/', requireAuth, requireAdmin, checkSystemHealth);

export default router;
