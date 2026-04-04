# Cloudinary to AWS S3 Migration Plan

**Status**: Plan Only (Not Implemented)  
**Created**: April 2, 2026  
**Scope**: Complete migration from Cloudinary to AWS S3 for image storage and delivery

---

## Executive Summary

The HAZEL-COLLECTION currently uses **Cloudinary** for all image uploads, transformations, and delivery. This plan outlines a complete migration to **AWS S3** with **CloudFront** CDN for image delivery. The Switch would reduce costs for high-volume image operations while maintaining performance.

### Key Benefits
- **Cost Reduction**: $0-15/month (S3) vs Cloudinary paid tiers
- **Scalability**: Unlimited storage and bandwidth with S3
- **Control**: Full control over image processing pipeline
- **Integration**: Native AWS services (EC2, Lambda, CloudFront)

### Trade-offs
- **Loss**: Cloudinary's auto-optimization (quality, format, dimensions)
- **Effort**: Need to implement image resizing/transformation with Sharp or ImageMagick
- **Complexity**: Manage CDN cache invalidation, CORS, and lifecycle policies

---

## Current Cloudinary Architecture

### Files Dependent on Cloudinary

| File | Lines | Purpose | Complexity |
|------|-------|---------|-----------|
| `backend/src/config/cloudinary.js` | ~30 | Configuration & initialization | LOW |
| `backend/src/services/cloudinary.service.js` | ~200 | Main service for uploads & transformations | HIGH |
| `backend/src/utils/cloudinarySync.js` | ~150 | Product migration utilities | HIGH |
| `backend/src/utils/imageUpload.js` | ~100 | Image upload helpers | MEDIUM |
| `backend/src/utils/cloudinaryRateLimiter.js` | ~50 | Rate limiting | LOW |
| `backend/src/controllers/cloudinary.controller.js` | ~200 | Admin endpoints | HIGH |
| `backend/src/controllers/imageUpload.controller.js` | ~150 | Upload handlers | HIGH |
| `backend/src/routes/cloudinary.routes.js` | ~40 | Cloudinary API routes | MEDIUM |
| `backend/src/routes/imageUpload.routes.js` | ~30 | Upload routes | MEDIUM |
| `backend/src/models/Product.js` | ~20 | Product model (has cloudinary object) | LOW |
| `backend/src/controllers/product.controller.js` | ~10 | Uses generateProductImageVariants | LOW |
| `backend/src/app.js` | ~5 | Config initialization | LOW |
| `backend/scripts/migrateProductImages.js` | ~100 | Migration script | HIGH |
| `backend/scripts/diagnoseProducts.js` | ~80 | Diagnostic tool | MEDIUM |
| Frontend: `index.html` | 1 line | Meta tag with logo reference | LOW |
| `.env.docker.example` | 3 lines | Environment variables | LOW |
| `package.json` | 1 line | `cloudinary` dependency | LOW |

**Total Lines to Modify**: ~1,165 lines of code

### Environment Variables Currently Used

```
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

### Current API Routes

```
GET    /api/cloudinary/status
POST   /api/cloudinary/migrate
POST   /api/cloudinary/seed
POST   /api/cloudinary/upload-image
GET    /api/cloudinary/image-variants/:productId
GET    /api/upload/signature
POST   /api/upload/upload-images
POST   /api/upload/delete-image
POST   /api/upload/upload-size-reference
POST   /api/upload/upload-homepage-image
```

---

## Migration Architecture

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 AWS S3 Configuration

**Create S3 Bucket:**
```
Bucket Name: hazel-collection-images
Region: us-east-1 (same as other AWS services)
Versioning: Enabled (for rollback)
ACL: Private (all files private, CloudFront only)
```

**Tags:**
```
Environment: production
Application: hazel-collection
Purpose: product-images
```

**Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hazel-collection-images/*"
    },
    {
      "Sid": "BackendUploadAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/EC2-Backend-Role"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::hazel-collection-images/*"
    }
  ]
}
```

