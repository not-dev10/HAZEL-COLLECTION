# Unified Product ID & Sync System Documentation

## Overview

A comprehensive system that unifies product IDs across MongoDB and Cloudinary, automatically detecting and fixing sync issues.

---

## Architecture

### Unified Product ID System

```
Product Created:
├── MongoDB
│   ├── _id: ObjectId (unique MongoDB ID)
│   ├── productId: "507f1f77bcf86cd799439011" ← UNIFIED ID
│   ├── name: "Silk Saree"
│   ├── cloudinary: {
│   │   ├── folder: "didi-fashion/products/507f1f77bcf86cd799439011"
│   │   ├── images: { main, alt1, alt2, thumbnail, swatch }
│   │   └── totalImages: 5
│   └── ...
│
└── Cloudinary
    └── didi-fashion/products/507f1f77bcf86cd799439011/  ← SAME ID
        ├── main
        ├── alt1
        ├── alt2
        ├── thumbnail
        └── swatch
```

### Services & Models

```
CloudinaryService (src/services/cloudinary.service.js)
├── uploadProductImage()
├── getProductImages()
├── getOptimizedUrl()
├── deleteProductImages()
├── moveProductFolder()
└── generateImageVariants()

SyncService (src/services/sync.service.js)
├── checkHealth()
├── syncProductImages()
├── syncAllProducts()
├── detectAndFixSyncIssues()
├── verifyCartSync()
├── verifyWishlistSync()
├── verifyOrderSync()
├── generateSyncReport()
└── cleanupDeletedImages()

Product Model (src/models/Product.js)
├── findByProductId()
├── updateCloudinaryImages()
├── syncProductId()
└── ...
```

---

## Implementation Guide

### Step 1: Install Cloudinary SDK

```bash
cd backend
npm install cloudinary
npm install dotenv
```

### Step 2: Update Environment Variables

```env
# backend/.env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=didi_preset
```

### Step 3: Initialize Services

The services are already integrated into the routes. They auto-initialize on first call.

```javascript
import { cloudinaryService } from '../services/cloudinary.service.js';
import { SyncService } from '../services/sync.service.js';
```

### Step 4: API Endpoints

All sync endpoints are available at `/api/sync`:

#### Health Check
```bash
GET /api/sync/health
# Returns status of all systems
```

#### Sync Single Product
```bash
POST /api/sync/product/{productId}
Authorization: Bearer {token}

# Response:
{
  "success": true,
  "productId": "507f1f77bcf86cd799439011",
  "syncedImages": 5,
  "imagesMap": { ... }
}
```

#### Sync All Products
```bash
POST /api/sync/products/all
Authorization: Bearer {token}

# Response:
{
  "success": true,
  "total": 100,
  "synced": 98,
  "failed": 2,
  "errors": [...]
}
```

#### Detect & Fix Issues
```bash
POST /api/sync/fix-issues
Authorization: Bearer {token}

# Automatically detects and fixes:
# ✅ Missing productId
# ✅ Cloudinary folder mismatches
# ✅ Image reference inconsistencies
```

#### Full Sync Report
```bash
GET /api/sync/report
Authorization: Bearer {token}

# Returns comprehensive report:
{
  "health": { ... },
  "productSync": { ... },
  "cartSync": { ... },
  "wishlistSync": { ... },
  "orderSync": { ... },
  "recommendations": [...]
}
```

#### Verify Cart Items
```bash
GET /api/sync/verify/cart
Authorization: Bearer {token}

# Checks all cart items reference valid products
```

#### Verify Wishlist Items
```bash
GET /api/sync/verify/wishlist
Authorization: Bearer {token}

# Checks all wishlist items reference valid products
```

#### Verify Order Items
```bash
GET /api/sync/verify/orders
Authorization: Bearer {token}

# Checks all order items reference valid products
```

---

## Sync Issues Detected & Fixed

### Issue 1: Missing productId
**Problem:** Old products don't have a unified productId  
**Detection:** `detectAndFixSyncIssues()` checks for null productId  
**Fix:** Auto-generates ObjectId and assigns to product

