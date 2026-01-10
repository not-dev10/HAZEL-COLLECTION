import express from 'express';
import {
  getAllReviews,
  getProductReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  markHelpful,
} from '../controllers/review.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.post('/helpful/:reviewId', markHelpful);

// User routes (requires authentication)
router.post('/', requireAuth, createReview);

// Admin routes (requires authentication and admin role)
router.get('/', requireAuth, requireAdmin, getAllReviews);
router.put('/:reviewId/status', requireAuth, requireAdmin, updateReviewStatus);
router.delete('/:reviewId', requireAuth, requireAdmin, deleteReview);

export default router;
