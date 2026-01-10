import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';

const router = express.Router();

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
