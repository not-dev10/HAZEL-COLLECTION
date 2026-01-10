import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🎨 Uploading placeholder images to Cloudinary...\n');

// Images to upload with their exact public IDs
const imagesToUpload = [
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
    publicId: 'hezal-couture/products/embroidered-silk-ensemble',
    name: 'Embroidered Silk Ensemble'
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=800&fit=crop',
    publicId: 'hezal-couture/products/velvet-bridal-collection',
    name: 'Velvet Bridal Collection'
  },
  {
    url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop',
    publicId: 'hezal-couture/products/cotton-lawn-three-piece',
    name: 'Cotton Lawn Three Piece'
  },
  {
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
    publicId: 'hezal-couture/products/festive-formal-wear',
    name: 'Festive Formal Wear'
  }
];

const uploadImages = async () => {
  let successCount = 0;
  let failCount = 0;

  for (const image of imagesToUpload) {
    try {
      console.log(`📤 Uploading: ${image.name}`);
      console.log(`   Public ID: ${image.publicId}`);
      console.log(`   Source: ${image.url.substring(0, 50)}...`);

      const result = await cloudinary.v2.uploader.upload(image.url, {
        public_id: image.publicId,
        folder: 'hezal-couture/products',
        overwrite: true,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });

      console.log(`   ✅ Success!`);
      console.log(`   URL: ${result.secure_url}\n`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${imagesToUpload.length}`);
  console.log('='.repeat(60));

  if (successCount === imagesToUpload.length) {
    console.log('\n🎉 All images uploaded successfully!');
    console.log('Images should now display on the website.');
  }
};

uploadImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
