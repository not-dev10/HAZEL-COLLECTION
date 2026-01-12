import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  getCustomerStats,
  updateCustomer
} from '../controllers/customer.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes (requires authentication and admin role)
router.get('/', requireAuth, requireAdmin, getAllCustomers);
router.get('/stats', requireAuth, requireAdmin, getCustomerStats);
router.get('/:customerId', requireAuth, requireAdmin, getCustomerById);
router.put('/:customerId', requireAuth, requireAdmin, updateCustomer);

export default router;
