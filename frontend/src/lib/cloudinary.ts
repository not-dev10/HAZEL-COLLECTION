// Cloudinary configuration and utilities for frontend

// Your Cloudinary cloud name (this is public and safe to expose)
const CLOUDINARY_CLOUD_NAME = 'dknwcmcki';

/**
 * Generate Cloudinary URL with transformations
 * @param publicId - The public ID of the image in Cloudinary
 * @param transformations - Optional transformations object
 * @returns Optimized Cloudinary URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    [key: string]: any;
  } = {}
): string => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  // Default transformations for optimization
  const defaultTransforms = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  };
  
  // Build transformation string
  const transformString = Object.entries(defaultTransforms)
    .map(([key, value]) => {
      // Convert camelCase to snake_case for Cloudinary
      const cloudinaryKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${cloudinaryKey}_${value}`;
    })
    .join(',');
  
  return `${baseUrl}/${transformString}/${publicId}`;
};

/**
 * Get responsive image URLs for different screen sizes
 * @param publicId - The public ID of the image in Cloudinary
 * @returns Object with URLs for different breakpoints
 */
export const getResponsiveImageUrls = (publicId: string) => {
  return {
    mobile: getCloudinaryUrl(publicId, { width: 400, crop: 'fill' }),
    tablet: getCloudinaryUrl(publicId, { width: 768, crop: 'fill' }),
    desktop: getCloudinaryUrl(publicId, { width: 1200, crop: 'fill' }),
    thumbnail: getCloudinaryUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    original: getCloudinaryUrl(publicId),
  };
};

/**
 * Product image transformations
 */
export const getProductImageUrl = (
  publicId: string,
  size: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card'
) => {
  const transformations = {
    thumbnail: { width: 150, height: 200, crop: 'fill' },
    card: { width: 300, height: 400, crop: 'fill' },
    detail: { width: 600, height: 800, crop: 'fill' },
    hero: { width: 1200, height: 800, crop: 'fill' },
  };
  
  return getCloudinaryUrl(publicId, transformations[size]);
};

/**
 * Blog image transformations
 */
export const getBlogImageUrl = (
  publicId: string,
  size: 'thumbnail' | 'featured' | 'hero' = 'featured'
) => {
  const transformations = {
    thumbnail: { width: 300, height: 200, crop: 'fill' },
    featured: { width: 800, height: 400, crop: 'fill' },
    hero: { width: 1200, height: 600, crop: 'fill' },
  };
  
  return getCloudinaryUrl(publicId, transformations[size]);
};

/**
 * Get asset image URL with fallback support
 * This is used for testing with Cloudinary assets folder
 * If admin panel provides an image, it will override this
 * @param assetKey - Key from CLOUDINARY_IMAGES.ASSET_* constants
 * @param size - Image size preset ('thumbnail' | 'card' | 'detail' | 'hero')
 * @param adminProvidedUrl - Optional URL from admin panel (takes precedence)
 * @returns Cloudinary URL or admin-provided URL
 */
export const getAssetImageUrl = (
  assetKey: string,
  size: 'thumbnail' | 'card' | 'detail' | 'hero' = 'card',
  adminProvidedUrl?: string
): string => {
  // If admin panel provided a URL, use it (don't override admin logic)
  if (adminProvidedUrl) {
    return adminProvidedUrl;
  }
  
  // Otherwise use the asset from Cloudinary
  return getProductImageUrl(assetKey, size);
};

