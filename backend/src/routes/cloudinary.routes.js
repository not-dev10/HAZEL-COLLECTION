import express from 'express';
import {
  migrateProductsToCloudinary,
  seedCloudinaryProducts,
  uploadImageToCloudinary,
  getProductImageVariants,
  getCloudinaryStatus
} from '../controllers/cloudinary.controller.js';

const router = express.Router();

// GET /api/cloudinary/status - Get Cloudinary integration status
router.get('/status', getCloudinaryStatus);

// POST /api/cloudinary/migrate - Migrate existing products to Cloudinary
router.post('/migrate', migrateProductsToCloudinary);

// POST /api/cloudinary/seed - Seed database with Cloudinary products
router.post('/seed', seedCloudinaryProducts);

// POST /api/cloudinary/upload-image - Upload single image to Cloudinary
router.post('/upload-image', uploadImageToCloudinary);

// GET /api/cloudinary/image-variants/:productId - Get image variants for product
router.get('/image-variants/:productId', getProductImageVariants);

export default router;