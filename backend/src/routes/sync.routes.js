import express from 'express';
import { SyncService } from '../services/sync.service.js';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { Product } from '../models/Product.js';
import { requireAuth as auth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Health Check - Check all systems status
 * GET /api/sync/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await SyncService.checkHealth();
    
    const allHealthy = Object.values(health)
      .filter(v => typeof v === 'boolean')
      .every(v => v === true);

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      health,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Sync Single Product Images
 * POST /api/sync/product/:productId
 */
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const result = await SyncService.syncProductImages(productId);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Sync All Products
 * POST /api/sync/products/all
 * Admin only
 */
router.post('/products/all', auth, async (req, res) => {
  try {
    const result = await SyncService.syncAllProducts();
    
    res.json({
      success: result.failed === 0,
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Detect and Fix Sync Issues
 * POST /api/sync/fix-issues
 * Admin only
 */
router.post('/fix-issues', auth, async (req, res) => {
  try {
    const result = await SyncService.detectAndFixSyncIssues();
    
    res.json({
      success: result.success,
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify Cart Sync
 * GET /api/sync/verify/cart
 * Admin only
 */
router.get('/verify/cart', auth, async (req, res) => {
  try {
    const result = await SyncService.verifyCartSync();
    
    res.json({
      success: result.success,
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify Wishlist Sync
 * GET /api/sync/verify/wishlist
 * Admin only
 */
router.get('/verify/wishlist', auth, async (req, res) => {
  try {
    const result = await SyncService.verifyWishlistSync();
    
    res.json({
      success: result.success,
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify Orders Sync
 * GET /api/sync/verify/orders
 * Admin only
 */
router.get('/verify/orders', auth, async (req, res) => {
  try {
    const result = await SyncService.verifyOrderSync();
    
    res.json({
      success: result.success,
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Full Sync Report
 * GET /api/sync/report
 * Admin only
 */
router.get('/report', auth, async (req, res) => {
  try {
    const report = await SyncService.generateSyncReport();
    
    res.json({
      ...report,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * Cleanup Deleted Images
 * POST /api/sync/cleanup
 * Admin only
 */
router.post('/cleanup', auth, async (req, res) => {
  try {
    const result = await SyncService.cleanupDeletedImages();
    
    res.json({
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cloudinary Account Usage
 * GET /api/sync/cloudinary/usage
 * Admin only
 */
router.get('/cloudinary/usage', auth, async (req, res) => {
  try {
    const result = await cloudinaryService.getUsage();
    
    res.json({
      ...result,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Test Upload - Upload test image to Cloudinary
 * POST /api/sync/test-upload
 * Admin only
 */
router.post('/test-upload', auth, async (req, res) => {
  try {
    // Create a test product
    const testProduct = await Product.create({
      name: 'Sync Test Product',
      description: 'Test product for sync verification',
      price: 0,
      category: 'Test',
      stock: 0,
      inStock: false,
      isActive: false
    });

    // Create a test image buffer (simple 1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Upload test image
    const uploadResult = await cloudinaryService.uploadProductImage(
      testImageBuffer,
      testProduct.productId,
      'main'
    );

    res.json({
      success: uploadResult.success,
      message: 'Test upload completed',
      productId: testProduct.productId,
      uploadResult,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get Inventory & Products Sync Status
 * GET /api/sync/status
 */
router.get('/status', auth, async (req, res) => {
  try {
    const products = await Product.findAll();
    
    // Check if Inventory model exists and fetch inventory
    let inventory = [];
    try {
      // Try to import Inventory model if it exists
      const inventoryResponse = await fetch(
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/inventory`,
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
      if (inventoryResponse.ok) {
        const data = await inventoryResponse.json();
        inventory = data.inventory || [];
      }
    } catch (error) {
      console.log('Could not fetch inventory');
    }

    const syncStatus = products.map(product => {
      const inventoryItem = inventory.find(item => 
        item.productId === product._id || item.id === product._id
      );

      const productStock = product.stock || 0;
      const inventoryStock = inventoryItem?.currentStock || 0;
      const isInSync = productStock === inventoryStock;

      return {
        id: product._id,
        productName: product.name,
        productStock,
        inventoryStock,
        isInSync,
        lastSyncedAt: product.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      syncStatus,
      lastChecked: new Date()
    });
  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sync status',
      error: error.message
    });
  }
});

/**
 * Sync Product Stock to Inventory
 * POST /api/sync/product-to-inventory
 */
router.post('/product-to-inventory', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing productId'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update inventory via API call
    try {
      const updateResponse = await fetch(
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/products-attributes/${productId}/stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization
          },
          body: JSON.stringify({
            quantity: product.stock || 0
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Failed to update inventory');
      }

      res.status(200).json({
        success: true,
        message: 'Synced product to inventory successfully',
        productId,
        stock: product.stock || 0,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error syncing to inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync product to inventory',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Product to inventory sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    });
  }
});

/**
 * Sync Inventory Stock to Product
 * POST /api/sync/inventory-to-product
 */
router.post('/inventory-to-product', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing productId'
      });
    }

    // Fetch inventory item
    let inventoryItem = null;
    try {
      const inventoryResponse = await fetch(
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/inventory/${productId}`,
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
      if (inventoryResponse.ok) {
        const data = await inventoryResponse.json();
        inventoryItem = data.inventory || data.item;
      }
    } catch (error) {
      console.log('Could not fetch inventory item');
    }

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const inventoryStock = inventoryItem.currentStock || 0;

    // Update product stock
    const product = await Product.update(productId, {
      stock: inventoryStock,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Synced inventory to product successfully',
      productId,
      stock: inventoryStock,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Inventory to product sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    });
  }
});

/**
 * Sync All Products with Inventory
 * POST /api/sync/all
 */
router.post('/all', auth, async (req, res) => {
  try {
    const products = await Product.findAll();
    let syncedCount = 0;
    let failedCount = 0;

    for (const product of products) {
      try {
        // Sync product to inventory (P → I direction)
        const updateResponse = await fetch(
          `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/products-attributes/${product._id}/stock`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers.authorization
            },
            body: JSON.stringify({
              quantity: product.stock || 0
            })
          }
        );

        if (updateResponse.ok) {
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to sync product ${product._id}:`, error);
        failedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${syncedCount} products`,
      totalProducts: products.length,
      syncedCount,
      failedCount,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Sync all error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk sync failed',
      error: error.message
    });
  }
});

export default router;
