import { uploadImageFromUrl } from './imageUpload.js';
import { Product } from '../models/Product.js';

/**
 * Sync product images with Cloudinary
 * This utility helps migrate existing products to use Cloudinary URLs
 */

/**
 * Upload product image to Cloudinary and return the URL
 * @param {string} imageUrl - Original image URL
 * @param {string} productName - Product name for naming
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadProductImageToCloudinary = async (imageUrl, productName) => {
  try {
    // Create a clean public ID from product name
    const publicId = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    const result = await uploadImageFromUrl(
      imageUrl,
      'hezal-couture/products',
      publicId
    );

    if (result.success) {
      return result.url;
    } else {
      console.error(`Failed to upload image for ${productName}:`, result.error);
      return imageUrl; // Return original URL if upload fails
    }
  } catch (error) {
    console.error(`Error uploading image for ${productName}:`, error);
    return imageUrl; // Return original URL if error occurs
  }
};

/**
 * Enhanced product creation with Cloudinary integration
 * @param {Object} productData - Product data including image
 * @returns {Promise<Object>} Created product with Cloudinary image URL
 */
export const createProductWithCloudinary = async (productData) => {
  try {
    let cloudinaryImageUrl = productData.image;

    // If image is provided and it's not already a Cloudinary URL
    if (productData.image && !productData.image.includes('cloudinary.com')) {
      console.log(`🔄 Uploading image to Cloudinary for product: ${productData.name}`);
      cloudinaryImageUrl = await uploadProductImageToCloudinary(
        productData.image,
        productData.name
      );
      console.log(`✅ Image uploaded successfully: ${cloudinaryImageUrl}`);
    }

    // Create product with Cloudinary URL
    const product = await Product.create({
      ...productData,
      image: cloudinaryImageUrl,
      // Add Cloudinary metadata (guard when image is undefined)
      cloudinaryPublicId: cloudinaryImageUrl && cloudinaryImageUrl.includes('cloudinary.com') 
        ? extractPublicIdFromUrl(cloudinaryImageUrl) 
        : null,
    });

    return product;
  } catch (error) {
    console.error('Error creating product with Cloudinary:', error);
    throw error;
  }
};

/**
 * Update product with Cloudinary image handling
 * @param {string} productId - Product ID
 * @param {Object} updateData - Update data including image
 * @returns {Promise<Object>} Updated product
 */