**Lifecycle Policy:**
```
- Transition to Glacier after 90 days (for old/archived images)
- Expire incomplete multipart uploads after 7 days
```

#### 1.2 CloudFront Distribution

**Create Distribution:**
```
Origin: S3 bucket (hazel-collection-images)
Origin Access Identity: Enable (restrict S3 access)
Domain Alias: images.hezalcollection.com
SSL Certificate: AWS Certificate Manager (free)
Compression: Enable (for WebP/JPEG)
Cache TTL: 
  - Default: 86400 (24 hours)
  - Max: 31536000 (1 year for versioned images)
```

**Cache Behaviors:**
```
Path Pattern: /products/*
  TTL: 604800 (7 days)
  Compress: Yes
  
Path Pattern: /uploads/*
  TTL: 86400 (24 hours)
  Compress: Yes
```

#### 1.3 IAM Roles & Credentials

**Create EC2 Backend Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::hazel-collection-images",
        "arn:aws:s3:::hazel-collection-images/*"
      ]
    }
  ]
}
```

**Store Access Keys Securely:**
```
AWS_ACCESS_KEY_ID (in .env)
AWS_SECRET_ACCESS_KEY (in .env or AWS Secrets Manager)
AWS_REGION=us-east-1
S3_BUCKET_NAME=hazel-collection-images
CLOUDFRONT_DOMAIN=images.hezalcollection.com
```

---

### Phase 2: Backend Service Refactoring (Week 2-3)

#### 2.1 Create S3 Service

**New File**: `backend/src/services/s3.service.js`

```typescript
import AWS from 'aws-sdk';
import sharp from 'sharp';

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucket = process.env.S3_BUCKET_NAME;
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  }

  // Core Methods to Implement
  async uploadImage(file, folder, imageName) {}
  async uploadImageFromUrl(imageUrl, folder, productId) {}
  async deleteImage(s3Key) {}
  async deleteFolder(folder) {}
  async generateImageVariants(s3Key, transformations) {}
  async getSignedUrl(s3Key, expiresIn = 3600) {}
  async listImages(folder) {}
  async copyImage(sourcePath, destPath) {}
  async batch_uploadImages(files, folder) {}
  async generateThumbnail(file, dimensions) {}
  async getImageMetadata(s3Key) {}
}
```

#### 2.2 Create Image Processing Pipeline

**New File**: `backend/src/utils/imageProcessor.js`

```typescript
import sharp from 'sharp';

class ImageProcessor {
  // Define image variants needed (currently from Cloudinary)
  static VARIANTS = {
    main: { width: 1000, height: 1000, quality: 85 },
    alt1: { width: 1000, height: 1000, quality: 85 },
    alt2: { width: 1000, height: 1000, quality: 85 },
    alt3: { width: 1000, height: 1000, quality: 85 },
    thumbnail: { width: 300, height: 300, quality: 80 },
    swatch: { width: 100, height: 100, quality: 75 },
    mobile: { width: 600, height: 600, quality: 80 }
  };

  // Methods to Implement
  async resizeImage(imageBuffer, width, height, quality) {}
  async convertToWebP(imageBuffer, quality) {}
  async generateVariants(imageBuffer) {}
  async createThumbnail(imageBuffer) {}
  async compressImage(imageBuffer, quality) {}
  async optimizeForWeb(imagePath) {}
}
```

#### 2.3 Create S3 Config

**New File**: `backend/src/config/s3.js`

```javascript
import AWS from 'aws-sdk';

export const initializeS3 = () => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  const s3 = new AWS.S3();
  
  // Verify bucket exists
  s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }, (err) => {
    if (err) {
      console.error('S3 bucket not accessible:', err);
    } else {
      console.log('✓ S3 bucket connected');
    }
  });

  return s3;
};
```

#### 2.4 Update Controllers

**File to Modify**: `backend/src/controllers/imageUpload.controller.js`

```javascript
// Replace all Cloudinary calls with S3Service
// Change signature generation from direct Cloudinary API
// to S3 presigned URLs

