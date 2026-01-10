# Unified Product ID & Sync System - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install cloudinary
```

### 2. Set Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Check System Health
```bash
curl http://localhost:5000/api/sync/health
```

### 4. Create Test Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Test Saree",
    "price": 299.99,
    "category": "Sarees"
  }'
# Response includes productId
```

---

## 📁 Folder Structure

### MongoDB Collections
```
products {
  productId: "507f1f77bcf86cd799439011",  ← UNIFIED ID
  cloudinary: {
    folder: "didi-fashion/products/507f1f77bcf86cd799439011",
    images: { main, alt1, alt2, thumbnail, swatch }
  }
}

carts { items: [{ id: "507f1f77bcf86cd799439011", ... }] }
wishlists { items: [{ id: "507f1f77bcf86cd799439011", ... }] }
orders { items: [{ id: "507f1f77bcf86cd799439011", ... }] }
```

### Cloudinary Structure
```
didi-fashion/
├── products/
│   ├── 507f1f77bcf86cd799439011/  ← productId folder
│   │   ├── main
│   │   ├── alt1
│   │   ├── alt2
│   │   ├── thumbnail
│   │   └── swatch
│   ├── 507f1f77bcf86cd799439012/
│   └── ...
```

---

## 🔄 API Endpoints

### Health & Status
```bash
# Check all systems
GET /api/sync/health
Response: { database: true, cloudinary: true, ... }

# Get full report
GET /api/sync/report
Response: { health, productSync, cartSync, wishlistSync, recommendations }
```

### Product Sync
```bash
# Sync single product
POST /api/sync/product/{productId}
Response: { success, productId, syncedImages, imagesMap }

# Sync all products
POST /api/sync/products/all
Response: { total, synced, failed, errors }

# Auto-fix issues
POST /api/sync/fix-issues
Response: { issuesFound, issuesFixed, errors }

# Cleanup deleted images
POST /api/sync/cleanup
Response: { success, cleanedProducts }
```

### Verification
```bash
# Verify cart items reference valid products
GET /api/sync/verify/cart
Response: { totalCarts, issuesFound, orphanedItems }

# Verify wishlist items
GET /api/sync/verify/wishlist
Response: { totalWishlists, issuesFound, orphanedItems }

# Verify order items
GET /api/sync/verify/orders
Response: { totalOrders, issuesFound, orphanedItems }
```

### Cloudinary Info
```bash
# Get account usage
GET /api/sync/cloudinary/usage
Response: { requests, bandwidth, storage, mediaAssets }

# Test upload
POST /api/sync/test-upload
Response: { success, productId, uploadResult }
```

---

## 🛠️ Common Tasks

### Upload Image to Product
```javascript
// Backend
import { cloudinaryService } from '../services/cloudinary.service.js';

const result = await cloudinaryService.uploadProductImage(
  filePath,           // File path
  productId,          // Unified product ID
  'main'              // Image type: main, alt1, alt2, thumbnail, swatch
);

// Returns: { success, publicId, url }
```

### Get Image URLs
```javascript
// Get all variants
const urls = cloudinaryService.generateImageVariants(productId);
// Returns: { thumbnail, card, medium, full, hero, swatch }

// Get optimized URL
const url = cloudinaryService.getOptimizedUrl(
  productId,
  'main',    // image type
  'full'     // size: thumbnail, card, medium, full, hero
);
```

### Check Sync Status
```bash
# Generate comprehensive report
curl -X GET http://localhost:5000/api/sync/report \
  -H "Authorization: Bearer {token}"
```

