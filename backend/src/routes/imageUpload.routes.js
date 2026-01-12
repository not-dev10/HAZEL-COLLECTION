import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  uploadProductImages,
  getCloudinarySignature,
  deleteProductImage,
  reorderProductImages,
  uploadHomePageImage
} from '../controllers/imageUpload.controller.js';

const router = express.Router();

// Upload product images to Cloudinary
router.post('/product-images', requireAuth, requireAdmin, uploadProductImages);

// Upload home page images (carousel, bridal, collections)
router.post('/', requireAuth, requireAdmin, uploadHomePageImage);

// Get Cloudinary signature for client-side uploads
router.post('/cloudinary-signature', requireAuth, requireAdmin, getCloudinarySignature);

// Reorder product images
router.patch('/product-images/reorder/:productId', requireAuth, requireAdmin, reorderProductImages);

// Delete product image
router.delete('/product-image/:productId/:imageIndex', requireAuth, requireAdmin, deleteProductImage);

export default router;