// Old: getCloudinarySignature()
// New: getS3PresignedUrl()

// Old: uploadProductImages(files) -> cloudinary.uploader.upload
// New: uploadProductImages(files) -> S3Service.uploadImage()

// Old: deleteProductImage() -> cloudinary.uploader.destroy
// New: deleteProductImage() -> S3Service.deleteImage()
```

#### 2.5 Update Models

**File to Modify**: `backend/src/models/Product.js`

```javascript
// Replace cloudinary object structure:
// FROM:
cloudinary: {
  folder: 'didi-fashion/products/{productId}',
  images: { main, alt1, alt2, alt3, thumbnail, swatch },
  uploadedAt: null,
  totalImages: 0
}

// TO:
s3: {
  bucket: 'hazel-collection-images',
  folder: 'products/{productId}',
  images: { 
    main: 's3://bucket/products/{id}/main.webp',
    alt1: 's3://bucket/products/{id}/alt1.webp',
    ...
  },
  cdnUrls: {
    main: 'https://images.hezalcollection.com/products/{id}/main.webp',
    ...
  },
  uploadedAt: null,
  totalImages: 0
}
```

---

### Phase 3: Frontend Image URL Updates (Week 2-3)

#### 3.1 Update Image URL Generation

**File to Modify**: `frontend/src/lib/cloudinary.js`

```typescript
// Replace Cloudinary image transformation logic
// Change from: 
// https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_{width}/v{version}/{public_id}

// Change to S3/CloudFront URLs:
// https://images.hezalcollection.com/products/{productId}/{variant}.webp

export const getProductImageUrl = (productId, variant = 'main') => {
  const domain = process.env.VITE_CDN_DOMAIN || 'https://images.hezalcollection.com';
  return `${domain}/products/${productId}/${variant}.webp`;
};

export const getSignedImageUrl = (s3Key, expiresIn = 3600) => {
  // For private images, use presigned URLs
  return fetch(`/api/images/signed-url?key=${s3Key}`).then(r => r.json());
};
```

#### 3.2 Update Image Components

**Files to Update:**
- `ProductCard.tsx` - Uses image URLs
- `ImageGallery.tsx` - Product detail images
- `HomePage.tsx` - Banner images
- Any other `<img>` tags with Cloudinary URLs

---

### Phase 4: Migration Data & Testing (Week 3-4)

#### 4.1 Create Migration Utility

**New File**: `backend/scripts/migrateCloudinaryToS3.js`

```javascript
// Batch migrate all Cloudinary images to S3
// For each product:
//   1. Download image from Cloudinary
//   2. Process with Sharp (generate variants)
//   3. Upload to S3
//   4. Update Product.s3 field with new URLs
//   5. Keep cloudinary field as backup (set disable flag)

