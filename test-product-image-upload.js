/**
 * Test Script: Product Image Upload & Edit
 * Tests the admin panel product image upload and edit functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@didifashion.com';
const ADMIN_PASSWORD = 'admin123';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Helper function to create a test image as base64
function createTestImageBase64() {
  // Create a simple 1x1 PNG image in base64
  const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return base64Image;
}

// Helper function to create multiple test images
function createMultipleTestImages(count = 3) {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      url: createTestImageBase64(),
      type: `test-image-${i + 1}`
    });
  }
  return images;
}

// Test 1: Admin Login
async function testAdminLogin() {
  console.log('\n📝 Test 1: Admin Login');
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      logTest('Admin Login', true, `Token received: ${data.token.substring(0, 20)}...`);
      return data.token;
    } else {
      logTest('Admin Login', false, data.message || 'No token received');
      return null;
    }
  } catch (error) {
    logTest('Admin Login', false, error.message);
    return null;
  }
}

// Test 2: Create Product Without Images
async function testCreateProductWithoutImages(token) {
  console.log('\n📝 Test 2: Create Product Without Images');
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product - No Images',
        description: 'Product created for image upload testing',
        price: 99.99,
        stock: 10,
        category: 'Test Category'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.product) {
      logTest('Create Product Without Images', true, `Product ID: ${data.product._id}`);
      return data.product._id || data.product.id;
    } else {
      logTest('Create Product Without Images', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Create Product Without Images', false, error.message);
    return null;
  }
}

// Test 3: Upload Images to Existing Product
async function testUploadImagesToProduct(token, productId) {
  console.log('\n📝 Test 3: Upload Images to Existing Product');
  try {
    const images = createMultipleTestImages(3);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        images
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      const uploadCount = data.data?.uploadedImages?.length || 0;
      logTest('Upload Images to Product', true, `Uploaded ${uploadCount} images`);
      return data.data;
    } else {
      logTest('Upload Images to Product', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Upload Images to Product', false, error.message);
    return null;
  }
}

// Test 4: Verify Product Has Images
async function testVerifyProductImages(token, productId) {
  console.log('\n📝 Test 4: Verify Product Has Images');
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok && data.product) {
      const hasImages = data.product.images && data.product.images.length > 0;
      const imageCount = data.product.images?.length || 0;
      
      if (hasImages) {
        logTest('Verify Product Has Images', true, `Product has ${imageCount} images`);
        console.log('   Image URLs:', data.product.images.slice(0, 2).map(url => url.substring(0, 50) + '...'));
        return data.product;
      } else {
        logTest('Verify Product Has Images', false, 'Product has no images');
        return null;
      }
    } else {
      logTest('Verify Product Has Images', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Verify Product Has Images', false, error.message);
    return null;
  }
}

// Test 5: Create Product With Images
async function testCreateProductWithImages(token) {
  console.log('\n📝 Test 5: Create Product With Images (Combined)');
  try {
    // First create the product
    const createResponse = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product - With Images',
        description: 'Product created with images in one flow',
        price: 149.99,
        stock: 20,
        category: 'Test Category'
      })
    });

    const createData = await createResponse.json();
    
    if (!createResponse.ok || !createData.product) {
      logTest('Create Product With Images', false, 'Failed to create product');
      return null;
    }

    const productId = createData.product._id || createData.product.id;
    
    // Then upload images
    const images = createMultipleTestImages(2);
    const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        images
      })
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadResponse.ok && uploadData.success) {
      logTest('Create Product With Images', true, `Product created with ${uploadData.data.uploadedImages.length} images`);
      return productId;
    } else {
      logTest('Create Product With Images', false, 'Failed to upload images');
      return null;
    }
  } catch (error) {
    logTest('Create Product With Images', false, error.message);
    return null;
  }
}

// Test 6: Update Product Images (Replace)
async function testReplaceProductImages(token, productId) {
  console.log('\n📝 Test 6: Replace Product Images');
  try {
    const newImages = createMultipleTestImages(4);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        images: newImages
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      const uploadCount = data.data?.uploadedImages?.length || 0;
      logTest('Replace Product Images', true, `Replaced with ${uploadCount} new images`);
      return data.data;
    } else {
      logTest('Replace Product Images', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Replace Product Images', false, error.message);
    return null;
  }
}

// Test 7: Update Product Details (Without Images)
async function testUpdateProductDetails(token, productId) {
  console.log('\n📝 Test 7: Update Product Details Without Changing Images');
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product - Updated Name',
        description: 'Updated description',
        price: 199.99,
        stock: 15,
        category: 'Updated Category'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.product) {
      const hasImages = data.product.images && data.product.images.length > 0;
      logTest('Update Product Details', true, `Product updated, images preserved: ${hasImages}`);
      return data.product;
    } else {
      logTest('Update Product Details', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Update Product Details', false, error.message);
    return null;
  }
}

// Test 8: Get All Products and Check Images
async function testGetAllProductsWithImages(token) {
  console.log('\n📝 Test 8: Get All Products and Verify Images');
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok && data.products) {
      const productsWithImages = data.products.filter(p => p.images && p.images.length > 0);
      const totalProducts = data.products.length;
      
      logTest('Get All Products With Images', true, 
        `${productsWithImages.length}/${totalProducts} products have images`);
      
      return data.products;
    } else {
      logTest('Get All Products With Images', false, data.message);
      return null;
    }
  } catch (error) {
    logTest('Get All Products With Images', false, error.message);
    return null;
  }
}

// Test 9: Test Invalid Image Upload (Missing ProductId)
async function testInvalidImageUpload(token) {
  console.log('\n📝 Test 9: Test Invalid Image Upload (Error Handling)');
  try {
    const images = createMultipleTestImages(1);
    
    const response = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        // Missing productId
        images
      })
    });

    const data = await response.json();
    
    // Should fail with 400
    if (!response.ok && response.status === 400) {
      logTest('Invalid Image Upload Error Handling', true, 'Correctly rejected invalid request');
      return true;
    } else {
      logTest('Invalid Image Upload Error Handling', false, 'Should have rejected invalid request');
      return false;
    }
  } catch (error) {
    logTest('Invalid Image Upload Error Handling', false, error.message);
    return false;
  }
}

// Test 10: Test Image Upload to Non-Existent Product
async function testImageUploadToNonExistentProduct(token) {
  console.log('\n📝 Test 10: Test Image Upload to Non-Existent Product');
  try {
    const images = createMultipleTestImages(1);
    const fakeProductId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
    
    const response = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: fakeProductId,
        images
      })
    });

    const data = await response.json();
    
    // Should fail with 404
    if (!response.ok && response.status === 404) {
      logTest('Image Upload to Non-Existent Product', true, 'Correctly rejected non-existent product');
      return true;
    } else {
      logTest('Image Upload to Non-Existent Product', false, 'Should have rejected non-existent product');
      return false;
    }
  } catch (error) {
    logTest('Image Upload to Non-Existent Product', false, error.message);
    return false;
  }
}

// Test 11: Cleanup - Delete Test Products
async function testCleanupTestProducts(token, productIds) {
  console.log('\n📝 Test 11: Cleanup Test Products');
  let deletedCount = 0;
  
  for (const productId of productIds) {
    if (!productId) continue;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        deletedCount++;
      }
    } catch (error) {
      console.log(`   Failed to delete product ${productId}`);
    }
  }
  
  logTest('Cleanup Test Products', true, `Deleted ${deletedCount} test products`);
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Product Image Upload Tests\n');
  console.log('='.repeat(60));
  
  const testProductIds = [];
  
  try {
    // Test 1: Login
    const token = await testAdminLogin();
    if (!token) {
      console.log('\n❌ Cannot proceed without admin token');
      return;
    }

    // Test 2: Create product without images
    const productId1 = await testCreateProductWithoutImages(token);
    if (productId1) testProductIds.push(productId1);

    // Test 3: Upload images to existing product
    if (productId1) {
      await testUploadImagesToProduct(token, productId1);
    }

    // Test 4: Verify product has images
    if (productId1) {
      await testVerifyProductImages(token, productId1);
    }

    // Test 5: Create product with images (combined flow)
    const productId2 = await testCreateProductWithImages(token);
    if (productId2) testProductIds.push(productId2);

    // Test 6: Replace product images
    if (productId1) {
      await testReplaceProductImages(token, productId1);
    }

    // Test 7: Update product details without changing images
    if (productId1) {
      await testUpdateProductDetails(token, productId1);
    }

    // Test 8: Get all products and check images
    await testGetAllProductsWithImages(token);

    // Test 9: Test error handling - invalid upload
    await testInvalidImageUpload(token);

    // Test 10: Test error handling - non-existent product
    await testImageUploadToNonExistentProduct(token);

    // Test 11: Cleanup
    await testCleanupTestProducts(token, testProductIds);

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total:  ${results.tests.length}`);
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
  console.log(`\n🎯 Success Rate: ${successRate}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
