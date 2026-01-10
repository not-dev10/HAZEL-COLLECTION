import { uploadMultipleImages, uploadImageFromUrl } from '../src/utils/imageUpload.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Migration script starting...');

// All the Unsplash URLs found in the frontend
const unsplashImages = [
  // From ProductRecommendations.tsx
  'https://images.unsplash.com/photo-1552821206-7debf432f9a0?w=500',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
  'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=500',
  'https://images.unsplash.com/photo-1519167758993-dfa06a37fdf3?w=500',
  
  // From Header.tsx (search products)
  'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=400',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
  'https://images.unsplash.com/photo-1539008588435-666d1b6e504c?w=400',
  'https://images.unsplash.com/photo-1552821206-7debf432f9a0?w=400',
  
  // From Blog.tsx
  'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=800',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
  
  // From SearchProducts.tsx
  'https://images.unsplash.com/photo-1595777707802-78f6cf076e91?w=500',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500',
  'https://images.unsplash.com/photo-1539008588435-666d1b6e504c?w=500',
  'https://images.unsplash.com/photo-1552821206-7debf432f9a0?w=500',
];

// Remove duplicates
const uniqueImages = [...new Set(unsplashImages)];

// Create a mapping for better organization
const imageMapping = {
  // Product categories
  'photo-1595777707802-78f6cf076e91': 'embroidered-silk-ensemble',
  'photo-1558769132-cb1aea458c5e': 'velvet-bridal-collection', 
  'photo-1591195853828-11db59a44f6b': 'cotton-lawn-three-piece',
  'photo-1539008588435-666d1b6e504c': 'festive-formal-wear',
  'photo-1552821206-7debf432f9a0': 'summer-unstitched-fabric',
  'photo-1599643478518-a784e5dc4c8f': 'matching-accessories-set',
  'photo-1519167758993-dfa06a37fdf3': 'coordinating-shawl',
  'photo-1594938298603-c8148c4dae35': 'care-guide-blog',
};

const migrateImages = async () => {
  console.log('🚀 Starting image migration to Cloudinary...');
  console.log('📋 Cloudinary Config:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗'}`);
  console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗'}`);
  console.log(`📸 Found ${uniqueImages.length} unique images to migrate\n`);
  
  const results = [];
  
  for (let i = 0; i < uniqueImages.length; i++) {
    const imageUrl = uniqueImages[i];
    console.log(`\n📤 Uploading image ${i + 1}/${uniqueImages.length}`);
    console.log(`🔗 Source: ${imageUrl}`);
    
    // Extract photo ID from Unsplash URL for better naming
    const photoIdMatch = imageUrl.match(/photo-([a-zA-Z0-9_-]+)/);
    const photoId = photoIdMatch ? photoIdMatch[1] : `image_${i + 1}`;
    const mappedName = imageMapping[photoId] || photoId;
    
    try {
      const result = await uploadImageFromUrl(
        imageUrl, 
        'hezal-couture/products', 
        mappedName
      );
      
      if (result.success) {
        console.log(`✅ Success: ${result.url}`);
        results.push({
          originalUrl: imageUrl,
          cloudinaryUrl: result.url,
          publicId: result.publicId,
          success: true,
        });
      } else {
        console.log(`❌ Failed: ${result.error}`);
        results.push({
          originalUrl: imageUrl,
          error: result.error,
          success: false,
        });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        originalUrl: imageUrl,
        error: error.message,
        success: false,
      });
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate URL mapping for easy replacement
  const urlMapping = {};
  results.forEach(result => {
    if (result.success) {
      urlMapping[result.originalUrl] = result.cloudinaryUrl;
    }
  });
  
  console.log('\n🎉 Migration completed!');
  console.log(`✅ Successfully uploaded: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed uploads: ${results.filter(r => !r.success).length}`);
  
  console.log('\n📋 URL Mapping for replacement:');
  console.log(JSON.stringify(urlMapping, null, 2));
  
  return { results, urlMapping };
};

// Run migration if called directly
console.log('🎯 Checking if script is main module...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

migrateImages().catch(console.error);

export { migrateImages };