const migrateCloudinaryToS3 = async () => {
  const products = await Product.findAll();
  const s3Service = new S3Service();
  
  for (const product of products) {
    if (product.cloudinaryPublicId) {
      // Download from Cloudinary
      const imageBuffer = await downloadFromCloudinary(product.cloudinaryPublicId);
      
      // Process variants
      const variants = await ImageProcessor.generateVariants(imageBuffer);
      
      // Upload to S3
      const uploadResults = await Promise.all([
        s3Service.uploadImage(variants.main, `products/${product.id}`, 'main.webp'),
        s3Service.uploadImage(variants.thumbnail, `products/${product.id}`, 'thumbnail.webp'),
        // ... other variants
      ]);
      
      // Update product
      await Product.update(product.id, {
        s3: {
          bucket: process.env.S3_BUCKET_NAME,
          folder: `products/${product.id}`,
          images: uploadResults,
          uploadedAt: new Date()
        },
        // Keep Cloudinary reference but mark as archived
        cloudinary: { ...product.cloudinary, archived: true }
      });
    }
  }
};
```

#### 4.2 Testing Strategy

**Test Cases:**
1. Single image upload to S3
2. Batch image upload (5+ files)
3. Image variant generation (all 6 variants)
4. Delete image from S3
5. CloudFront cache hit/miss
6. Presigned URL generation
7. URL expiration handling
8. Invalid image format handling
9. Oversized image handling (>50MB)
10. Concurrent uploads (verify rate limiting)

**Load Testing:**
```
- 100 concurrent image uploads
- 1000 product images on homepage (CloudFront cache test)
- Image transformation latency (vs Cloudinary)
```

---

### Phase 5: Cleanup & Optimization (Week 4)

#### 5.1 Remove Cloudinary Dependencies

**Files to Delete:**
- `backend/src/config/cloudinary.js`
- `backend/src/services/cloudinary.service.js`
- `backend/src/utils/cloudinarySync.js`
- `backend/src/utils/cloudinaryRateLimiter.js`
- `backend/src/routes/cloudinary.routes.js`
- `backend/src/controllers/cloudinary.controller.js`
- `backend/scripts/diagnoseProducts.js` (Cloudinary-specific)

**Files to Modify:**
- `backend/package.json` - Remove `cloudinary` dependency
- `backend/.env.example` - Update env variables
- `backend/src/app.js` - Remove Cloudinary initialization
- `backend/src/app.js` - Update CORS/CSP for S3 URLs

#### 5.2 Update Documentation

**Files to Update:**
- `README.md` - Update setup instructions
- `DEPLOYMENT.md` - Update deployment steps
- Remove Cloudinary section from architecture docs
- Update API documentation

#### 5.3 Optimize CloudFront Settings

```
- Add Origin Failover (backup S3)
- Add Lambda@Edge for image format negotiation
- Enable HTTP/2
- Set cache headers per file type
- Add IAM restrictions
```

---

## Implementation Dependencies

### New NPM Packages Required

```json
{
  "dependencies": {
    "aws-sdk": "^2.1400.0",      // AWS SDK for S3
    "sharp": "^0.33.0",           // Image processing (critical!)
    "uuid": "^9.0.0"              // File naming
  },
  "devDependencies": {
    "@types/aws-sdk": "^2.7.1"    // TypeScript support
  }
}
```

**Installation Command:**
```bash
npm install aws-sdk sharp uuid
```

### Key Dependencies for Each Phase

| Phase | Package | Reason |
|-------|---------|--------|
| Infrastructure Setup | AWS CLI | Configure S3 and CloudFront |
| Backend Refactoring | sharp | Image resizing/optimization |
| Testing | jest, supertest | Unit & integration tests |
| Migration | aws-sdk | S3 API access |
| Monitoring | CloudWatch | Performance monitoring |

---

## Cost Analysis

### Current Cloudinary Costs
```
Free Tier:
- 25 GB storage (free)
- 25 GB bandwidth (free)
- Unlimited API requests
- 1 GB/month images
- Monthly: $0

Upgrade at scale:
- $99-$399/month for 500GB+ storage
```

### Projected AWS S3 + CloudFront Costs

**Assumptions**: 10,000 products × 5 images each = 50,000 images

```
S3 Storage:
- Average image size: 500 KB
- Total storage: 25 GB
- Cost: $0.58/month (first 50 GB free tier)

S3 API Calls:
- PUT requests (uploads): 50,000 × $0.005 = $250
- GET requests (reads): Negligible with CloudFront caching
- DELETE requests: ~$50/month

CloudFront:
- Data transfer out: ~10 TB/month at $0.085/GB = $850/month
- Requests: ~10M/month at $0.0075/10k = $7.50/month

Total: ~$1,158/month

