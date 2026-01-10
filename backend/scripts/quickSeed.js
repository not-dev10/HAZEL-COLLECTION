import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

console.log('🌱 Quick Seed Script');
console.log('='.repeat(50));
console.log(`MongoDB: ${MONGODB_URI ? '✅' : '❌'}`);
console.log(`Cloudinary: ${CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}\n`);

async function seedProducts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('didi_fashion');
    const products = db.collection('products');
    
    // Clear existing products
    await products.deleteMany({});
    console.log('🗑️  Cleared existing products\n');
    
    const sampleProducts = [
      {
        name: 'Embroidered Silk Ensemble',
        description: 'An exquisite silk ensemble featuring intricate embroidery work with premium silk fabric.',
        price: 485,
        originalPrice: null,
        category: 'ready-to-wear',
        image: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/embroidered-silk-ensemble`,
        cloudinaryPublicId: 'hezal-couture/products/embroidered-silk-ensemble',
        stock: 10,
        color: 'Maroon',
        size: 'M',
        isNew: true,
        isSale: false,
        details: ['100% Premium Silk', 'Hand-embroidered Details', 'Comfortable Fit'],
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Velvet Bridal Collection',
        description: 'A stunning velvet bridal piece featuring luxurious soft velvet fabric with elegant detailing.',
        price: 1250,
        originalPrice: null,
        category: 'bridal',
        image: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/velvet-bridal-collection`,
        cloudinaryPublicId: 'hezal-couture/products/velvet-bridal-collection',
        stock: 5,
        color: 'Gold',
        size: 'S',
        isNew: false,
        isSale: false,
        details: ['Premium Velvet', 'Luxury Embellishments', 'Perfect Bridal Fit'],
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cotton Lawn Three Piece',
        description: 'A versatile three-piece cotton lawn suit perfect for everyday wear with a touch of elegance.',
        price: 195,
        originalPrice: 285,
        category: 'pret',
        image: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/cotton-lawn-three-piece`,
        cloudinaryPublicId: 'hezal-couture/products/cotton-lawn-three-piece',
        stock: 15,
        color: 'Blue',
        size: 'L',
        isNew: false,
        isSale: true,
        details: ['100% Cotton Lawn', 'Three-Piece Set', 'Breathable Fabric'],
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Festive Formal Wear',
        description: 'Elegant formal wear perfect for festive celebrations and special occasions.',
        price: 650,
        originalPrice: null,
        category: 'ready-to-wear',
        image: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/hezal-couture/products/festive-formal-wear`,
        cloudinaryPublicId: 'hezal-couture/products/festive-formal-wear',
        stock: 8,
        color: 'Green',
        size: 'M',
        isNew: true,
        isSale: false,
        details: ['Premium Blend Fabric', 'Formal Design', 'Perfect For Celebrations'],
        inStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await products.insertMany(sampleProducts);
    console.log(`✅ Inserted ${result.insertedIds.length} products\n`);
    
    // Verify
    const count = await products.countDocuments({});
    console.log(`📊 Total products in DB: ${count}`);
    
    // Show sample
    const sample = await products.findOne({});
    console.log('\n📦 Sample Product:');
    console.log(`   Name: ${sample.name}`);
    console.log(`   Image: ${sample.image.substring(0, 80)}...`);
    console.log(`   PublicID: ${sample.cloudinaryPublicId}`);
    console.log(`   Has image field: ${!!sample.image}`);
    console.log(`   Has cloudinaryPublicId field: ${!!sample.cloudinaryPublicId}`);
    
  } finally {
    await client.close();
    console.log('\n✅ Done');
  }
}

seedProducts().catch(console.error);
