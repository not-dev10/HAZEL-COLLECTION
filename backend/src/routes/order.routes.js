import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
  trackOrderByNumber,
  requestOrderOTP,
  verifyOrderOTP,
} from '../controllers/order.controller.js';

const router = express.Router();

// PUBLIC: OTP-based order tracking (no auth required)
router.post('/request-otp', requestOrderOTP);
router.post('/verify-otp', verifyOrderOTP);

// PUBLIC: Track order by order number (no auth required) - MUST be before /:orderId
router.get('/track/:orderNumber', trackOrderByNumber);

// Create new order
router.post('/', createOrder);

// Get user's orders
router.get('/', getUserOrders);

// Get specific order
router.get('/:orderId', getOrderById);

// Update order status
router.put('/:orderId/status', updateOrderStatus);

// Delete order
router.delete('/:orderId', deleteOrder);

export default router;