Optimization with S3 Intelligent-Tiering:
- Add lifecycle policies to reduce costs by 40-60%
- Estimated: $400-600/month with optimization
```

### ROI Analysis

```
Break-even Point: 
- If traffic > 500k requests/month → S3 more expensive
- If traffic < 500k requests/month → Cloudinary free tier better
- Current estimated: 2-5M requests/month → S3 recommended

Recommendation: 
- Continue Cloudinary for < 50GB storage
- Switch to S3 for > 50GB or high request volume
```

---

## Risk Assessment

### High Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Image transformation quality loss | Medium | High | Test Sharp output against Cloudinary |
| CloudFront cache stale content | Low | Medium | Implement cache invalidation API |
| S3 API rate limiting | Low | Medium | Implement backoff & retry logic |
| Migration data loss | Very Low | Critical | Backup all Cloudinary images first |
| URL structure change breaks frontend | Medium | Medium | Implement URL aliasing during transition |

### Medium Risk Items

```
1. Image variant generation latency (Sharp vs Cloudinary)
   - Cloudinary: <100ms per transformation
   - Sharp: 200-500ms per variant set
   - Mitigation: Pre-generate variants on upload, cache aggressively

2. Lambda cold start for custom transformations
   - If using Lambda@Edge: 1-5s first request
   - Mitigation: Keep transformations simple, pre-generate

3. Version control of image transformations
   - Need to track which products use which variants
   - Mitigation: Document variant schema in Product model

4. Rollback complexity
   - Can't easily rollback mid-migration
   - Mitigation: Keep Cloudinary images until 100% migrated
