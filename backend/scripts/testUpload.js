import { uploadImageFromUrl } from '../src/utils/imageUpload.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Cloudinary upload with sample images...');

// Test with a few reliable sample images
const testImages = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
];

const testUpload = async () => {
  const results = [];
  
  for (let i = 0; i < testImages.length; i++) {
    const imageUrl = testImages[i];
    console.log(`\n📤 Testing upload ${i + 1}/${testImages.length}`);
    console.log(`🔗 Source: ${imageUrl}`);
    
    try {
      const result = await uploadImageFromUrl(
        imageUrl, 
        'hezal-couture/products', 
        `test-product-${i + 1}`
      );
      
      if (result.success) {
        console.log(`✅ Success: ${result.url}`);
        results.push({
          originalUrl: imageUrl,
          cloudinaryUrl: result.url,
          publicId: result.publicId,
        });
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Test completed!');
  console.log('✅ Successful uploads:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.cloudinaryUrl}`);
  });
  
  return results;
};

testUpload().catch(console.error);