import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

console.log('Environment loaded:');
console.log(`  MONGODB_URI: ${MONGODB_URI ? '✅' : '❌'}`);
console.log(`  CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);

let client;

async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db('didi_fashion');  // Use same DB name as backend
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Test 1: Verify Database Schema has Cloudinary attributes
 */
async function testDatabaseSchema(db) {
  console.log('\n📋 TEST 1: Database Schema Verification');
  console.log('='.repeat(50));
  
  try {
    const products = db.collection('products');
    const sampleProduct = await products.findOne({});
    
    if (!sampleProduct) {
      console.log('⚠️  No products found in database');
      return { passed: false, reason: 'No products in DB' };
    }
    
    console.log('✅ Sample product found:');
    console.log(`   - ID: ${sampleProduct._id}`);
    console.log(`   - Name: ${sampleProduct.name}`);
    
    const hasImageField = 'image' in sampleProduct;
    const hasCloudinaryPublicId = 'cloudinaryPublicId' in sampleProduct;
    
    console.log('\n📦 Schema Attributes:');
    console.log(`   - image field: ${hasImageField ? '✅' : '❌'}`);
    console.log(`   - cloudinaryPublicId field: ${hasCloudinaryPublicId ? '✅' : '❌'}`);
    
    if (hasImageField) {
      console.log(`   - image value: ${sampleProduct.image}`);
    }
    if (hasCloudinaryPublicId) {
      console.log(`   - cloudinaryPublicId value: ${sampleProduct.cloudinaryPublicId}`);
    }
    
    const passed = hasImageField && hasCloudinaryPublicId;
    return { passed, product: sampleProduct };
  } catch (error) {
    console.error('❌ Error testing schema:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Test 2: Verify Cloudinary URLs are stored correctly
 */
async function testCloudinaryURLsInDB(db) {
  console.log('\n🌐 TEST 2: Cloudinary URLs in Database');
  console.log('='.repeat(50));
  
  try {
    const products = db.collection('products');
    const allProducts = await products.find({}).toArray();
    console.log(`📊 Total products in DB: ${allProducts.length}`);
    
    let cloudinaryCount = 0;
    let nonCloudinaryCount = 0;
    let missingImageCount = 0;
    
    const cloudinaryProducts = [];
    const nonCloudinaryProducts = [];
    
    for (const product of allProducts) {
      if (!product.image) {
        missingImageCount++;
      } else if (product.image.includes('cloudinary.com')) {
        cloudinaryCount++;
        cloudinaryProducts.push({
          name: product.name,
          image: product.image,
          publicId: product.cloudinaryPublicId
        });
      } else {
        nonCloudinaryCount++;
        nonCloudinaryProducts.push({
          name: product.name,
          image: product.image
        });
      }
    }
    
    console.log('\n📈 URL Distribution:');
    console.log(`   ✅ Cloudinary URLs: ${cloudinaryCount}`);
    console.log(`   ⚠️  Non-Cloudinary URLs: ${nonCloudinaryCount}`);
    console.log(`   ❌ Missing images: ${missingImageCount}`);
    
    if (cloudinaryProducts.length > 0) {
      console.log('\n✅ Cloudinary Products:');
      cloudinaryProducts.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name}`);
        console.log(`     URL: ${p.image.substring(0, 80)}...`);
        console.log(`     PublicID: ${p.publicId}`);
      });
      if (cloudinaryProducts.length > 3) {
        console.log(`   ... and ${cloudinaryProducts.length - 3} more`);
      }
    }
    
    if (nonCloudinaryProducts.length > 0) {
      console.log('\n⚠️  Non-Cloudinary Products:');
      nonCloudinaryProducts.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name}`);
        console.log(`     URL: ${p.image.substring(0, 80)}...`);
      });
    }
    
    const passed = cloudinaryCount > 0;
    return { 
      passed, 
      cloudinaryCount, 
      nonCloudinaryCount, 
      missingImageCount,
      cloudinaryProducts 
    };
  } catch (error) {
    console.error('❌ Error testing URLs:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Test 3: Verify Cloudinary URLs are valid and accessible
 */
async function testCloudinaryURLsAccessibility(db) {
  console.log('\n🔗 TEST 3: Cloudinary URLs Accessibility');
  console.log('='.repeat(50));
  
  try {
    const products = db.collection('products');
    const cloudinaryProducts = await products
      .find({ image: { $regex: 'cloudinary.com' } })
      .limit(3)
      .toArray();
    
    if (cloudinaryProducts.length === 0) {
      console.log('⚠️  No Cloudinary products found to test');
      return { passed: false, reason: 'No Cloudinary products' };
    }
    
    console.log(`🧪 Testing ${cloudinaryProducts.length} Cloudinary URLs...\n`);
    
    let accessibleCount = 0;
    const results = [];
    
    for (const product of cloudinaryProducts) {
      try {
        const response = await fetch(product.image, { method: 'HEAD', timeout: 5000 });
        const isAccessible = response.ok;
        
        if (isAccessible) {
          accessibleCount++;
          console.log(`✅ ${product.name}`);
          console.log(`   Status: ${response.status}`);
          console.log(`   URL: ${product.image.substring(0, 80)}...`);
        } else {
          console.log(`⚠️  ${product.name}`);
          console.log(`   Status: ${response.status}`);
        }
        
        results.push({
          name: product.name,
          accessible: isAccessible,
          status: response.status
        });
      } catch (error) {
        console.log(`❌ ${product.name}`);
        console.log(`   Error: ${error.message}`);
        results.push({
          name: product.name,
          accessible: false,
          error: error.message
        });
      }
    }
    
    console.log(`\n📊 Accessibility Summary: ${accessibleCount}/${cloudinaryProducts.length} accessible`);
    return { passed: accessibleCount > 0, results };
  } catch (error) {
    console.error('❌ Error testing accessibility:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Test 4: Verify Frontend Configuration
 */
async function testFrontendConfiguration() {
  console.log('\n⚙️  TEST 4: Frontend Configuration');
  console.log('='.repeat(50));
  
  try {
    const cloudName = CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      console.log('❌ CLOUDINARY_CLOUD_NAME not set in environment');
      return { passed: false, reason: 'Missing CLOUDINARY_CLOUD_NAME' };
    }
    
    console.log(`✅ CLOUDINARY_CLOUD_NAME: ${cloudName}`);
    
    // Test image variant generation logic
    const testPublicId = 'hezal-couture/products/test-product';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    const variants = {
      thumbnail: `${baseUrl}/w_150,h_200,c_fill,q_auto,f_auto/${testPublicId}`,
      card: `${baseUrl}/w_300,h_400,c_fill,q_auto,f_auto/${testPublicId}`,
      detail: `${baseUrl}/w_600,h_800,c_fill,q_auto,f_auto/${testPublicId}`,
      hero: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${testPublicId}`,
      original: `${baseUrl}/q_auto,f_auto/${testPublicId}`,
    };
    
    console.log('\n📐 Image Variants Generated:');
    Object.entries(variants).forEach(([size, url]) => {
      console.log(`   - ${size}: ${url.substring(0, 80)}...`);
    });
    
    // Test public ID extraction
    const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1767936581/hezal-couture/products/test-product.jpg`;
    const matches = testUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    const extractedId = matches ? matches[1] : null;
    
    console.log('\n🔍 Public ID Extraction:');
    console.log(`   - Original URL: ${testUrl.substring(0, 80)}...`);
    console.log(`   - Extracted ID: ${extractedId}`);
    console.log(`   - Match: ${extractedId === 'hezal-couture/products/test-product' ? '✅' : '❌'}`);
    
    return { 
      passed: true, 
      cloudName,
      variantsGenerated: Object.keys(variants).length,
      publicIdExtraction: extractedId === 'hezal-couture/products/test-product'
    };
  } catch (error) {
    console.error('❌ Error testing frontend config:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Test 5: Verify API Response includes Cloudinary data
 */
async function testAPIResponse(db) {
  console.log('\n🔌 TEST 5: API Response Format');
  console.log('='.repeat(50));
  
  try {
    const products = db.collection('products');
    const product = await products.findOne({ image: { $regex: 'cloudinary.com' } });
    
    if (!product) {
      console.log('⚠️  No Cloudinary products found');
      return { passed: false, reason: 'No Cloudinary products' };
    }
    
    // Generate variants
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const imageVariants = {
      thumbnail: `${baseUrl}/w_150,h_200,c_fill,q_auto,f_auto/${product.cloudinaryPublicId}`,
      card: `${baseUrl}/w_300,h_400,c_fill,q_auto,f_auto/${product.cloudinaryPublicId}`,
      detail: `${baseUrl}/w_600,h_800,c_fill,q_auto,f_auto/${product.cloudinaryPublicId}`,
      hero: `${baseUrl}/w_1200,h_800,c_fill,q_auto,f_auto/${product.cloudinaryPublicId}`,
      original: `${baseUrl}/q_auto,f_auto/${product.cloudinaryPublicId}`,
    };
    
    const apiResponse = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      cloudinaryPublicId: product.cloudinaryPublicId,
      imageVariants: imageVariants
    };
    
    console.log('✅ API Response Structure:');
    console.log(`   - id: ${apiResponse.id}`);
    console.log(`   - name: ${apiResponse.name}`);
    console.log(`   - price: ${apiResponse.price}`);
    console.log(`   - image: ${apiResponse.image.substring(0, 60)}...`);
    console.log(`   - cloudinaryPublicId: ${apiResponse.cloudinaryPublicId}`);
    console.log(`   - imageVariants: ${Object.keys(apiResponse.imageVariants).join(', ')}`);
    
    const hasAllFields = apiResponse.id && apiResponse.image && apiResponse.cloudinaryPublicId && apiResponse.imageVariants;
    
    return { 
      passed: hasAllFields, 
      response: apiResponse 
    };
  } catch (error) {
    console.error('❌ Error testing API response:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 CLOUDINARY INTEGRATION TEST SUITE');
  console.log('='.repeat(50));
  console.log(`Started at: ${new Date().toISOString()}`);
  
  let db;
  try {
    db = await connectDB();
    
    const results = {
      schema: await testDatabaseSchema(db),
      urls: await testCloudinaryURLsInDB(db),
      accessibility: await testCloudinaryURLsAccessibility(db),
      frontend: await testFrontendConfiguration(),
      api: await testAPIResponse(db)
    };
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const testNames = {
      schema: 'Database Schema',
      urls: 'Cloudinary URLs in DB',
      accessibility: 'URL Accessibility',
      frontend: 'Frontend Configuration',
      api: 'API Response Format'
    };
    
    let passedCount = 0;
    Object.entries(results).forEach(([key, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${testNames[key]}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.reason) {
        console.log(`   Reason: ${result.reason}`);
      }
      if (result.passed) passedCount++;
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`Overall: ${passedCount}/5 tests passed`);
    console.log(`Completed at: ${new Date().toISOString()}`);
    
    return results;
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