### Issue 2: Cloudinary Folder Mismatch
**Problem:** Product folder doesn't match expected pattern  
**Detection:** Compares `cloudinary.folder` with expected `didi-fashion/products/{productId}`  
**Fix:** Auto-moves folder using `moveProductFolder()`

### Issue 3: Image URL Inconsistency
**Problem:** Product.image field has non-Cloudinary URL  
**Detection:** Checks if image URL includes 'cloudinary.com'  
**Fix:** Manual upload needed (logged in report)

### Issue 4: Orphaned Cart Items
**Problem:** Cart contains items for deleted products  
**Detection:** `verifyCartSync()` checks product existence  
**Fix:** Logs orphaned items for manual cleanup

### Issue 5: Orphaned Wishlist Items
**Problem:** Wishlist contains items for deleted products  
**Detection:** `verifyWishlistSync()` checks product existence  
**Fix:** Logs orphaned items for manual cleanup

### Issue 6: Orphaned Order Items
**Problem:** Orders contain items for deleted products  
**Detection:** `verifyOrderSync()` checks product existence  
**Fix:** Logs orphaned items (shouldn't happen for completed orders)

### Issue 7: Broken Image References
**Problem:** Product references images in Cloudinary that don't exist  
**Detection:** `syncProductImages()` compares DB refs with actual images  
**Fix:** Auto-updates DB with actual Cloudinary structure

---

## Usage Examples

### Create Product with Unified ID

```javascript
const product = await Product.create({
  name: 'Silk Saree',
  price: 299.99,
  category: 'Sarees',
  image: 'https://example.com/image.jpg'
});

// Automatically:
// 1. Generates productId: "507f1f77bcf86cd799439011"
// 2. Creates cloudinary.folder: "didi-fashion/products/507f1f77bcf86cd799439011"
// 3. Stores in MongoDB with productId
```

### Upload Image to Product

```javascript
const result = await cloudinaryService.uploadProductImage(
  filePath,
  '507f1f77bcf86cd799439011',  // productId
  'main'  // image type: main, alt1, alt2, thumbnail, swatch
);

// Automatically:
// 1. Creates folder if doesn't exist
// 2. Uploads to: didi-fashion/products/507f1f77bcf86cd799439011/main
// 3. Returns optimized URL
```

### Get All Product Images

```javascript
const images = await cloudinaryService.getProductImages('507f1f77bcf86cd799439011');

// Returns:
{
  images: [
    {
      type: 'main',
      url: 'https://res.cloudinary.com/.../main',
      publicId: 'didi-fashion/products/.../main',
      uploadedAt: '2024-01-09T...'
    },
    // ... more images
  ]
}
```

### Get Optimized Image URLs

```javascript
const urls = cloudinaryService.generateImageVariants('507f1f77bcf86cd799439011');

// Returns:
{
  thumbnail: 'url with w_200,h_250',
  card: 'url with w_400,h_500',
  medium: 'url with w_600,h_800',
  full: 'url with w_800,h_1000',
  hero: 'url with w_1920,h_600',
  swatch: 'url with w_100,h_100'
}
```

### Run Full Sync Check

```bash
# In admin panel or terminal
curl -X POST http://localhost:5000/api/sync/fix-issues \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## Database Schema - Product Collection

```javascript
{
  // MongoDB ID
  _id: ObjectId("..."),
  
  // Unified Product ID (synced with Cloudinary)
  productId: "507f1f77bcf86cd799439011",
  
  // Basic Info
  name: "Silk Saree",
  description: "Premium silk saree",
  category: "Sarees",
  collection: "Festive",
  
  // Pricing
  price: 299.99,
  originalPrice: 399.99,
  
  // Images
  image: "https://res.cloudinary.com/...",  // Legacy/main image
  cloudinaryPublicId: "didi-fashion/products/.../main",
  
  // Cloudinary Sync Info
  cloudinary: {
    folder: "didi-fashion/products/507f1f77bcf86cd799439011",
    images: {
      main: {
        publicId: "didi-fashion/products/.../main",
        url: "https://res.cloudinary.com/...",
        uploadedAt: ISODate("2024-01-09T...")
      },
      alt1: { ... },
      thumbnail: { ... },
      // ... other image types
    },
    uploadedAt: ISODate("2024-01-09T..."),
    totalImages: 5,
    lastSync: ISODate("2024-01-09T...")
  },
  
  // Stock & Availability
  stock: 50,
  inStock: true,
  
  // Variants
  size: ["XS", "S", "M", "L", "XL"],
  color: ["Black", "Red", "Blue"],
  
  // Product Info
  isNew: true,
  isSale: false,
  isFeatured: true,
  rating: 4.5,
  sold: 12,
  reviews: [ObjectId, ...],
  
  // Metadata
  isActive: true,
  createdAt: ISODate("2024-01-09T..."),
  updatedAt: ISODate("2024-01-09T...")
}
```

---

## Cloudinary Folder Structure

```
didi-fashion/                                    (Root folder)
├── products/                                   (All product images)
│   ├── 507f1f77bcf86cd799439011/              (Product ID folder)
│   │   ├── main                                (Primary image)
│   │   ├── alt1                                (Alternate view 1)
│   │   ├── alt2                                (Alternate view 2)
│   │   ├── alt3                                (Alternate view 3)
│   │   ├── thumbnail                           (Thumbnail version)
│   │   └── swatch                              (Color swatch)
│   ├── 507f1f77bcf86cd799439012/
│   │   ├── main
│   │   └── ...
│   └── ...
├── collections/                                (Collection banners)
├── banners/                                    (Promotional banners)
├── reviews/                                    (Customer review images)
└── admin/                                      (Admin uploads)
```

---

## Sync Workflow

### Automatic Sync (On Every Product Operation)

```
1. Create Product
   ├── Generate productId
   ├── Create in MongoDB with productId
   ├── Create cloudinary.folder entry
   └── ✅ Sync complete

2. Upload Image
   ├── Upload to Cloudinary (didi-fashion/products/{productId}/{imageType})
   ├── Get public ID and URL
   ├── Update MongoDB cloudinary.images
   └── ✅ Sync complete

3. Delete Product
   ├── Delete all images from Cloudinary folder
   ├── Delete folder from Cloudinary
   ├── Delete from MongoDB
   └── ✅ Sync complete
```

### Manual Sync (On Demand)

```bash
# Check all systems
GET /api/sync/health

# Sync single product
POST /api/sync/product/{productId}

# Sync all products
POST /api/sync/products/all

# Detect and fix issues
POST /api/sync/fix-issues

# Generate report
GET /api/sync/report

# Cleanup
POST /api/sync/cleanup
```

---

## Troubleshooting

### Problem: "Cloudinary connection failed"
```bash
# Check credentials
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET

# Test connection
curl -X GET /api/sync/health
```

### Problem: "productId mismatch"
```bash
# Run fix-issues endpoint
POST /api/sync/fix-issues

# Check report
GET /api/sync/report
```

### Problem: "Orphaned images in Cloudinary"
```bash
# Run cleanup
POST /api/sync/cleanup

# This removes DB references to deleted Cloudinary images
```

### Problem: "Cart/Wishlist has invalid items"
```bash
# Check which items are orphaned
GET /api/sync/verify/cart
GET /api/sync/verify/wishlist

# Manually review and remove from cart/wishlist frontend
```

---

## Benefits of This System

✅ **Single Product ID** - Same ID in MongoDB and Cloudinary  
✅ **Automatic Organization** - Cloudinary folders auto-created by productId  
✅ **Image Variants** - Auto-generated optimized URLs for different sizes  
✅ **Sync Detection** - Automatically detects inconsistencies  
✅ **Auto-Fix** - Most issues fixed automatically  
✅ **Comprehensive Reports** - Full visibility into system health  
✅ **Data Integrity** - Prevents orphaned data  
✅ **Scalable** - Works for any number of products  
✅ **Audit Trail** - All syncs logged with timestamps  

---

## Next Steps

1. Test the sync system: `GET /api/sync/health`
2. Generate a report: `GET /api/sync/report`
3. Fix any existing issues: `POST /api/sync/fix-issues`
4. Monitor regularly with `/api/sync/report`

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
