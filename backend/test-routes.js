/**
 * Comprehensive Route Testing Script
 * Tests all API endpoints to ensure no breaking changes
 */

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Test configuration
const tests = {
  public: [
    { method: 'GET', path: '/api/health/ping', expectSuccess: true },
    { method: 'GET', path: '/api/products', expectSuccess: true },
    { method: 'GET', path: '/api/csrf/token', expectSuccess: true },
    { method: 'GET', path: '/api/products-attributes/categories', expectSuccess: true },
  ],
  
  authRequired: [
    { method: 'GET', path: '/api/cart', expectStatus: [200, 401] },
    { method: 'GET', path: '/api/wishlist', expectStatus: [200, 401] },
    { method: 'GET', path: '/api/orders', expectStatus: [200, 401] },
    { method: 'GET', path: '/api/user/profile', expectStatus: [200, 401] },
  ],
  
  adminRequired: [
    { method: 'GET', path: '/api/health', expectStatus: [200, 401, 403] },
    { method: 'GET', path: '/api/customers', expectStatus: [200, 401, 403] },
    { method: 'GET', path: '/api/analytics', expectStatus: [200, 401, 403] },
  ]
};

async function testRoute(test) {
  try {
    const response = await fetch(`${BASE_URL}${test.path}`, {
      method: test.method
    });
    
    const data = await response.json();
    
    return {
      path: test.path,
      method: test.method,
      status: response.status,
      success: data.success !== undefined ? data.success : null,
      passed: test.expectSuccess 
        ? data.success === true 
        : test.expectStatus.includes(response.status)
    };
  } catch (error) {
    return {
      path: test.path,
      method: test.method,
      error: error.message,
      passed: false
    };
  }
}

async function runTests() {
  console.log('🧪 Starting comprehensive route tests...\n');
  
  const results = {
    public: [],
    authRequired: [],
    adminRequired: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };
  
  // Test public routes
  console.log('📖 Testing PUBLIC routes...');
  for (const test of tests.public) {
    const result = await testRoute(test);
    results.public.push(result);
    results.summary.total++;
    if (result.passed) {
      results.summary.passed++;
      console.log(`  ✅ ${test.method} ${test.path}`);
    } else {
      results.summary.failed++;
      console.log(`  ❌ ${test.method} ${test.path} - ${result.error || 'Failed'}`);
    }
  }
  
  // Test auth-required routes
  console.log('\n🔒 Testing AUTH-REQUIRED routes...');
  for (const test of tests.authRequired) {
    const result = await testRoute(test);
    results.authRequired.push(result);
    results.summary.total++;
    if (result.passed) {
      results.summary.passed++;
      console.log(`  ✅ ${test.method} ${test.path} (Status: ${result.status})`);
    } else {
      results.summary.failed++;
      console.log(`  ❌ ${test.method} ${test.path} - ${result.error || 'Failed'}`);
    }
  }
  
  // Test admin-required routes
  console.log('\n🔐 Testing ADMIN-REQUIRED routes...');
  for (const test of tests.adminRequired) {
    const result = await testRoute(test);
    results.adminRequired.push(result);
    results.summary.total++;
    if (result.passed) {
      results.summary.passed++;
      console.log(`  ✅ ${test.method} ${test.path} (Status: ${result.status})`);
    } else {
      results.summary.failed++;
      console.log(`  ❌ ${test.method} ${test.path} - ${result.error || 'Failed'}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  
  if (results.summary.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - NO BREAKING CHANGES!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - REVIEW RESULTS ABOVE');
  }
  
  return results;
}

// Run tests
runTests().catch(console.error);
