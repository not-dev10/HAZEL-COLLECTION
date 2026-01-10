import { uploadImageFromUrl } from '../src/utils/imageUpload.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🎨 Uploading key product images to Cloudinary...');

// Key product images with proper naming
const productImages = [
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
    name: 'embroidered-silk-ensemble',
    category: 'Ready to Wear'
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
    name: 'velvet-bridal-collection',
    category: 'Bridal'
  },
  {
    url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
    name: 'cotton-lawn-three-piece',
    category: 'Pret'
  },
  {
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    name: 'festive-formal-wear',
    category: 'Ready to Wear'
  },
  {
    url: 'https://images.unsplash.com/photo-1539008588435-666d1b6e504c?w=400',
    name: 'luxury-pret-collection',
    category: 'Pret'
  }
];

const uploadProducts = async () => {
  const results = [];
  
  console.log(`📸 Uploading ${productImages.length} product images...\n`);
  
  for (let i = 0; i < productImages.length; i++) {
    const product = productImages[i];
    console.log(`📤 Uploading ${i + 1}/${productImages.length}: ${product.name}`);
    console.log(`🏷️  Category: ${product.category}`);
    console.log(`🔗 Source: ${product.url}`);
    
    try {
      const result = await uploadImageFromUrl(
        product.url, 
        'hezal-couture/products', 
        product.name
      );
      
      if (result.success) {
        console.log(`✅ Success: ${result.url}`);
        results.push({
          name: product.name,
          category: product.category,
          originalUrl: product.url,
          cloudinaryUrl: result.url,
          publicId: result.publicId,
        });
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('🎉 Product image upload completed!');
  console.log(`✅ Successfully uploaded: ${results.filter(r => r.cloudinaryUrl).length}`);
  console.log(`❌ Failed uploads: ${productImages.length - results.filter(r => r.cloudinaryUrl).length}`);
  
  console.log('\n📋 Cloudinary URLs for your products:');
  results.forEach((result, index) => {
    if (result.cloudinaryUrl) {
      console.log(`${index + 1}. ${result.name}: ${result.cloudinaryUrl}`);
    }
  });
  
  console.log('\n🔧 Frontend Integration:');
  console.log('Add these to your frontend/src/lib/cloudinary.ts CLOUDINARY_IMAGES object:');
  results.forEach((result) => {
    if (result.cloudinaryUrl) {
      const constantName = result.name.toUpperCase().replace(/-/g, '_');
      console.log(`  ${constantName}: '${result.publicId}',`);
    }
  });
  
  return results;
};

uploadProducts().catch(console.error);