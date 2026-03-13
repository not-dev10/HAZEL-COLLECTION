/**
 * Migration Script: Extract last image as size reference image
 * 
 * Usage: node scripts/migrateProductImages.js
 * 
 * This script:
 * 1. Finds all products with images array (stored in Cloudinary)
 * 2. Extracts the last image as sizeReferenceImage
 * 3. Removes the last image from the images array
 * 4. Updates the product in the database
 * 
 * Note: Size reference images are always last in the order
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

// Load environment variables
loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('✅ Environment loaded');
console.log('📍 MongoDB URI:', MONGODB_URI.substring(0, 50) + '...');

async function migrateProductImages() {
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: '1',
        strict: false,
        deprecationErrors: false,
      },
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('didi_fashion');
    const products = db.collection('products');

    console.log('🔍 Starting product image migration...\n');

    // Find all products with images array
    const allProducts = await products.find({ 
      images: { $exists: true, $type: 'array', $ne: [] } 
    }).toArray();
    
    console.log(`📦 Found ${allProducts.length} products with images\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const product of allProducts) {
      try {
        const images = product.images || [];
        
        // Skip if already has sizeReferenceImage
        if (product.sizeReferenceImage) {
          console.log(`⏭️  Skipping "${product.name}" - already has sizeReferenceImage`);
          skippedCount++;
          continue;
        }

        // Skip if only 1 or fewer images
        if (images.length <= 1) {
          console.log(`⏭️  Skipping "${product.name}" - only ${images.length} image(s)`);
          skippedCount++;
          continue;
        }

        // Extract last image as size reference
        const lastImage = images[images.length - 1];
        const remainingImages = images.slice(0, -1);

        // Update product
        const updateResult = await products.findOneAndUpdate(
          { _id: product._id },
          {
            $set: {
              sizeReferenceImage: lastImage,
              images: remainingImages,
              image: remainingImages[0] || product.image,  // Update primary image if needed
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        );

        if (updateResult.value) {
          migratedCount++;
          results.push({
            productId: product._id.toString(),
            productName: product.name,
            sizeReferenceImage: lastImage,
            remainingImages: remainingImages.length,
            status: '✓ MIGRATED'
          });
          console.log(`✅ Migrated "${product.name}"`);
          console.log(`   - Size Reference: ${lastImage.substring(0, 80)}...`);
          console.log(`   - Remaining images: ${remainingImages.length}\n`);
        }
      } catch (error) {
        console.error(`❌ Error migrating "${product.name}":`, error.message);
        results.push({
          productId: product._id.toString(),
          productName: product.name,
          status: '❌ FAILED',
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📦 Total: ${allProducts.length}`);
    console.log('='.repeat(60) + '\n');

    // Detailed results
    if (results.length > 0) {
      console.log('DETAILED RESULTS:');
      console.log('-'.repeat(60));
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.productName}`);
        console.log(`   Status: ${result.status}`);
        if (result.sizeReferenceImage) {
          console.log(`   Size Reference: ${result.sizeReferenceImage.substring(0, 60)}...`);
          console.log(`   Remaining Images: ${result.remainingImages}`);
        }
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
    }

    console.log('\n✨ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run migration
migrateProductImages().then(() => {
  console.log('🎉 Migration script completed!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
