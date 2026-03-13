/**
 * Diagnostic Script: Check product structure in database
 * 
 * Usage: node scripts/diagnoseProducts.js
 * 
 * This script shows:
 * 1. Total number of products
 * 2. Sample product structure
 * 3. Which fields contain images
 * 4. How many products have images
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/didi-fashion';
const DB_NAME = 'didi-fashion';

async function diagnoseProducts() {
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DB_NAME);
    const products = db.collection('products');

    console.log('🔍 Diagnosing product structure...\n');

    // Get total count
    const totalCount = await products.countDocuments();
    console.log(`📦 Total products: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('⚠️  No products found in database');
      process.exit(0);
    }

    // Get first product to see structure
    const firstProduct = await products.findOne();
    console.log('📋 FIRST PRODUCT STRUCTURE:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(firstProduct, null, 2));
    console.log('='.repeat(60) + '\n');

    // Check for different image field patterns
    console.log('🔎 CHECKING IMAGE FIELDS:\n');

    const fieldsToCheck = [
      { field: 'images', description: 'images array' },
      { field: 'image', description: 'single image' },
      { field: 'productImages', description: 'productImages array' },
      { field: 'photos', description: 'photos array' },
      { field: 'pictures', description: 'pictures array' },
      { field: 'cloudinary.images', description: 'cloudinary.images' }
    ];

    for (const { field, description } of fieldsToCheck) {
      const query = {};
      query[field] = { $exists: true, $ne: null };
      
      const count = await products.countDocuments(query);
      if (count > 0) {
        console.log(`✅ Found ${count} products with "${field}" (${description})`);
        
        // Get sample
        const sample = await products.findOne(query);
        const fieldValue = field.includes('.') 
          ? field.split('.').reduce((obj, key) => obj?.[key], sample)
          : sample[field];
        
        console.log(`   Sample value type: ${Array.isArray(fieldValue) ? 'Array' : typeof fieldValue}`);
        if (Array.isArray(fieldValue)) {
          console.log(`   Array length: ${fieldValue.length}`);
          if (fieldValue.length > 0) {
            console.log(`   First item: ${JSON.stringify(fieldValue[0]).substring(0, 100)}...`);
          }
        }
        console.log();
      }
    }

    // Check for products with multiple images
    console.log('📊 IMAGE STATISTICS:\n');
    
    const imagesArrayCount = await products.countDocuments({ 
      images: { $exists: true, $type: 'array', $ne: [] } 
    });
    console.log(`✓ Products with images array (non-empty): ${imagesArrayCount}`);

    const imageFieldCount = await products.countDocuments({ 
      image: { $exists: true, $ne: null } 
    });
    console.log(`✓ Products with image field: ${imageFieldCount}`);

    // Get products with most images
    const pipeline = [
      {
        $project: {
          name: 1,
          imageCount: { $cond: [{ $isArray: '$images' }, { $size: '$images' }, 0] },
          hasImage: { $cond: [{ $ne: ['$image', null] }, 1, 0] }
        }
      },
      { $sort: { imageCount: -1 } },
      { $limit: 5 }
    ];

    const topProducts = await products.aggregate(pipeline).toArray();
    
    if (topProducts.length > 0) {
      console.log('\n📈 TOP 5 PRODUCTS BY IMAGE COUNT:\n');
      topProducts.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   Images array: ${p.imageCount} items`);
        console.log(`   Has image field: ${p.hasImage ? 'Yes' : 'No'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('RECOMMENDATIONS:');
    console.log('='.repeat(60));
    
    if (imagesArrayCount === 0 && imageFieldCount > 0) {
      console.log('⚠️  Products use "image" field (single), not "images" array');
      console.log('   → Need to modify migration script to use "image" field');
    } else if (imagesArrayCount > 0) {
      console.log('✅ Products use "images" array - migration script should work');
    } else {
      console.log('⚠️  No image fields found - check database structure');
    }

    console.log('\n✨ Diagnosis complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run diagnosis
diagnoseProducts();
