# Product ID Sync Issues - Detection & Resolution Guide

## Overview
This document identifies potential synchronization issues between MongoDB and Cloudinary, and provides solutions to prevent them.

---

## Critical Sync Issues & Solutions

### Issue 1: Orphaned Cloudinary Folders
**Problem:** Product deleted from MongoDB but folder remains in Cloudinary

**Detection:**
```bash
# Check for orphaned folders
POST /api/sync/validate
# Returns: products in Cloudinary not in MongoDB
```

**Prevention:**
```javascript
// backend/src/models/Product.js
static async delete(productId) {
  const db = getDB();
  
  // Step 1: Delete from Cloudinary FIRST
  try {
    await CloudinaryService.deleteProductImages(productId);
  } catch (error) {
    console.error('❌ Cloudinary deletion failed:', error);
    throw new Error('Cannot delete product until Cloudinary cleanup succeeds');
  }
  
  // Step 2: Delete from MongoDB
  const result = await db.collection('products').deleteOne({ productId });
  return result;
}
```

**Resolution Script:**
```javascript
// Run once to clean up existing orphans
export const cleanupOrphanedFolders = async () => {
  const cloudinaryImages = await getAllCloudinaryFolders('didi-fashion/products');
  const mongoProducts = await getAllProductIds();
  
  const orphans = cloudinaryImages.filter(
    folder => !mongoProducts.includes(extractProductId(folder))
  );
  
  for (const orphan of orphans) {
    await cloudinary.api.delete_folder(orphan);
    console.log(`✅ Deleted orphaned folder: ${orphan}`);
  }
};
```

---

### Issue 2: Products Without Images
**Problem:** Product created but no images uploaded yet

**Status:** ✅ Not a problem
```javascript
// This is expected behavior
{
  productId: "abc123",
  name: "Silk Saree",
  cloudinary: {
    images: {
      main: null,      // OK - image not uploaded yet
      alt1: null,      // OK - optional
      thumbnail: null  // OK - optional
    }
  }
}
```

**Best Practice:**
```javascript
// Mark product as draft if no main image
static async create(data) {
  const product = { ...data, status: 'draft' };
  // Change to 'published' when main image uploaded
  return await db.collection('products').insertOne(product);
}

static async uploadImage(productId, imageType) {
  if (imageType === 'main') {
    // Auto-publish when main image uploaded
    await db.collection('products').updateOne(
      { productId },
      { $set: { status: 'published' } }
    );
  }
}
```

---

### Issue 3: Sync Failures (Network Issues)
**Problem:** Image upload succeeds in Cloudinary but fails to update MongoDB

**Detection:**
```javascript
// Query products with stale Cloudinary references
const stale = await db.collection('products').find({
  'cloudinary.lastSync': { $lt: new Date(Date.now() - 3600000) } // 1 hour old
}).toArray();
```

**Prevention (Transaction-Based):**
```javascript
export const uploadProductImageSafe = async (productId, file, imageType) => {
  const db = getDB();
  
  try {
    // Step 1: Upload to Cloudinary
    const cloudinaryResult = await CloudinaryService.uploadProductImage(
      file,
      productId,
      imageType
    );
    
    // Step 2: Update MongoDB within transaction
    const result = await db.collection('products').updateOne(
      { productId },
      {
        $set: {
          [`cloudinary.images.${imageType}`]: {
            publicId: cloudinaryResult.publicId,
            url: cloudinaryResult.url,
            uploadedAt: new Date()
          },
          'cloudinary.lastSync': new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      // MongoDB update failed, delete from Cloudinary
      await CloudinaryService.deleteProductImage(productId, imageType);
      throw new Error('Product not found - image not saved');
    }
    
    return cloudinaryResult;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
};
```

**Recovery Script:**
```javascript
export const resyncFailedUploads = async () => {
  const db = getDB();
  const cloudinaryService = new CloudinaryService();
  
  // Find products with upload timestamp but no URL
  const failed = await db.collection('products').find({
    $expr: {
      $ne: ['$cloudinary.uploadedAt', null]
    },
    'cloudinary.images.main.url': null
  }).toArray();
  
  console.log(`Found ${failed.length} failed syncs`);
  
  for (const product of failed) {
    const images = await cloudinaryService.getProductImages(product.productId);
    
    // Update MongoDB with retrieved Cloudinary data
    await db.collection('products').updateOne(
      { productId: product.productId },
      {
        $set: {
          cloudinary: {
            ...product.cloudinary,
            images: formatImages(images),
            lastSync: new Date()
          }
        }
      }
    );
    
    console.log(`✅ Resynced: ${product.name}`);
  }
};
```

