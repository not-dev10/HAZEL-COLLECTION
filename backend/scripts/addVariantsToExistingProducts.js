/**
 * Migration Script: Add variants field to existing products
 * 
 * This script adds an empty variants array to all existing products
 * that don't have variants yet. This makes them compatible with the
 * new color/size variant system without losing any data.
 * 
 * Usage: node addVariantsToExistingProducts.js
 */

import { getDB } from '../src/config/mongodb.js';

async function addVariantsToExistingProducts() {
  try {
    console.log('🔄 Starting migration: Adding variants field to existing products...\n');

    const db = getDB();
    const products = db.collection('products');

    // Find all products that don't have variants field
    const productsWithoutVariants = await products
      .find({ variants: { $exists: false } })
      .toArray();

    console.log(`📊 Found ${productsWithoutVariants.length} products without variants field\n`);

    if (productsWithoutVariants.length === 0) {
      console.log('✅ All products already have variants field. No migration needed.\n');
      return;
    }

    // Update all products without variants to have empty variants array
    const result = await products.updateMany(
      { variants: { $exists: false } },
      { $set: { variants: [] } }
    );

    console.log(`✅ Migration completed successfully!\n`);
    console.log(`📈 Statistics:`);
    console.log(`   - Matched: ${result.matchedCount} products`);
    console.log(`   - Modified: ${result.modifiedCount} products`);
    console.log(`   - Upserted: ${result.upsertedCount} products\n`);

    // Show sample of updated products
    const sampleProducts = await products
      .find({ variants: { $exists: true } })
      .limit(3)
      .toArray();

    console.log('📋 Sample of updated products:');
    sampleProducts.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      - ID: ${product._id}`);
      console.log(`      - Variants: ${product.variants.length} (${product.variants.length === 0 ? 'empty' : 'has variants'})`);
      console.log(`      - Stock: ${product.stock}`);
    });

    console.log('\n✅ All existing products are now compatible with the variants system!\n');
    console.log('📝 Next steps:');
    console.log('   1. Edit products in admin panel');
    console.log('   2. Add colors and sizes using ColorSizeManager');
    console.log('   3. Set stock levels for each size');
    console.log('   4. Save product\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
addVariantsToExistingProducts().then(() => {
  console.log('🎉 Migration script completed!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