### Fix Issues
```bash
# Auto-fix all detected issues
curl -X POST http://localhost:5000/api/sync/fix-issues \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## ⚠️ Sync Issues & Solutions

| Issue | Detection | Solution |
|-------|-----------|----------|
| Missing productId | `detectAndFixSyncIssues()` | Auto-generates and assigns |
| Cloudinary folder mismatch | Compares `cloudinary.folder` | Auto-moves folder |
| Non-Cloudinary image URL | Checks URL contains 'cloudinary.com' | Manual upload needed |
| Orphaned cart items | `verifyCartSync()` | Manual removal from cart |
| Orphaned wishlist items | `verifyWishlistSync()` | Manual removal from wishlist |
| Broken image refs | `syncProductImages()` | Auto-updates with real files |
| Deleted Cloudinary images | `cleanupDeletedImages()` | Removes DB references |

---

## 🎯 Best Practices

1. **Run Health Check Daily**
   ```bash
   GET /api/sync/health
   ```

2. **Generate Monthly Reports**
   ```bash
   GET /api/sync/report
   ```

3. **Auto-fix Issues**
   ```bash
   POST /api/sync/fix-issues
   ```

4. **Cleanup Deleted Images**
   ```bash
   POST /api/sync/cleanup
   ```

5. **Use Unified IDs Everywhere**
   - MongoDB: `productId` field
   - Cloudinary: `folder` path
   - API calls: Use `productId` not `_id`

6. **Image Naming Convention**
   - `main` - Primary product image
   - `alt1`, `alt2`, `alt3` - Alternate views
   - `thumbnail` - Gallery thumbnail (200x250)
   - `swatch` - Color swatch (100x100)

---

## 📊 Database Indexes

Recommended indexes for performance:

```javascript
// Product collection
db.products.createIndex({ productId: 1 })           // Unique
db.products.createIndex({ cloudinary.folder: 1 })   // For lookups
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })

// Cart collection
db.carts.createIndex({ "items.id": 1 })

// Wishlist collection
db.wishlists.createIndex({ "items.id": 1 })

// Orders collection
db.orders.createIndex({ "items.id": 1 })
```

---

## 🚨 Debugging

### Enable Debug Logging
```javascript
// Add to backend code
console.log('🔍 Sync Debug:', { productId, folder, images });
```

### Test Cloudinary Connection
```bash
GET /api/sync/health
# Should show: cloudinary: true
```

### Verify Product Structure
```bash
GET /api/products/{productId}
# Check response has:
# ✅ productId
# ✅ cloudinary.folder
# ✅ cloudinary.images
```

### Check Orphaned Items
```bash
GET /api/sync/verify/cart
GET /api/sync/verify/wishlist
GET /api/sync/verify/orders
```

---

## 📚 Files Created/Modified

### New Files
- `src/services/cloudinary.service.js` - Cloudinary operations
- `src/services/sync.service.js` - Sync detection & fixes
- `src/routes/sync.routes.js` - Sync API endpoints

### Modified Files
- `src/models/Product.js` - Added productId field
- `src/app.js` - Added sync routes

### Documentation
- `UNIFIED_SYNC_SYSTEM.md` - Complete system documentation
- `UNIFIED_SYNC_QUICK_REFERENCE.md` - This file

---

## 🎓 Learning Resources

1. **Product Creation Flow**
   - See: `src/controllers/product.controller.js`
   - productId auto-generated in `Product.create()`

2. **Image Upload Flow**
   - See: `src/services/cloudinary.service.js`
   - Images upload to `didi-fashion/products/{productId}/`

3. **Sync Detection**
   - See: `src/services/sync.service.js`
   - `detectAndFixSyncIssues()` method

4. **API Usage**
   - See: `src/routes/sync.routes.js`
   - All endpoints documented

---

## ✅ Checklist for Setup

- [ ] Install cloudinary package
- [ ] Set CLOUDINARY_* env variables
- [ ] Test health endpoint: `GET /api/sync/health`
- [ ] Run sync report: `GET /api/sync/report`
- [ ] Fix issues: `POST /api/sync/fix-issues`
- [ ] Create test product and upload image
- [ ] Verify images in Cloudinary dashboard
- [ ] Check MongoDB product document has productId
- [ ] Test image URLs in browser

---

## 🆘 Support

For issues:
1. Check `GET /api/sync/health` for system status
2. Review `GET /api/sync/report` for detailed issues
3. Run `POST /api/sync/fix-issues` to auto-resolve
4. Check backend logs for error messages
5. Verify Cloudinary credentials in .env

---

**Last Updated:** January 2026  
**Quick Reference v1.0**