---

### Issue 4: Duplicate Images
**Problem:** Same image uploaded multiple times to different product folders

**Detection:**
```javascript
export const findDuplicateImages = async () => {
  const db = getDB();
  const products = await db.collection('products').find({}).toArray();
  
  const imageMap = new Map();
  const duplicates = [];
  
  for (const product of products) {
    const images = Object.values(product.cloudinary.images).filter(Boolean);
    
    for (const image of images) {
      if (imageMap.has(image.publicId)) {
        duplicates.push({
          image: image.publicId,
          products: [imageMap.get(image.publicId), product.productId]
        });
      } else {
        imageMap.set(image.publicId, product.productId);
      }
    }
  }
  
  return duplicates;
};
```

**Prevention:**
```javascript
// Use image hash to prevent duplicates
export const uploadWithDeduplication = async (productId, file, imageType) => {
  const db = getDB();
  const fileHash = await generateFileHash(file);
  
  // Check if this image already exists
  const existing = await db.collection('products').findOne({
    'cloudinary.imageHashes': fileHash
  });
  
  if (existing) {
    // Reuse existing image
    return existing.cloudinary.images;
  }
  
  // New image - upload normally
  return await uploadProductImageSafe(productId, file, imageType);
};
```

---

### Issue 5: Cart Items Point to Deleted Products
**Problem:** Product deleted but cart still has reference

**Detection:**
```javascript
export const findBrokenCartReferences = async () => {
  const db = getDB();
  const carts = await db.collection('carts').find({}).toArray();
  const products = await db.collection('products').find({}).toArray();
  
  const productIds = new Set(products.map(p => p.productId));
  const broken = [];
  
  for (const cart of carts) {
    for (const item of cart.items) {
      if (!productIds.has(item.id)) {
        broken.push({
          cartId: cart._id,
          itemId: item.id,
          itemName: item.name
        });
      }
    }
  }
  
  return broken;
};
```

**Prevention:**
```javascript
// Soft delete: Don't actually delete, just hide
static async softDelete(productId) {
  const db = getDB();
  
  return await db.collection('products').updateOne(
    { productId },
    {
      $set: {
        isActive: false,
        deletedAt: new Date()
      }
    }
  );
}

// Hard delete: Only after grace period
static async hardDelete(productId, gracePeriodDays = 30) {
  const db = getDB();
  const product = await db.collection('products').findOne({ productId });
  
  if (!product?.deletedAt) {
    throw new Error('Product not soft-deleted yet');
  }
  
  const daysSinceDelete = (Date.now() - product.deletedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceDelete < gracePeriodDays) {
    throw new Error(`Must wait ${gracePeriodDays - daysSinceDelete} more days`);
  }
  
  // Now safe to delete
  await CloudinaryService.deleteProductImages(productId);
  return await db.collection('products').deleteOne({ productId });
}
```

---

### Issue 6: Wishlist Items Point to Deleted Products
**Problem:** Product deleted but wishlist still has reference

**Same Prevention as Cart (Issue 5)**

---

### Issue 7: Image URLs Change
**Problem:** Cloudinary reorganizes folders, URLs change

**Prevention:**
```javascript
// Always store publicId, not just URL
{
  cloudinary: {
    images: {
      main: {
        publicId: 'didi-fashion/products/abc123/main',  // ✅ Store this
        url: 'https://res.cloudinary.com/...'            // ✅ Cache this
      }
    }
  }
}

// Generate URL from publicId when needed
getImageUrl(product, imageType, size) {
  const { publicId } = product.cloudinary.images[imageType];
  return CloudinaryService.getOptimizedUrl(publicId, size);
}
```

---

### Issue 8: Large File Uploads Timeout
**Problem:** User uploads large image, times out, partial upload in Cloudinary

**Prevention:**
```javascript
export const uploadWithRetry = async (productId, file, imageType, maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      return await uploadProductImageSafe(productId, file, imageType);
    } catch (error) {
      attempts++;
      
      if (error.message.includes('timeout') && attempts < maxRetries) {
        console.log(`⏳ Retry ${attempts}/${maxRetries}...`);
        await sleep(2000 * attempts); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
};

// Configure timeout for large files
const uploadConfig = {
  maxSize: '50mb',
  timeout: 300000, // 5 minutes
  chunkSize: '5mb' // Upload in chunks
};
```

---

## Monitoring & Health Checks