export const updateProductWithCloudinary = async (productId, updateData) => {
  try {
    const updatePayload = {};
    
    // Copy all update data except image (we'll handle image specially)
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'image') {
        updatePayload[key] = value;
      }
    }
    
    // Handle image separately
    if (updateData.image) {
      if (!updateData.image.includes('cloudinary.com')) {
        // Image needs to be uploaded to Cloudinary
        const existingProduct = await Product.findById(productId);
        const productName = updateData.name || existingProduct?.name || `product-${productId}`;
        
        console.log(`🔄 Uploading new image to Cloudinary for product: ${productName}`);
        const cloudinaryImageUrl = await uploadProductImageToCloudinary(
          updateData.image,
          productName
        );
        console.log(`✅ Image uploaded successfully: ${cloudinaryImageUrl}`);
        
        updatePayload.image = cloudinaryImageUrl;
        updatePayload.cloudinaryPublicId = extractPublicIdFromUrl(cloudinaryImageUrl);
      } else {
        // Image is already a Cloudinary URL
        updatePayload.image = updateData.image;
        updatePayload.cloudinaryPublicId = extractPublicIdFromUrl(updateData.image);
      }
    }
    // Note: If image is not provided, we don't set it at all, so existing image is preserved

    // Update product with Cloudinary URL
    const updatedProduct = await Product.update(productId, updatePayload);

    return updatedProduct;
  } catch (error) {
    console.error('Error updating product with Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} Public ID
 */
export const extractPublicIdFromUrl = (cloudinaryUrl) => {
  try {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/dknwcmcki/image/upload/v1767936581/hezal-couture/products/embroidered-silk-ensemble.jpg
    const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Generate different image transformations for a product
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Object with different image sizes
 */
export const generateProductImageVariants = (publicId) => {
  if (!publicId) return null;

  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  return {
    thumbnail: `${baseUrl}/w_150,h_200,c_fill,q_auto,f_auto/${publicId}`,
    card: `${baseUrl}/w_300,h_400,c_fill,q_auto,f_auto/${publicId}`,
    detail: `${baseUrl}/w_600,h_800,c_fill,q_auto,f_auto/${publicId}`,
    hero: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${publicId}`,
    original: `${baseUrl}/q_auto,f_auto/${publicId}`,
  };
};

/**
 * Migrate existing products to use Cloudinary
 * This function updates all products that don't have Cloudinary URLs
 */
export const migrateExistingProductsToCloudinary = async () => {
  try {
    console.log('🚀 Starting migration of existing products to Cloudinary...');
    
    // Get all products
    const products = await Product.findAll();
    console.log(`📦 Found ${products.length} products to check`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Skip if already using Cloudinary
      if (product.image && product.image.includes('cloudinary.com')) {
        console.log(`⏭️  Skipping ${product.name} - already using Cloudinary`);
        skippedCount++;
        continue;
      }

      // Skip if no image
      if (!product.image) {
        console.log(`⏭️  Skipping ${product.name} - no image`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`🔄 Migrating ${product.name}...`);
        
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadProductImageToCloudinary(
          product.image,
          product.name
        );

        // Update product in database
        await Product.update(product.id, {
          image: cloudinaryUrl,
          cloudinaryPublicId: extractPublicIdFromUrl(cloudinaryUrl),
        });

        console.log(`✅ Migrated ${product.name} successfully`);
        migratedCount++;

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to migrate ${product.name}:`, error);
      }
    }

    console.log(`🎉 Migration completed!`);
    console.log(`✅ Migrated: ${migratedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    
    return { migratedCount, skippedCount, totalProducts: products.length };
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

/**
 * Seed database with sample products using Cloudinary images
 */
export const seedProductsWithCloudinary = async () => {
  try {
    console.log('🌱 Seeding database with Cloudinary products...');

    const sampleProducts = [
      {
        name: 'Embroidered Silk Ensemble',
        description: 'An exquisite silk ensemble featuring intricate embroidery work with premium silk fabric. Perfect for festive occasions and celebrations.',
        price: 485,
        category: 'ready-to-wear',
        image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/embroidered-silk-ensemble`,
        cloudinaryPublicId: 'hezal-couture/products/embroidered-silk-ensemble',
        stock: 10,
        isNew: true,
        inStock: true,
        details: [
          '100% Premium Silk',
          'Hand-embroidered Details',
          'Comfortable Fit',
          'Easy Care',
          'Sustainable Production',
        ],
      },
      {
        name: 'Velvet Bridal Collection',
        description: 'A stunning velvet bridal piece featuring luxurious soft velvet fabric with elegant detailing. Perfect for your special day.',
        price: 1250,
        category: 'bridal',
        image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/velvet-bridal-collection.jpg`,
        cloudinaryPublicId: 'hezal-couture/products/velvet-bridal-collection.jpg',
        stock: 5,
        inStock: true,
        details: [
          'Premium Velvet',
          'Luxury Embellishments',
          'Perfect Bridal Fit',
          'Professional Cleaning Recommended',
          'Handcrafted Quality',
        ],
      },
      {
        name: 'Cotton Lawn Three Piece',
        description: 'A versatile three-piece cotton lawn suit perfect for everyday wear with a touch of elegance.',
        price: 195,
        originalPrice: 285,
        category: 'pret',
        image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/cotton-lawn-three-piece`,
        cloudinaryPublicId: 'hezal-couture/products/cotton-lawn-three-piece',
        stock: 15,
        isSale: true,
        inStock: true,
        details: [
          '100% Cotton Lawn',
          'Three-Piece Set',
          'Breathable Fabric',
          'Easy Maintenance',
          'Summer Collection',
        ],
      },
      {
        name: 'Festive Formal Wear',
        description: 'Elegant formal wear perfect for festive celebrations and special occasions.',
        price: 650,
        category: 'ready-to-wear',
        image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/festive-formal-wear`,
        cloudinaryPublicId: 'hezal-couture/products/festive-formal-wear',
        stock: 8,
        isNew: true,
        inStock: true,
        details: [
          'Premium Blend Fabric',
          'Formal Design',
          'Perfect For Celebrations',
          'Comfortable Wear',
          'Professional Finish',
        ],
      },
    ];

    let createdCount = 0;
    
    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existingProducts = await Product.findAll({ search: productData.name });
        const exists = existingProducts.some(p => p.name === productData.name);
        
        if (exists) {
          console.log(`⏭️  Product "${productData.name}" already exists, skipping...`);
          continue;
        }

        const product = await Product.create(productData);
        console.log(`✅ Created product: ${product.name}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create product "${productData.name}":`, error);
      }
    }

    console.log(`🎉 Seeding completed! Created ${createdCount} products.`);
    return { createdCount, totalSampleProducts: sampleProducts.length };
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
};

export default {
  uploadProductImageToCloudinary,
  createProductWithCloudinary,
  updateProductWithCloudinary,
  extractPublicIdFromUrl,
  generateProductImageVariants,
  migrateExistingProductsToCloudinary,
  seedProductsWithCloudinary,
};