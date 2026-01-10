import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🎨 Uploading frontend assets to Cloudinary...\n');

// Assets to upload with their public IDs based on filename
const assetsToUpload = [
  // Hero images
  {
    path: 'frontend/src/assets/hero-bridal.jpg',
    publicId: 'hezal-couture/assets/hero-bridal',
    name: 'Hero Bridal'
  },
  {
    path: 'frontend/src/assets/hero-collection.jpg',
    publicId: 'hezal-couture/assets/hero-collection',
    name: 'Hero Collection'
  },
  {
    path: 'frontend/src/assets/hero-unstitched.jpg',
    publicId: 'hezal-couture/assets/hero-unstitched',
    name: 'Hero Unstitched'
  },
  // Collection images
  {
    path: 'frontend/src/assets/collection-rtw.jpg',
    publicId: 'hezal-couture/assets/collection-rtw',
    name: 'Collection Ready to Wear'
  },
  {
    path: 'frontend/src/assets/collection-unstitched.jpg',
    publicId: 'hezal-couture/assets/collection-unstitched',
    name: 'Collection Unstitched'
  },
  // Editorial image
  {
    path: 'frontend/src/assets/editorial-bridal.jpg',
    publicId: 'hezal-couture/assets/editorial-bridal',
    name: 'Editorial Bridal'
  },
  // Product images
  {
    path: 'frontend/src/assets/product-1.jpg',
    publicId: 'hezal-couture/assets/product-1',
    name: 'Product 1'
  },
  {
    path: 'frontend/src/assets/product-2.jpg',
    publicId: 'hezal-couture/assets/product-2',
    name: 'Product 2'
  },
  {
    path: 'frontend/src/assets/product-3.jpg',
    publicId: 'hezal-couture/assets/product-3',
    name: 'Product 3'
  },
  {
    path: 'frontend/src/assets/product-4.jpg',
    publicId: 'hezal-couture/assets/product-4',
    name: 'Product 4'
  },
  {
    path: 'frontend/src/assets/product-5.jpg',
    publicId: 'hezal-couture/assets/product-5',
    name: 'Product 5'
  },
  {
    path: 'frontend/src/assets/product-6.jpg',
    publicId: 'hezal-couture/assets/product-6',
    name: 'Product 6'
  },
  {
    path: 'frontend/src/assets/product-7.jpg',
    publicId: 'hezal-couture/assets/product-7',
    name: 'Product 7'
  },
  {
    path: 'frontend/src/assets/product-8.jpg',
    publicId: 'hezal-couture/assets/product-8',
    name: 'Product 8'
  }
];

const uploadAssets = async () => {
  let successCount = 0;
  let failCount = 0;
  const uploadedAssets = [];

  for (const asset of assetsToUpload) {
    try {
      // Check if file exists
      if (!fs.existsSync(asset.path)) {
        console.log(`⏭️  Skipping ${asset.name} - file not found`);
        continue;
      }

      console.log(`📤 Uploading: ${asset.name}`);
      console.log(`   File: ${asset.path}`);
      console.log(`   Public ID: ${asset.publicId}`);

      const result = await cloudinary.v2.uploader.upload(asset.path, {
        public_id: asset.publicId,
        overwrite: true,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });

      console.log(`   ✅ Success!`);
      console.log(`   URL: ${result.secure_url}\n`);
      
      uploadedAssets.push({
        name: asset.name,
        publicId: asset.publicId,
        url: result.secure_url,
        filename: path.basename(asset.path)
      });
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${assetsToUpload.length}`);
  console.log('='.repeat(70));

  if (successCount > 0) {
    console.log('\n📋 Uploaded Assets Reference:\n');
    uploadedAssets.forEach(asset => {
      console.log(`// ${asset.name}`);
      console.log(`${asset.filename.replace(/\.[^/.]+$/, '').toUpperCase()}: '${asset.publicId}',`);
    });
  }

  if (successCount === assetsToUpload.length) {
    console.log('\n🎉 All assets uploaded successfully!');
  }
};

uploadAssets().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
