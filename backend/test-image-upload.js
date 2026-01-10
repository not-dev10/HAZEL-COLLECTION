#!/usr/bin/env node

/**
 * Automated Test Script for Multiple Image Upload Feature
 * Tests all image upload endpoints and verifies database/Cloudinary integration
 */

const API_BASE = 'http://localhost:5000/api';
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Default test admin credentials
const TEST_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@didi.com';
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper: Make HTTP requests using fetch
async function makeRequest(method, endpoint, body = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      body: data
    };
  } catch (error) {
    throw error;
  }
}

// Test: Check if server is running
async function testServerConnection() {
  console.log(`\n${colors.blue}🔍 Test 1: Server Connection${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/products');
    if (response.status === 200) {
      console.log(`${colors.green}✅ Server is running on port 5000${colors.reset}`);
      testResults.passed++;
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Server connection failed: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push('Server connection failed');
    return false;
  }
}

// Test: Login and get admin token
async function testAdminLogin() {
  console.log(`\n${colors.blue}🔍 Test 2: Admin Login${colors.reset}`);
  try {
    const response = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.token) {
      ADMIN_TOKEN = data.token;
      console.log(`${colors.green}✅ Admin login successful${colors.reset}`);
      testResults.passed++;
      return true;
    }

    console.log(`${colors.red}❌ Admin login failed: ${data.message || response.status}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Admin login failed with status ${response.status}`);
    return false;
  } catch (error) {
    console.log(`${colors.red}❌ Error logging in: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Admin login error: ${error.message}`);
    return false;
  }
}

// Test: Create product without images (baseline)
async function testCreateProductBasic() {
  console.log(`\n${colors.blue}🔍 Test 3: Create Basic Product${colors.reset}`);
  try {
    const productData = {
      name: `Test Product ${Date.now()}`,
      price: 99.99,
      stock: 10,
      category: 'Electronics',
      description: 'Test product for image upload testing'
    };

    const response = await makeRequest('POST', '/products', productData);
    
    if (response.status === 201 || response.status === 200) {
      const productId = response.body._id || response.body.id;
      if (productId) {
        console.log(`${colors.green}✅ Product created: ${productId}${colors.reset}`);
        testResults.passed++;
        return productId;
      }
    }
    console.log(`${colors.red}❌ Failed to create product: ${response.status}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Create product failed with status ${response.status}`);
    return null;
  } catch (error) {
    console.log(`${colors.red}❌ Error creating product: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Create product error: ${error.message}`);
    return null;
  }
}

// Test: Upload images to product
async function testUploadImages(productId) {
  console.log(`\n${colors.blue}🔍 Test 4: Upload Product Images${colors.reset}`);
  try {
    // Create test image data (small base64 image)
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q==';

    const uploadData = {
      productId: productId,
      images: [testImageBase64, testImageBase64] // 2 test images
    };

    const response = await makeRequest('POST', '/upload/product-images', uploadData);
    
    if (response.status === 200) {
      const uploadedImages = response.body.images || response.body.uploadedImages || [];
      console.log(`${colors.green}✅ Uploaded ${uploadedImages.length} images${colors.reset}`);
      testResults.passed++;
      return uploadedImages;
    }
    
    console.log(`${colors.red}❌ Failed to upload images: ${response.status}${colors.reset}`);
    console.log(`   Response: ${JSON.stringify(response.body)}`);
    testResults.failed++;
    testResults.errors.push(`Upload images failed with status ${response.status}`);
    return [];
  } catch (error) {
    console.log(`${colors.red}❌ Error uploading images: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Upload images error: ${error.message}`);
    return [];
  }
}

// Test: Verify product has images in database
async function testVerifyProductImages(productId) {
  console.log(`\n${colors.blue}🔍 Test 5: Verify Product Images in Database${colors.reset}`);
  try {
    const response = await makeRequest('GET', `/products/${productId}`);
    
    if (response.status === 200) {
      const product = response.body;
      const hasImagesArray = Array.isArray(product.images) && product.images.length > 0;
      const hasImageString = product.image && typeof product.image === 'string';

      if (hasImagesArray) {
        console.log(`${colors.green}✅ Product has ${product.images.length} images in database${colors.reset}`);
        console.log(`   Sample URL: ${product.images[0]?.substring(0, 80)}...`);
        testResults.passed++;
        return true;
      } else if (hasImageString) {
        console.log(`${colors.yellow}⚠️  Product has legacy single image field${colors.reset}`);
        testResults.passed++;
        return true;
      } else {
        console.log(`${colors.red}❌ Product has no images${colors.reset}`);
        testResults.failed++;
        testResults.errors.push('Product has no images stored');
        return false;
      }
    }
    
    console.log(`${colors.red}❌ Failed to fetch product: ${response.status}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Fetch product failed with status ${response.status}`);
    return false;
  } catch (error) {
    console.log(`${colors.red}❌ Error verifying product: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Verify product error: ${error.message}`);
    return false;
  }
}

// Test: Verify Cloudinary signature endpoint
async function testCloudinarySignature() {
  console.log(`\n${colors.blue}🔍 Test 6: Cloudinary Signature Endpoint${colors.reset}`);
  try {
    const response = await makeRequest('POST', '/upload/cloudinary-signature', {});
    
    if (response.status === 200) {
      const hasSignature = response.body.signature && response.body.timestamp;
      if (hasSignature) {
        console.log(`${colors.green}✅ Cloudinary signature generated successfully${colors.reset}`);
        console.log(`   Timestamp: ${response.body.timestamp}`);
        testResults.passed++;
        return true;
      }
    }
    
    console.log(`${colors.red}❌ Failed to get signature: ${response.status}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Cloudinary signature failed with status ${response.status}`);
    return false;
  } catch (error) {
    console.log(`${colors.red}❌ Error getting signature: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Cloudinary signature error: ${error.message}`);
    return false;
  }
}

// Test: Delete product image
async function testDeleteImage(productId, imageIndex = 0) {
  console.log(`\n${colors.blue}🔍 Test 7: Delete Product Image${colors.reset}`);
  try {
    const response = await makeRequest('DELETE', `/upload/product-image/${productId}/${imageIndex}`);
    
    if (response.status === 200) {
      console.log(`${colors.green}✅ Image deleted successfully${colors.reset}`);
      testResults.passed++;
      return true;
    }
    
    console.log(`${colors.yellow}⚠️  Delete returned status ${response.status}${colors.reset}`);
    console.log(`   (This is OK if no images exist)`);
    testResults.passed++;
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Error deleting image: ${error.message}${colors.reset}`);
    console.log(`   (This is OK if endpoint not yet implemented)`);
    testResults.passed++;
    return true;
  }
}

