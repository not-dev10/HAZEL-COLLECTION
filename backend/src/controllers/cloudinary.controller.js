import { 
  migrateExistingProductsToCloudinary,
  seedProductsWithCloudinary,
  generateProductImageVariants,
  uploadProductImageToCloudinary 
} from '../utils/cloudinarySync.js';
import { Product } from '../models/Product.js';

/**
 * POST /api/cloudinary/migrate
 * Migrate existing products to Cloudinary
 */
export const migrateProductsToCloudinary = async (req, res) => {
  try {
    console.log('🔄 Starting product migration to Cloudinary...');
    const result = await migrateExistingProductsToCloudinary();
    
    return res.status(200).json({
      success: true,
      message: 'Products migrated to Cloudinary successfully',
      data: result
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to migrate products to Cloudinary',
      error: error.message
    });
  }
};

/**
 * POST /api/cloudinary/seed
 * Seed database with sample Cloudinary products
 */
export const seedCloudinaryProducts = async (req, res) => {
  try {
    console.log('🌱 Starting database seeding with Cloudinary products...');
    const result = await seedProductsWithCloudinary();
    
    return res.status(200).json({
      success: true,
      message: 'Database seeded with Cloudinary products successfully',
      data: result
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed database with Cloudinary products',
      error: error.message
    });
  }
};

/**
 * POST /api/cloudinary/upload-image
 * Upload a single image to Cloudinary
 */
export const uploadImageToCloudinary = async (req, res) => {
  try {
    const { imageUrl, productName } = req.body;
    
    if (!imageUrl || !productName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: imageUrl, productName'
      });
    }
    
    console.log(`🔄 Uploading image to Cloudinary for: ${productName}`);
    const cloudinaryUrl = await uploadProductImageToCloudinary(imageUrl, productName);
    
    return res.status(200).json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      data: {
        originalUrl: imageUrl,
        cloudinaryUrl: cloudinaryUrl,
        productName: productName
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message
    });
  }
};

/**
 * GET /api/cloudinary/image-variants/:productId
 * Get image variants for a specific product
 */
export const getProductImageVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.cloudinaryPublicId) {
      return res.status(400).json({
        success: false,
        message: 'Product does not have Cloudinary integration'
      });
    }
    
    const variants = generateProductImageVariants(product.cloudinaryPublicId);
    
    return res.status(200).json({
      success: true,
      message: 'Image variants generated successfully',
      data: {
        productId: productId,
        productName: product.name,
        cloudinaryPublicId: product.cloudinaryPublicId,
        variants: variants
      }
    });
  } catch (error) {
    console.error('Image variants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate image variants',
      error: error.message
    });
  }
};

/**
 * GET /api/cloudinary/status
 * Get Cloudinary integration status
 */
export const getCloudinaryStatus = async (req, res) => {
  try {
    const products = await Product.findAll();
    
    const totalProducts = products.length;
    const cloudinaryProducts = products.filter(p => p.cloudinaryPublicId).length;
    const nonCloudinaryProducts = totalProducts - cloudinaryProducts;
    
    const status = {
      totalProducts,
      cloudinaryProducts,
      nonCloudinaryProducts,
      migrationPercentage: totalProducts > 0 ? Math.round((cloudinaryProducts / totalProducts) * 100) : 0,
      isFullyMigrated: nonCloudinaryProducts === 0,
      cloudinaryConfig: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured',
        apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
        apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
      }
    };
    
    return res.status(200).json({
      success: true,
      message: 'Cloudinary status retrieved successfully',
      data: status
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check Cloudinary status',
      error: error.message
    });
  }
};