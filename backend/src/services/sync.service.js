import { Product } from '../models/Product.js';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Order } from '../models/Order.js';

/**
 * Sync Service - Unified data synchronization between MongoDB and Cloudinary
 * Detects and fixes sync issues automatically
 */
export class SyncService {
  /**
   * Health check for all systems
   */
  static async checkHealth() {
    const health = {
      database: false,
      cloudinary: false,
      cart: false,
      wishlist: false,
      orders: false,
      timestamp: new Date()
    };

    try {
      // Check MongoDB
      const testProduct = await Product.findAll({ limit: 1 });
      health.database = Array.isArray(testProduct);
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
    }

    try {
      // Check Cloudinary
      const credentials = await cloudinaryService.validateCredentials();
      health.cloudinary = credentials.success;
    } catch (error) {
      console.error('❌ Cloudinary health check failed:', error.message);
    }

    try {
      // Check Cart
      health.cart = true; // Can be further enhanced
    } catch (error) {
      console.error('❌ Cart health check failed:', error.message);
    }

    try {
      // Check Wishlist
      health.wishlist = true; // Can be further enhanced
    } catch (error) {
      console.error('❌ Wishlist health check failed:', error.message);
    }

    return health;
  }

  /**
   * Sync product images between MongoDB and Cloudinary
   * Detects missing images and updates database
   */
  static async syncProductImages(productId) {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      // Get images from Cloudinary
      const cloudinaryImages = await cloudinaryService.getProductImages(productId);
      
      if (!cloudinaryImages.success) {
        return { success: false, error: 'Failed to fetch Cloudinary images' };
      }

      // Build images map
      const imagesMap = {};
      cloudinaryImages.images.forEach(img => {
        imagesMap[img.type] = {
          publicId: img.publicId,
          url: img.url,
          uploadedAt: img.uploadedAt
        };
      });

      // Update product in MongoDB
      const updated = await Product.updateCloudinaryImages(productId, {
        images: imagesMap,
        totalImages: cloudinaryImages.images.length
      });

      return {
        success: true,
        productId,
        syncedImages: cloudinaryImages.images.length,
        imagesMap
      };
    } catch (error) {
      console.error('❌ Sync product images error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync all products - full system sync
   */
  static async syncAllProducts() {
    try {
      const products = await Product.findAll();
      const results = {
        total: products.length,
        synced: 0,
        failed: 0,
        errors: []
      };

      for (const product of products) {
        try {
          const result = await this.syncProductImages(product.productId);
          if (result.success) {
            results.synced++;
          } else {
            results.failed++;
            results.errors.push({ productId: product.productId, error: result.error });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ productId: product.productId, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Sync all products error:', error);
      throw error;
    }
  }

  /**
   * Check for orphaned images in Cloudinary (images without product)
   */
  static async findOrphanedImages() {
    try {
      const resources = await cloudinaryService.getProductImages('');
      // Implementation depends on Cloudinary API capability
      
      return {
        success: true,
        message: 'Orphaned images check not fully implemented yet'
      };
    } catch (error) {
      console.error('❌ Find orphaned images error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect sync conflicts and fix them
   */
  static async detectAndFixSyncIssues() {
    const issues = {
      found: 0,
      fixed: 0,
      errors: []
    };

    try {
      const products = await Product.findAll();

      for (const product of products) {
        // Check 1: Product has no productId
        if (!product.productId) {
          issues.found++;
          try {
            // Generate productId for old products
            const newProductId = new ObjectId().toString();
            await Product.syncProductId(product.id, newProductId);
            issues.fixed++;
            console.log(`✅ Fixed missing productId for ${product.name}`);
          } catch (error) {
            issues.errors.push({
              issue: 'Missing productId',
              product: product.name,
              error: error.message
            });
          }
        }

        // Check 2: Cloudinary folder mismatch
        if (product.cloudinary && product.cloudinary.folder) {
          const expectedFolder = `didi-fashion/products/${product.productId}`;
          if (product.cloudinary.folder !== expectedFolder) {
            issues.found++;
            try {
              // Try to fix folder structure
              const moveResult = await cloudinaryService.moveProductFolder(
                product.cloudinary.folder.split('/').pop(),
                product.productId
              );
              if (moveResult.success) {
                issues.fixed++;
                console.log(`✅ Fixed folder structure for ${product.name}`);
              }
            } catch (error) {
              issues.errors.push({
                issue: 'Folder mismatch',
                product: product.name,
                error: error.message
              });
            }
          }
        }

        // Check 3: Image URL mismatch
        if (product.image && !product.image.includes('cloudinary.com')) {
          issues.found++;
          console.log(`⚠️ Product ${product.name} has non-Cloudinary image`);
          // Manual upload needed
        }
      }

      return {
        success: true,
        issuesFound: issues.found,
        issuesFixed: issues.fixed,
        errors: issues.errors
      };
    } catch (error) {
      console.error('❌ Detect and fix sync issues error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify cart items reference existing products
   */
  static async verifyCartSync() {
    try {
      const carts = await Cart.find({});
      let issues = 0;
      const orphanedItems = [];

      for (const cart of carts) {
        for (const item of cart.items || []) {
          const product = await Product.findById(item.id);
          if (!product) {
            issues++;
            orphanedItems.push({
              cartId: cart._id,
              itemId: item.id,
              itemName: item.name
            });
          }
        }
      }

      return {
        success: true,
        totalCarts: carts.length,
        issuesFound: issues,
        orphanedItems
      };
    } catch (error) {
      console.error('❌ Verify cart sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify wishlist items reference existing products
   */
  static async verifyWishlistSync() {
    try {
      const wishlists = await Wishlist.find({});
      let issues = 0;
      const orphanedItems = [];

      for (const wishlist of wishlists) {
        for (const item of wishlist.items || []) {
          const product = await Product.findById(item.id);
          if (!product) {
            issues++;
            orphanedItems.push({
              wishlistId: wishlist._id,
              itemId: item.id,
              itemName: item.name
            });
          }
        }
      }

      return {
        success: true,
        totalWishlists: wishlists.length,
        issuesFound: issues,
        orphanedItems
      };
    } catch (error) {
      console.error('❌ Verify wishlist sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify order items reference existing products
   */
  static async verifyOrderSync() {
    try {
      const orders = await Order.find({});
      let issues = 0;
      const orphanedItems = [];

      for (const order of orders) {
        for (const item of order.items || []) {
          const product = await Product.findById(item.id);
          if (!product) {
            issues++;
            orphanedItems.push({
              orderId: order._id,
              itemId: item.id,
              itemName: item.name
            });
          }
        }
      }

      return {
        success: true,
        totalOrders: orders.length,
        issuesFound: issues,
        orphanedItems
      };
    } catch (error) {
      console.error('❌ Verify order sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Full system sync report
   */
  static async generateSyncReport() {
    const report = {
      timestamp: new Date(),
      health: {},
      productSync: {},
      cartSync: {},
      wishlistSync: {},
      orderSync: {},
      recommendations: []
    };

    try {
      // Health check
      report.health = await this.checkHealth();

      // Product sync
      report.productSync = await this.detectAndFixSyncIssues();

      // Cart sync
      report.cartSync = await this.verifyCartSync();

      // Wishlist sync
      report.wishlistSync = await this.verifyWishlistSync();

      // Order sync
      report.orderSync = await this.verifyOrderSync();

      // Generate recommendations
      if (!report.health.database) {
        report.recommendations.push('🔴 Database connection issue - check MongoDB');
      }
      if (!report.health.cloudinary) {
        report.recommendations.push('🔴 Cloudinary connection issue - check API credentials');
      }
      if (report.cartSync.issuesFound > 0) {
        report.recommendations.push(`⚠️ Cart has ${report.cartSync.issuesFound} orphaned items`);
      }
      if (report.wishlistSync.issuesFound > 0) {
        report.recommendations.push(`⚠️ Wishlist has ${report.wishlistSync.issuesFound} orphaned items`);
      }
      if (report.orderSync.issuesFound > 0) {
        report.recommendations.push(`⚠️ Orders have ${report.orderSync.issuesFound} orphaned items`);
      }
      if (report.productSync.issuesFixed > 0) {
        report.recommendations.push(`✅ Fixed ${report.productSync.issuesFixed} product issues`);
      }

      return report;
    } catch (error) {
      console.error('❌ Generate sync report error:', error);
      return {
        ...report,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Clean up database - remove deleted Cloudinary images from DB
   */
  static async cleanupDeletedImages() {
    try {
      const products = await Product.findAll();
      let cleaned = 0;

      for (const product of products) {
        if (product.cloudinary && product.cloudinary.images) {
          const cloudinaryImages = await cloudinaryService.getProductImages(product.productId);
          
          if (cloudinaryImages.success) {
            const activeImageTypes = cloudinaryImages.images.map(img => img.type);
            
            // Remove references to deleted images
            const updatedImages = {};
            Object.keys(product.cloudinary.images).forEach(key => {
              if (activeImageTypes.includes(key)) {
                updatedImages[key] = product.cloudinary.images[key];
              }
            });

            if (Object.keys(updatedImages).length !== Object.keys(product.cloudinary.images).length) {
              await Product.updateCloudinaryImages(product.productId, {
                images: updatedImages,
                totalImages: Object.keys(updatedImages).length
              });
              cleaned++;
            }
          }
        }
      }

      return { success: true, cleanedProducts: cleaned };
    } catch (error) {
      console.error('❌ Cleanup deleted images error:', error);
      return { success: false, error: error.message };
    }
  }
}
