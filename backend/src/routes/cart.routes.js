import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../controllers/cart.controller.js';

const router = express.Router();

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Update item quantity
router.put('/update/:itemId', updateQuantity);

// Clear entire cart
router.delete('/clear', clearCart);

export default router;
