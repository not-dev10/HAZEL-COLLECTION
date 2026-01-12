import express from 'express';
import {
  getSalesAndRevenueData,
  getConversionData,
  getTopProducts,
  getKeyMetrics
} from '../controllers/analytics.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// Sales & Revenue Data
router.get('/sales-revenue', getSalesAndRevenueData);

// Conversion Data
router.get('/conversion', getConversionData);

// Top Products
router.get('/top-products', getTopProducts);

// Key Metrics (daily, weekly, monthly)
router.get('/metrics', getKeyMetrics);

export default router;
