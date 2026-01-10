import cloudinary from 'cloudinary';

/**
 * Cloudinary Service - Unified image management with product ID sync
 */
export class CloudinaryService {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret
    });
  }

  /**
   * Upload product image with unified ID structure
   * Folder: didi-fashion/products/{productId}/{imageType}
   */
  async uploadProductImage(filePath, productId, imageType = 'main') {
    try {
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: `didi-fashion/products/${productId}`,
        public_id: imageType,  // main, alt1, alt2, thumbnail, swatch
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        overwrite: true,  // Overwrite if exists
        
        // Image optimization based on type
        width: this.getImageDimensions(imageType).width,
        height: this.getImageDimensions(imageType).height,
        crop: 'fill',
        
        // Tags for easy identification and cleanup
        tags: ['product', productId, imageType, 'didi-fashion']
      });

      return {
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        bytes: result.bytes,
        format: result.format,
        uploadedAt: new Date(),
        folder: `didi-fashion/products/${productId}`
      };
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
        productId,
        imageType
      };
    }
  }

  /**
   * Get image dimensions based on type
   */
  getImageDimensions(imageType) {
    const dimensions = {
      thumbnail: { width: 200, height: 250 },
      swatch: { width: 100, height: 100 },
      card: { width: 400, height: 500 },
      medium: { width: 600, height: 800 },
      main: { width: 800, height: 1000 },
      full: { width: 1200, height: 1500 },
      hero: { width: 1920, height: 600 }
    };
    
    return dimensions[imageType] || dimensions.main;
  }

  /**
   * Get all images for a product
   */
  async getProductImages(productId) {
    try {
      const resources = await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: `didi-fashion/products/${productId}`,
        max_results: 50,
        tags: true
      });

      return {
        success: true,
        productId,
        images: resources.resources.map(r => ({
          type: r.public_id.split('/').pop(), // Extract image type
          url: r.secure_url,
          publicId: r.public_id,
          size: r.bytes,
          width: r.width,
          height: r.height,
          format: r.format,
          uploadedAt: r.created_at,
          tags: r.tags || []
        })),
        total: resources.resources.length
      };
    } catch (error) {
      console.error('❌ Error fetching product images:', error);
      return {
        success: false,
        error: error.message,
        productId,
        images: []
      };
    }
  }

  /**
   * Get optimized image URL for product
   */
  getOptimizedUrl(productId, imageType = 'main', size = 'full') {
    const publicId = `didi-fashion/products/${productId}/${imageType}`;
    
    const transformations = {
      thumbnail: 'w_200,h_250,c_fill,q_auto,f_auto',
      swatch: 'w_100,h_100,c_fill,q_auto,f_auto',
      card: 'w_400,h_500,c_fill,q_auto,f_auto',
      medium: 'w_600,h_800,c_fill,q_auto,f_auto',
      full: 'w_800,h_1000,c_fill,q_auto,f_auto',
      hero: 'w_1920,h_600,c_fill,q_auto,f_auto'
    };

    const transform = transformations[size] || transformations.full;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transform}/${publicId}`;
  }

  /**
   * Delete all images for a product (folder cleanup)
   */
  async deleteProductImages(productId) {
    try {
      // Delete all resources in the product folder
      await cloudinary.v2.api.delete_resources_by_prefix(
        `didi-fashion/products/${productId}`
      );

      console.log(`✅ Deleted all images for product ${productId}`);

      return { success: true, productId };
    } catch (error) {
      console.error('❌ Error deleting product images:', error);
      return { success: false, error: error.message, productId };
    }
  }

  /**
   * Move/rename product folder (for product ID changes)
   */
  async moveProductFolder(oldProductId, newProductId) {
    try {
      // Get all images from old folder
      const oldImages = await this.getProductImages(oldProductId);
      
      if (!oldImages.success || oldImages.images.length === 0) {
        return { success: false, error: 'No images to move' };
      }

      // Rename each image
      const results = [];
      for (const image of oldImages.images) {
        const oldPublicId = image.publicId;
        const newPublicId = oldPublicId.replace(
          `didi-fashion/products/${oldProductId}`,
          `didi-fashion/products/${newProductId}`
        );

        try {
          await cloudinary.v2.uploader.rename(oldPublicId, newPublicId);
          results.push({ success: true, image: newPublicId });
        } catch (err) {
          results.push({ success: false, error: err.message });
        }
      }

      return {
        success: true,
        oldProductId,
        newProductId,
        movedImages: results.filter(r => r.success).length,
        totalImages: results.length
      };
    } catch (error) {
      console.error('❌ Error moving product folder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate image variants for a product (for display)
   */
  generateImageVariants(productId) {
    return {
      thumbnail: this.getOptimizedUrl(productId, 'main', 'thumbnail'),
      card: this.getOptimizedUrl(productId, 'main', 'card'),
      medium: this.getOptimizedUrl(productId, 'main', 'medium'),
      full: this.getOptimizedUrl(productId, 'main', 'full'),
      hero: this.getOptimizedUrl(productId, 'main', 'hero'),
      swatch: this.getOptimizedUrl(productId, 'swatch', 'swatch')
    };
  }

  /**
   * Validate Cloudinary credentials
   */
  async validateCredentials() {
    try {
      await cloudinary.v2.api.resources({ max_results: 1 });
      return { success: true, message: 'Credentials valid' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Cloudinary account usage
   */
  async getUsage() {
    try {
      const usage = await cloudinary.v2.api.usage();
      return {
        success: true,
        usage: {
          requests: usage.requests,
          bandwidth: usage.bandwidth,
          storage: usage.storage,
          mediaAssets: usage.media_assets,
          plan: usage.plan
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
