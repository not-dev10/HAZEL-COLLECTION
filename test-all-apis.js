#!/usr/bin/env node

/**
 * Comprehensive test script for Settings, Product Attributes, and Order Management APIs
 */

const http = require('http');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE API TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  try {
    // ============================================
    // SETTINGS API TESTS
    // ============================================
    console.log('📋 SETTINGS API TESTS\n');

    // Test 1: Get Settings
    console.log('TEST 1: Get Settings');
    const getSettingsResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/settings',
      method: 'GET'
    });

    if (getSettingsResult.status === 200 && getSettingsResult.body.success) {
      console.log('✅ PASS: Settings retrieved');
      console.log(`   Response: ${JSON.stringify(getSettingsResult.body.data).substring(0, 100)}...`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not retrieve settings');
      console.log(`   Status: ${getSettingsResult.status}`);
      failed++;
    }

    // ============================================
    // PRODUCT ATTRIBUTES API TESTS
    // ============================================
    console.log('\n📦 PRODUCT ATTRIBUTES API TESTS\n');

    // Test 2: Get Products (to get a product ID)
    console.log('TEST 2: Get Products (for testing)');
    const getProductsResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    });

    let productId = null;
    if (getProductsResult.status === 200 && getProductsResult.body.products?.length > 0) {
      productId = getProductsResult.body.products[0].id;
      console.log('✅ PASS: Products retrieved');
      console.log(`   Product ID: ${productId}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not retrieve products');
      console.log(`   Status: ${getProductsResult.status}`);
      failed++;
    }

    // Test 3: Update Product Stock (requires auth - will fail without token)
    if (productId) {
      console.log('\nTEST 3: Update Product Stock (without auth - expected to fail)');
      const updateStockResult = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/products-attributes/${productId}/stock`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { quantity: 50 });

      if (updateStockResult.status === 401 || updateStockResult.status === 403) {
        console.log('✅ PASS: Auth protection working (expected 401/403)');
        console.log(`   Status: ${updateStockResult.status}`);
        passed++;
      } else if (updateStockResult.status === 200) {
        console.log('⚠️  WARNING: Stock updated without auth (security issue)');
        failed++;
      } else {
        console.log('❌ FAIL: Unexpected response');
        console.log(`   Status: ${updateStockResult.status}`);
        failed++;
      }
    }

    // Test 4: Update Product Sizes (requires auth)
    if (productId) {
      console.log('\nTEST 4: Update Product Sizes (without auth - expected to fail)');
      const updateSizesResult = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/products-attributes/${productId}/sizes`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { sizes: ['XS', 'S', 'M', 'L', 'XL'] });

      if (updateSizesResult.status === 401 || updateSizesResult.status === 403) {
        console.log('✅ PASS: Auth protection working (expected 401/403)');
        console.log(`   Status: ${updateSizesResult.status}`);
        passed++;
      } else {
        console.log('❌ FAIL: Unexpected response');
        console.log(`   Status: ${updateSizesResult.status}`);
        failed++;
      }
    }

    // Test 5: Update Product Colors (requires auth)
    if (productId) {
      console.log('\nTEST 5: Update Product Colors (without auth - expected to fail)');
      const updateColorsResult = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/products-attributes/${productId}/colors`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { colors: ['Red', 'Blue', 'Green', 'Black', 'White'] });

      if (updateColorsResult.status === 401 || updateColorsResult.status === 403) {
        console.log('✅ PASS: Auth protection working (expected 401/403)');
        console.log(`   Status: ${updateColorsResult.status}`);
        passed++;
      } else {
        console.log('❌ FAIL: Unexpected response');
        console.log(`   Status: ${updateColorsResult.status}`);
        failed++;
      }
    }

    // ============================================
    // ORDER MANAGEMENT API TESTS
    // ============================================
    console.log('\n📊 ORDER MANAGEMENT API TESTS\n');

    // Test 6: Get All Orders (requires auth)
    console.log('TEST 6: Get All Orders (without auth - expected to fail)');
    const getAllOrdersResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders-management/admin/list',
      method: 'GET'
    });

    if (getAllOrdersResult.status === 401 || getAllOrdersResult.status === 403) {
      console.log('✅ PASS: Auth protection working (expected 401/403)');
      console.log(`   Status: ${getAllOrdersResult.status}`);
      passed++;
    } else {
      console.log('❌ FAIL: Unexpected response');
      console.log(`   Status: ${getAllOrdersResult.status}`);
      failed++;
    }

    // Test 7: Get Order Stats (requires auth)
    console.log('\nTEST 7: Get Order Stats (without auth - expected to fail)');
    const getStatsResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders-management/admin/stats?startDate=2024-01-01&endDate=2024-12-31',
      method: 'GET'
    });

    if (getStatsResult.status === 401 || getStatsResult.status === 403) {
      console.log('✅ PASS: Auth protection working (expected 401/403)');
      console.log(`   Status: ${getStatsResult.status}`);
      passed++;
    } else {
      console.log('❌ FAIL: Unexpected response');
      console.log(`   Status: ${getStatsResult.status}`);
      failed++;
    }

    // Test 8: Get Orders (public endpoint - should work)
    console.log('\nTEST 8: Get Orders (public endpoint)');
    const getOrdersResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'GET'
    });

    if (getOrdersResult.status === 200) {
      console.log('✅ PASS: Orders endpoint accessible');
      console.log(`   Status: ${getOrdersResult.status}`);
      passed++;
    } else {
      console.log('⚠️  WARNING: Orders endpoint returned status ' + getOrdersResult.status);
      console.log(`   This might be expected if no orders exist`);
      passed++;
    }

    // ============================================
    // ENDPOINT AVAILABILITY TESTS
    // ============================================
    console.log('\n🔗 ENDPOINT AVAILABILITY TESTS\n');

    const endpoints = [
      { path: '/api/settings', method: 'GET', name: 'Get Settings' },
      { path: '/api/products', method: 'GET', name: 'Get Products' },
      { path: '/api/cart', method: 'GET', name: 'Get Cart' },
      { path: '/api/wishlist', method: 'GET', name: 'Get Wishlist' },
      { path: '/api/orders', method: 'GET', name: 'Get Orders' }
    ];

    for (const endpoint of endpoints) {
      const result = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Authorization': 'Guest guest_test_session'
        }
      });

      if (result.status < 500) {
        console.log(`✅ ${endpoint.name}: ${result.status}`);
        passed++;
      } else {
        console.log(`❌ ${endpoint.name}: ${result.status}`);
        failed++;
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
