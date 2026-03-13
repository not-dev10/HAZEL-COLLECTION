/**
 * Migration Script: Extract last image as size reference image
 * 
 * Usage: node migrateProductImages.js
 * 
 * This script:
 * 1. Finds all products with images
 * 2. Extracts the last image as sizeReferenceImage
 * 3. Removes the last image from the images array
 * 4. Updates the product in the database
 * 
 * Note: Size reference images are always last in the order
 */

import { getDB } from '../src/config/mongodb.js';
import { ObjectId } from 'mongodb';

async function migrateProductImages() {
  try {
    const db = getDB();
    const products = db.collection('products');

    console.log('🔍 Starting product image migration...\n');

    // Find all products with images
    const allProducts = await products.find({ images: { $exists: true, $ne: [] } }).toArray();
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
  }
}

// Run migration
migrateProductImages();