// Cloudinary public IDs mapping (populated after migration)
export const CLOUDINARY_IMAGES = {
  // Products - Successfully uploaded
  EMBROIDERED_SILK_ENSEMBLE: 'hezal-couture/products/embroidered-silk-ensemble',
  VELVET_BRIDAL_COLLECTION: 'hezal-couture/products/velvet-bridal-collection',
  COTTON_LAWN_THREE_PIECE: 'hezal-couture/products/cotton-lawn-three-piece',
  FESTIVE_FORMAL_WEAR: 'hezal-couture/products/festive-formal-wear',
  
  // Test images (can be used for other products)
  TEST_PRODUCT_1: 'hezal-couture/products/test-product-1',
  TEST_PRODUCT_2: 'hezal-couture/products/test-product-2',
  TEST_PRODUCT_3: 'hezal-couture/products/test-product-3',
  
  // ===== SLIDER/CAROUSEL IMAGES =====
  SLIDER_IMAGE_1: 'didi-monorepo/hero',
  SLIDER_IMAGE_2: 'didi-monorepo/hero',
  SLIDER_IMAGE_3: 'didi-monorepo/hero',
  
  // Bridal Section Image
  BRIDAL_SECTION_IMAGE: 'hezal-couture/products/velvet-bridal-collection',
  
  // Collection Banner Images
  COLLECTION_BANNER_1: 'didi-monorepo/collection',
  COLLECTION_BANNER_2: 'didi-monorepo/collection',
  
  // ===== ASSETS FOLDER - Location-specific images =====
  
  // Hero Assets
  HERO_BRIDAL: 'hezal-couture/products/velvet-bridal-collection',
  HERO_COLLECTION: 'hezal-couture/products/embroidered-silk-ensemble',
  HERO_UNSTITCHED: 'hezal-couture/products/cotton-lawn-three-piece',
  HERO_FESTIVE: 'hezal-couture/products/festive-formal-wear',
  
  // Collection Assets
  COLLECTION_RTW: 'hezal-couture/products/embroidered-silk-ensemble',
  COLLECTION_UNSTITCHED: 'hezal-couture/products/cotton-lawn-three-piece',
  COLLECTION_BRIDAL: 'hezal-couture/products/velvet-bridal-collection',
  COLLECTION_FESTIVE: 'hezal-couture/products/festive-formal-wear',
  
  // Editorial Assets
  EDITORIAL_BRIDAL: 'hezal-couture/products/velvet-bridal-collection',
  EDITORIAL_COLLECTION: 'hezal-couture/products/embroidered-silk-ensemble',
  EDITORIAL_UNSTITCHED: 'hezal-couture/products/cotton-lawn-three-piece',
  
  // Product Grid Assets (use real product images - rotate through what we have)
  PRODUCT_GRID_1: 'hezal-couture/products/embroidered-silk-ensemble',
  PRODUCT_GRID_2: 'hezal-couture/products/velvet-bridal-collection',
  PRODUCT_GRID_3: 'hezal-couture/products/cotton-lawn-three-piece',
  PRODUCT_GRID_4: 'hezal-couture/products/festive-formal-wear',
  PRODUCT_GRID_5: 'hezal-couture/products/test-product-1',
  PRODUCT_GRID_6: 'hezal-couture/products/test-product-2',
  PRODUCT_GRID_7: 'hezal-couture/products/test-product-3',
  PRODUCT_GRID_8: 'hezal-couture/products/embroidered-silk-ensemble',
  
  // Product Recommendations Assets (use real product images)
  RECOMMENDATION_1: 'hezal-couture/products/embroidered-silk-ensemble',
  RECOMMENDATION_2: 'hezal-couture/products/velvet-bridal-collection',
  RECOMMENDATION_3: 'hezal-couture/products/cotton-lawn-three-piece',
  RECOMMENDATION_4: 'hezal-couture/products/festive-formal-wear',
  
  // Blog Assets (use product images as blog featured images)
  BLOG_FEATURED_1: 'hezal-couture/products/embroidered-silk-ensemble',
  BLOG_FEATURED_2: 'hezal-couture/products/velvet-bridal-collection',
  BLOG_FEATURED_3: 'hezal-couture/products/cotton-lawn-three-piece',
  BLOG_FEATURED_4: 'hezal-couture/products/festive-formal-wear',
};