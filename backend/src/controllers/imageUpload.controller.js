import cloudinary from '../config/cloudinary.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { Product } from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cloudinaryService = new CloudinaryService();

/**
 * POST /api/upload/product-images
 * Upload product images directly to Cloudinary
 * Supports both file uploads and base64 data URLs
 */
export const uploadProductImages = async (req, res) => {
  try {
    // Verify cloudinary is initialized
    console.log('🔍 Cloudinary object check:', {
      isNull: cloudinary === null,
      isUndefined: cloudinary === undefined,
      type: typeof cloudinary,
      keys: cloudinary ? Object.keys(cloudinary).slice(0, 10) : 'N/A',
      hasUploader: cloudinary?.uploader ? true : false
    });

    if (!cloudinary || !cloudinary.uploader) {
      console.error('❌ Cloudinary is not properly initialized', {
        cloudinary: typeof cloudinary,
        uploader: cloudinary?.uploader ? 'exists' : 'missing'
      });
      return res.status(500).json({
        success: false,
        message: "Cloudinary service is not available"
      });
    }

    const { productId, images } = req.body;
    
    if (!productId || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId and images array"
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const uploadedImages = [];
    const errors = [];

    // Upload each image to Cloudinary
    for (let i = 0; i < images.length; i++) {
      try {
        const imageData = images[i];
        const imageType = imageData.type || `alt${i + 1}`;
        
        // Debug logging
        console.log(`Processing image ${i}:`, {
          hasUrl: !!imageData.url,
          hasPath: !!imageData.path,
          urlPreview: imageData.url ? imageData.url.substring(0, 50) : 'N/A',
          type: typeof imageData.url
        });
        
        // Handle base64 data URL
        if (imageData.url && typeof imageData.url === 'string' && imageData.url.startsWith('data:image')) {
          try {
            console.log(`⏳ Uploading image ${i} to Cloudinary (size: ${imageData.url.length} bytes)`);
            const result = await cloudinary.uploader.upload(imageData.url, {
              folder: `didi-fashion/products/${productId}`,
              public_id: `image-${i + 1}`,
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto',
              overwrite: true,
              tags: ['product', productId, 'didi-fashion']
            });

            console.log(`✅ Image ${i} uploaded successfully:`, result.secure_url);
            uploadedImages.push({
              url: result.secure_url,
              publicId: result.public_id,
              type: imageType,
              index: i + 1
            });
          } catch (cloudinaryError) {
            console.error(`❌ Cloudinary upload failed for image ${i}:`, {
              error: cloudinaryError.message,
              status: cloudinaryError.status,
              http_code: cloudinaryError.http_code
            });
            throw cloudinaryError;
          }
        } 
        // Handle file path (from multer)
        else if (imageData.path && fs.existsSync(imageData.path)) {
          const result = await cloudinary.uploader.upload(imageData.path, {
            folder: `didi-fashion/products/${productId}`,
            public_id: `image-${i + 1}`,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            overwrite: true,
            tags: ['product', productId, 'didi-fashion']
          });

          // Delete temporary file
          fs.unlinkSync(imageData.path);

          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            type: imageType,
            index: i + 1
          });
        }
        // Handle external URL
        else if (imageData.url && imageData.url.startsWith('http')) {
          const result = await cloudinary.uploader.upload(imageData.url, {
            folder: `didi-fashion/products/${productId}`,
            public_id: `image-${i + 1}`,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            overwrite: true,
            tags: ['product', productId, 'didi-fashion']
          });

          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            type: imageType,
            index: i + 1
          });
        } else {
          errors.push({
            index: i,
            error: "Invalid image format. Provide data URL, file path, or external URL"
          });
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload any images",
        errors
      });
    }

    // Update product with image URLs in database
    const imageUrls = uploadedImages.map(img => img.url);
    const updateData = {
      image: imageUrls[0],  // Primary image
      images: imageUrls,     // All images array
      updatedAt: new Date()
    };

    const updatedProduct = await Product.update(productId, updateData);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      data: {
        productId,
        uploadedImages,
        errors: errors.length > 0 ? errors : undefined,
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message
    });
  }
};

/**
 * POST /api/upload/cloudinary-signature
 * Generate Cloudinary upload signature for client-side uploads
 * Allows frontend to upload directly to Cloudinary
 */
export const getCloudinarySignature = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: productId"
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Create signature for secure uploads
    const crypto = await import('crypto');
    const params = {
      timestamp,
      folder: `didi-fashion/products/${productId}`,
      tags: ['product', productId, 'didi-fashion']
    };

    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signature = crypto.createHash('sha1')
      .update(paramsString + apiSecret)
      .digest('hex');

    return res.status(200).json({
      success: true,
      message: "Cloudinary signature generated successfully",
      data: {
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder: `didi-fashion/products/${productId}`,
        tags: ['product', productId, 'didi-fashion'],
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      }
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Cloudinary signature",
      error: error.message
    });
  }
};

/**
 * DELETE /api/upload/product-image/:productId/:imageIndex
 * Delete a specific image from product
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageIndex } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const images = product.images || [];
    const imageToDelete = images[parseInt(imageIndex)];

    if (!imageToDelete) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    // Delete from Cloudinary
    const publicId = `didi-fashion/products/${productId}/image-${parseInt(imageIndex) + 1}`;
    
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.warn('Warning: Could not delete from Cloudinary:', error.message);
    }

    // Remove image from database
    const updatedImages = images.filter((_, idx) => idx !== parseInt(imageIndex));
    
    const updateData = {
      images: updatedImages,
      image: updatedImages[0] || null,  // Update primary image if needed
      updatedAt: new Date()
    };

    const updatedProduct = await Product.update(productId, updateData);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
    });
  }
};

/**
 * PATCH /api/upload/product-images/reorder/:productId
 * Reorder product images
 */
export const reorderProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageOrder } = req.body;

    if (!productId || !imageOrder || !Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId and imageOrder array"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const currentImages = product.images || [];

    // Validate that all provided indices are valid
    for (let idx of imageOrder) {
      if (typeof idx !== 'number' || idx < 0 || idx >= currentImages.length) {
        return res.status(400).json({
          success: false,
          message: `Invalid image index: ${idx}`
        });
      }
    }

    // Reorder images based on the provided indices
    const reorderedImages = imageOrder.map(idx => currentImages[idx]);

    const updateData = {
      images: reorderedImages,
      image: reorderedImages[0] || product.image,
      updatedAt: new Date()
    };

    const updatedProduct = await Product.update(productId, updateData);

    return res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error('Reorder images error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder images",
      error: error.message
    });
  }
};