### Daily Sync Health Check
```javascript
export const dailySyncHealthCheck = async () => {
  const db = getDB();
  
  const checks = {
    orphanedFolders: await findOrphanedFolders(),
    brokenCartRefs: await findBrokenCartReferences(),
    brokenWishlistRefs: await findBrokenWishlistReferences(),
    failedSyncs: await findFailedSyncs(),
    duplicateImages: await findDuplicateImages()
  };
  
  const issues = Object.values(checks).flat();
  
  if (issues.length === 0) {
    console.log('✅ All sync checks passed');
  } else {
    console.warn(`⚠️ Found ${issues.length} sync issues`);
    return issues;
  }
};

// Run daily via cron
import cron from 'node-cron';
cron.schedule('0 2 * * *', dailySyncHealthCheck); // 2 AM daily
```

### Sync Dashboard Endpoint
```javascript
router.get('/sync/health', async (req, res) => {
  try {
    const health = {
      timestamp: new Date(),
      checks: await dailySyncHealthCheck(),
      status: 'healthy',
      summary: {
        totalProducts: await Product.count(),
        productsWithImages: await Product.count({ 'cloudinary.images.main': { $ne: null } }),
        activeProducts: await Product.count({ isActive: true }),
        lastSync: await getLastSyncTime()
      }
    };
    
    if (health.checks.length > 0) {
      health.status = 'warning';
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Automated Recovery

### Auto-Sync Service
```javascript
export class SyncService {
  // Run every hour
  static async scheduleAutoSync() {
    cron.schedule('0 * * * *', async () => {
      console.log('🔄 Running auto-sync...');
      
      try {
        await this.syncAllProducts();
        await this.resyncFailedUploads();
        await this.cleanupOrphanedFolders();
        console.log('✅ Auto-sync completed');
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
        // Send alert to admin
        sendAlert('Auto-sync failed', error.message);
      }
    });
  }
}
```

---

## Sync Configuration

### Environment Variables
```env
# backend/.env
SYNC_INTERVAL=3600000              # 1 hour
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=2000
SYNC_BATCH_SIZE=50                 # Process 50 products at a time
PRODUCT_GRACE_DELETE_DAYS=30       # 30-day grace period before hard delete
CLOUDINARY_MAX_FILE_SIZE=52428800  # 50MB
CLOUDINARY_UPLOAD_TIMEOUT=300000   # 5 minutes
```

---

## Testing Sync

### Unit Tests
```javascript
describe('Product Sync Tests', () => {
  test('uploadProductImage updates both systems', async () => {
    const product = await Product.create({ name: 'Test' });
    const file = loadTestImage();
    
    const result = await uploadProductImageSafe(product.productId, file, 'main');
    
    // Verify MongoDB
    const mongoProduct = await Product.findByProductId(product.productId);
    expect(mongoProduct.cloudinary.images.main).toBeDefined();
    
    // Verify Cloudinary
    const cloudinaryImages = await CloudinaryService.getProductImages(product.productId);
    expect(cloudinaryImages.length).toBeGreaterThan(0);
  });
  
  test('delete product removes from both systems', async () => {
    const product = await Product.create({ name: 'Test' });
    await uploadProductImageSafe(product.productId, file, 'main');
    
    await Product.delete(product.productId);
    
    // Verify MongoDB
    const mongoProduct = await Product.findByProductId(product.productId);
    expect(mongoProduct).toBeNull();
    
    // Verify Cloudinary
    const cloudinaryImages = await CloudinaryService.getProductImages(product.productId);
    expect(cloudinaryImages.length).toBe(0);
  });
  
  test('soft delete preserves cart references', async () => {
    const product = await Product.create({ name: 'Test' });
    const cart = await Cart.create(userId, [{ id: product.productId }]);
    
    await Product.softDelete(product.productId);
    
    const updatedCart = await Cart.findByUserId(userId);
    expect(updatedCart.items[0].id).toBe(product.productId);
  });
});
```

---

## Summary of Sync Issues & Solutions

| Issue | Detection | Prevention | Recovery |
|-------|-----------|-----------|----------|
| Orphaned Cloudinary folders | `/api/sync/validate` | Delete in order | `cleanupOrphanedFolders()` |
| No main image | Manual check | Mark as draft | None needed |
| Sync failures | `lastSync` timestamp | Transaction-based | `resyncFailedUploads()` |
| Duplicate images | Image hash check | Use deduplication | Manual merge |
| Broken cart refs | Query validation | Soft delete | Cart cleanup script |
| Broken wishlist refs | Query validation | Soft delete | Wishlist cleanup script |
| URL changes | Store publicId only | Always use publicId | URL regeneration |
| Upload timeout | File size check | Chunked upload | Retry logic |

---

**Last Updated:** January 9, 2026
**Status:** Comprehensive sync solution ready
**Next:** Run health checks in development