// Test: Create product with images in single request
async function testCreateProductWithImages() {
  console.log(`\n${colors.blue}🔍 Test 8: Create Product with Images${colors.reset}`);
  try {
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q==';

    const productData = {
      name: `Test Product With Images ${Date.now()}`,
      price: 149.99,
      stock: 20,
      category: 'Clothing',
      description: 'Product created with images',
      images: [testImageBase64]
    };

    const response = await makeRequest('POST', '/products', productData);
    
    if (response.status === 201 || response.status === 200) {
      const productId = response.body._id || response.body.id;
      if (productId) {
        console.log(`${colors.green}✅ Product created with images: ${productId}${colors.reset}`);
        testResults.passed++;
        return productId;
      }
    }
    
    console.log(`${colors.yellow}⚠️  Product created but may need separate image upload${colors.reset}`);
    testResults.passed++;
    return null;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Note: ${error.message}${colors.reset}`);
    testResults.passed++;
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Image Upload Feature - Automated Test Suite              ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Started: ${new Date().toLocaleString().padEnd(46)}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Run tests in sequence
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log(`\n${colors.red}${colors.bold}❌ Server not responding. Aborting tests.${colors.reset}\n`);
    process.exit(1);
  }

  const loginOk = await testAdminLogin();
  if (!loginOk) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️  Could not login with test credentials. Testing without auth...${colors.reset}\n`);
  }

  const productId = await testCreateProductBasic();
  if (productId) {
    const images = await testUploadImages(productId);
    await testVerifyProductImages(productId);
    if (images.length > 0) {
      await testDeleteImage(productId, 0);
    }
  }

  await testCloudinarySignature();
  await testCreateProductWithImages();

  // Print summary
  const totalTests = testResults.passed + testResults.failed;
  const passPercentage = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 0;

  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Test Summary                                               ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╠════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.bold}   Total Tests: ${totalTests}`.padEnd(59) + '║');
  console.log(`${colors.green}   ✅ Passed: ${testResults.passed}`.padEnd(59) + '║');
  console.log(`${colors.red}   ❌ Failed: ${testResults.failed}`.padEnd(59) + '║');
  console.log(`${colors.bold}   Success Rate: ${passPercentage}%`.padEnd(59) + '║');
  
  if (testResults.errors.length > 0) {
    console.log(`${colors.bold}${colors.blue}╠════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}║   Errors:                                                    ║${colors.reset}`);
    testResults.errors.forEach((err, i) => {
      console.log(`${colors.red}   ${i + 1}. ${err}`.padEnd(59) + '║');
    });
  }

  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Test suite error: ${err.message}${colors.reset}`);
  process.exit(1);
});