```

---

## Rollback Plan

### If Migration Fails

**Step 1: Detect Failure**
```
- Monitor CloudFront error rate (target: <1%)
- Monitor image load times (target: <500ms)
- Track S3 API errors
```

**Step 2: Immediate Rollback**
```javascript
// Update Product model to use Cloudinary images
if (product.cloudinary && !product.s3) {
  image = generateCloudinaryUrl(product.cloudinaryPublicId);
} else {
  image = generateS3Url(product.s3);
}
```

**Step 3: Revert URL Generation**
```
- Revert imageUrl.js to use Cloudinary transformation logic
- Revert frontend components to use old image URLs
- Re-enable Cloudinary routes
```

**Step 4: Restore Data**
```
- Keep all S3 data (don't delete)
- Restore cloudinary to active field
- Run diagnostics on Products
```

---

## Performance Comparison

### Image Delivery Latency

| Metric | Cloudinary | S3 + CloudFront | Sharp Processing |
|--------|-----------|-----------------|------------------|
| First request | 150-300ms | 200-400ms | +200-500ms |
| Cached request | <50ms | <50ms | N/A |
| Transformation | Inline* | On-upload | On-upload |
| Variants per image | 6 | 6 | 6 |

*Cloudinary transforms on-the-fly, S3 needs pre-generation

### Network Requests Comparison

```
Cloudinary:
1. GET /product/123  (200ms)
2. Download image URL transformation (150ms)
Total: 350ms

S3 + CloudFront Cache:
1. GET /product/123  (200ms)
2. Fetch from CloudFront cache (50ms)
Total: 250ms (if cached)

First request (no cache):
1. GET /product/123  (200ms)
2. S3 → CloudFront → Browser (400ms)
Total: 600ms
```

---

## Timeline & Milestones

### Week 1: Infrastructure
- [ ] Create S3 bucket
- [ ] Configure bucket policies & lifecycle
- [ ] Create CloudFront distribution
- [ ] Setup IAM roles
- [ ] Test S3 connectivity

### Week 2: Backend Refactoring
- [ ] Create S3Service class
- [ ] Create ImageProcessor with Sharp
- [ ] Update controllers
- [ ] Create migration script
- [ ] Unit test S3 operations

### Week 3: Frontend Updates
- [ ] Update image URL generation
- [ ] Update image components
- [ ] Test image loading
- [ ] Setup fallback URLs
- [ ] Frontend unit tests

### Week 4: Migration & Testing
- [ ] Run full migration script
- [ ] Verify all product images migrated
- [ ] Load testing (1000+ concurrent requests)
- [ ] CloudFront cache testing
- [ ] Rollback testing

### Week 5: Optimization & Cleanup
- [ ] Remove Cloudinary code
- [ ] Update documentation
- [ ] Optimize CloudFront
- [ ] Monitor performance
- [ ] Cancel Cloudinary account

**Total Effort**: 4-5 weeks (1 engineer full-time)

---

## Success Criteria

### Must Have
- [ ] All 50,000+ product images migrated to S3
- [ ] Image loading <500ms average latency
- [ ] CloudFront cache hit rate >80%
- [ ] Zero data loss (all images present)
- [ ] All routes working (no 404s)

### Should Have
- [ ] Cost reduced by 50%+ vs Cloudinary paid tier
- [ ] Image quality maintained (no visible degradation)
- [ ] Variant generation automated
- [ ] CloudFront cache invalidation API working

### Nice to Have
- [ ] Lambda@Edge for format negotiation (WebP, AVIF)
- [ ] Monitoring dashboard in CloudWatch
- [ ] Automated image optimization
- [ ] Progressive image loading (LQIP)

---

## Post-Migration Monitoring

### CloudWatch Metrics to Track

```
S3:
- NumberOfObjects
- BucketSizeBytes
- 4xxErrors
- 5xxErrors

CloudFront:
- Requests
- Bytes Downloaded
- Cache Hit Rate
- Origin Latency
- Error Rate
```

### Alerts to Setup

```
- S3 API errors > 10/minute → Alert
- CloudFront origin latency > 2000ms → Alert
- Cache hit rate < 70% → Alert (check TTL)
- Cost spike > 20% → Alert
```

---

## Alternative Approaches (Not Recommended)

### Option 1: Keep Cloudinary + Migrate to S3 Separately
**Pros**: Less risky, phased approach
**Cons**: Double maintenance, higher cost, confusion in codebase

### Option 2: Use AWS CloudFront + Lambda@Edge Only (No S3 Backend)
**Pros**: Reduced complexity
**Cons**: Can't serve static images, only transformations

### Option 3: Use MinIO (S3-compatible)
**Pros**: Self-hosted, no cloud lock-in
**Cons**: Requires separate infrastructure, higher maintenance

---

## Questions Before Starting Implementation

1. **Image Quality**: Is current Cloudinary quality acceptable? Can we match with Sharp?
2. **Performance**: What's acceptable image load latency? Currently ~150ms
3. **Cost**: What's the budget for AWS services?
4. **Timeline**: Can we afford 4-5 weeks of development?
5. **Traffic**: What's expected traffic post-migration?
6. **Storage**: Will images exceed $100/month at any point?
7. **Team**: Will one engineer handle this or need help?
8. **Downtime**: Can we afford brief image service downtime?

---

## References & Resources

### AWS Documentation
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BestPractices.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Pricing Calculator](https://calculator.aws/)

### Image Processing
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Image Optimization Guide](https://web.dev/image-optimization/)

### Migration Tools
- [AWS DataSync](https://aws.amazon.com/datasync/)
- [AWS S3 Batch Operations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops.html)

---

## Conclusion

Migrating from Cloudinary to AWS S3 is **feasible but requires careful planning**. The main benefits are:
- **Cost savings** (if high traffic)
- **Full control** over image pipeline
- **Scalability** for unlimited storage

The main challenges are:
- **Image processing** complexity (need Sharp)
- **Performance** parity (transformation latency)
- **Maintenance burden** (manage transformations ourselves)

**Recommendation**: Execute this migration **only if**:
1. Image storage > 50GB
2. Monthly requests > 1 million
3. Team has capacity for 4-5 weeks
4. Cost is critical factor
5. Ready to maintain custom image pipeline

Otherwise, **stick with Cloudinary** for its simplicity and automatic optimization.
