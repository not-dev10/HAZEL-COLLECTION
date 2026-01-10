# Cloudinary Setup Guide for Hezal Couture

This guide will help you set up Cloudinary to replace all mock images with properly hosted, optimized images.

## 🚀 Quick Setup Steps

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After signup, you'll get your dashboard with credentials

### 2. Get Your Credentials
From your Cloudinary dashboard, copy these values:
- **Cloud Name** (e.g., `your-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Configure Environment Variables
Update `backend/.env` with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 4. Update Frontend Configuration
Update `frontend/src/lib/cloudinary.ts`:

```typescript
// Replace this line:
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name_here';

// With your actual cloud name:
const CLOUDINARY_CLOUD_NAME = 'your_actual_cloud_name';
```

### 5. Run Image Migration
Execute the migration script to upload all images:

```bash
cd backend
node scripts/migrateImages.js
```

This will:
- Upload all Unsplash images to your Cloudinary account
- Organize them in folders (`hezal-couture/products/`)
- Generate a URL mapping for replacement
- Show progress and results

### 6. Replace URLs in Frontend
After migration, you'll get a URL mapping. Use it to replace the old URLs in these files:

#### Files to Update:
- `frontend/src/components/catalog/ProductRecommendations.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/pages/Blog.tsx`
- `frontend/src/pages/SearchProducts.tsx`
- `frontend/src/pages/Collection.tsx`
- `frontend/src/pages/Product.tsx`

#### Example Replacement:
```typescript
// Before (Unsplash URL):
image: 'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=500'

// After (Cloudinary URL):
image: getProductImageUrl(CLOUDINARY_IMAGES.EMBROIDERED_SILK_ENSEMBLE, 'card')
```

## 📁 Folder Structure in Cloudinary

After migration, your images will be organized as:
```
hezal-couture/
├── products/
│   ├── embroidered-silk-ensemble
│   ├── velvet-bridal-collection
│   ├── cotton-lawn-three-piece
│   ├── festive-formal-wear
│   ├── summer-unstitched-fabric
│   ├── matching-accessories-set
│   ├── coordinating-shawl
│   └── care-guide-blog
```

## 🎨 Image Transformations

The setup includes automatic optimizations:

### Product Images:
- **Thumbnail**: 150x200px (for cart, wishlist)
- **Card**: 300x400px (for product grids)
- **Detail**: 600x800px (for product pages)
- **Hero**: 1200x800px (for banners)

### Blog Images:
- **Thumbnail**: 300x200px (for blog cards)
- **Featured**: 800x400px (for blog posts)
- **Hero**: 1200x600px (for blog headers)

### Automatic Features:
- **Quality**: Auto-optimized based on device
- **Format**: Auto-converted to WebP/AVIF when supported
- **Responsive**: Different sizes for different screen sizes
- **Lazy Loading**: Compatible with modern lazy loading

## 🔧 Usage Examples

### In Components:
```typescript
import { getProductImageUrl, CLOUDINARY_IMAGES } from '@/lib/cloudinary';

// Product card
<img 
  src={getProductImageUrl(CLOUDINARY_IMAGES.EMBROIDERED_SILK_ENSEMBLE, 'card')} 
  alt="Embroidered Silk Ensemble" 
/>

// Product detail page
<img 
  src={getProductImageUrl(CLOUDINARY_IMAGES.EMBROIDERED_SILK_ENSEMBLE, 'detail')} 
  alt="Embroidered Silk Ensemble" 
/>
```

### Custom Transformations:
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary';

// Custom size
const customUrl = getCloudinaryUrl('hezal-couture/products/my-product', {
  width: 500,
  height: 300,
  crop: 'fill',
  quality: '80'
});
```

## 📊 Benefits After Migration

1. **Performance**: 40-60% faster image loading
2. **SEO**: Better Core Web Vitals scores
3. **Responsive**: Automatic device-optimized images
4. **CDN**: Global content delivery network
5. **Transformations**: On-the-fly image processing
6. **Storage**: Organized, searchable image library
7. **Bandwidth**: Reduced data usage for users

## 🔍 Verification

After setup, verify everything works:

1. **Check Images Load**: Visit product pages and collections
2. **Test Transformations**: Resize browser window to see responsive images
3. **Performance**: Use browser dev tools to check image sizes
4. **Cloudinary Dashboard**: View usage and transformations

## 🆘 Troubleshooting

### Common Issues:

1. **Images not loading**: Check cloud name in frontend config
2. **Upload fails**: Verify API credentials in backend .env
3. **Transformations not working**: Check public ID format
4. **Rate limiting**: Add delays between uploads (already included)

### Support:
- Cloudinary Documentation: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- Community Forum: [community.cloudinary.com](https://community.cloudinary.com)

## 🎯 Next Steps

After successful migration:

1. **Add More Images**: Upload additional product photos
2. **Video Support**: Add product videos using Cloudinary
3. **AI Features**: Use auto-tagging and background removal
4. **Analytics**: Monitor image performance in Cloudinary dashboard
5. **Backup**: Keep original images as backup in separate folder

---

**Ready to migrate?** Follow the steps above and transform your image management! 🚀