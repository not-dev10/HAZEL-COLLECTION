import { seedProductsWithCloudinary, migrateExistingProductsToCloudinary } from '../src/utils/cloudinarySync.js';
import { connectDB } from '../src/config/mongodb.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🌱 Database Seeding & Migration Script');
console.log('=====================================\n');

// Debug environment variables
console.log('🔧 Environment Check:');
console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗'}`);
console.log(`   Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'Missing ✗'}`);
console.log(`   Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗'}`);
console.log(`   Cloudinary API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗'}\n`);

const runSeeding = async () => {
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully\n');

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'seed';

    switch (command) {
      case 'seed':
        console.log('🌱 Starting database seeding with Cloudinary products...\n');
        const seedResult = await seedProductsWithCloudinary();
        console.log(`\n🎉 Seeding completed!`);
        console.log(`✅ Created: ${seedResult.createdCount} products`);
        console.log(`📦 Total sample products: ${seedResult.totalSampleProducts}`);
        break;

      case 'migrate':
        console.log('🔄 Starting migration of existing products to Cloudinary...\n');
        const migrateResult = await migrateExistingProductsToCloudinary();
        console.log(`\n🎉 Migration completed!`);
        console.log(`✅ Migrated: ${migrateResult.migratedCount} products`);
        console.log(`⏭️  Skipped: ${migrateResult.skippedCount} products`);
        console.log(`📦 Total products: ${migrateResult.totalProducts}`);
        break;

      case 'both':
        console.log('🚀 Running both seeding and migration...\n');
        
        // First seed new products
        console.log('1️⃣ Seeding new products...');
        const seedRes = await seedProductsWithCloudinary();
        console.log(`✅ Seeded: ${seedRes.createdCount} products\n`);
        
        // Then migrate existing ones
        console.log('2️⃣ Migrating existing products...');
        const migrateRes = await migrateExistingProductsToCloudinary();
        console.log(`✅ Migrated: ${migrateRes.migratedCount} products\n`);
        
        console.log('🎉 Both operations completed successfully!');
        break;

      default:
        console.log('❌ Invalid command. Use one of:');
        console.log('  - seed: Add sample products with Cloudinary images');
        console.log('  - migrate: Migrate existing products to Cloudinary');
        console.log('  - both: Run both seeding and migration');
        process.exit(1);
    }

    console.log('\n✨ Database operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database operations:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Gracefully shutting down...');
  process.exit(0);
});

runSeeding();