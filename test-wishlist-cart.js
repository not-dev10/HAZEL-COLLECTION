#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Cart & Wishlist Functionality
 * Tests both guest and authenticated user flows
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const USE_HTTPS = API_BASE_URL.startsWith('https');
const client = USE_HTTPS ? https : http;

// Test data
const testProduct = {
  id: 'test-product-1',
  name: 'Test Product',
  price: 99.99,
  quantity: 1,
  image: 'https://via.placeholder.com/300',
  size: 'M',
  color: 'Black'
};

const testProduct2 = {
  id: 'test-product-2',
  name: 'Another Product',
  price: 149.99,
  quantity: 2,
  image: 'https://via.placeholder.com/300',
  size: 'L',
  color: 'White'
};

// Test state
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to parse URL
function parseUrl(url) {
  const urlObj = new URL(url);
  return {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    protocol: urlObj.protocol
  };
}

// Helper function for HTTP requests
function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const urlParts = parseUrl(url);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Guest guest_test_${Date.now()}`,
      ...headers
    };

    const options = {
      hostname: urlParts.hostname,
      port: urlParts.port,
      path: urlParts.path,
      method: method,
      headers: defaultHeaders
    };

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: { raw: responseData }
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test logger
function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) {
    console.log(`   └─ ${details}`);
  }
  
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test suite
async function runTests() {
  console.log('🧪 Starting Cart & Wishlist Test Suite\n');
  console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

  try {
    // CART TESTS
    console.log('═══════════════════════════════════════');
    console.log('🛒 CART TESTS');
    console.log('═══════════════════════════════════════\n');

    // Test 1: Get empty cart
    console.log('Test 1: Get empty cart');
    let response = await makeRequest('GET', '/api/cart');
    logTest('GET /api/cart returns 200', response.status === 200, `Status: ${response.status}`);
    logTest('Empty cart returns items array', Array.isArray(response.body.items), `Items: ${JSON.stringify(response.body.items)}`);

    // Test 2: Add item to cart
    console.log('\nTest 2: Add item to cart');
    response = await makeRequest('POST', '/api/cart/add', testProduct);
    logTest('POST /api/cart/add returns 201', response.status === 201, `Status: ${response.status}`);
    logTest('Item added successfully', response.body.message === 'Item added to cart', `Message: ${response.body.message}`);
    logTest('Cart contains item', response.body.cart?.items?.length > 0, `Items count: ${response.body.cart?.items?.length}`);

    // Test 3: Verify item in cart
    console.log('\nTest 3: Verify item in cart');
    response = await makeRequest('GET', '/api/cart');
    const cartHasItem = response.body.items?.some(item => item.id === testProduct.id);
    logTest('Added item appears in cart', cartHasItem, `Items: ${response.body.items?.map(i => i.id).join(', ')}`);
    logTest('Item price is correct', response.body.items?.[0]?.price === testProduct.price, `Price: ${response.body.items?.[0]?.price}`);

    // Test 4: Add second item
    console.log('\nTest 4: Add second item');
    response = await makeRequest('POST', '/api/cart/add', testProduct2);
    logTest('Second item added', response.status === 201, `Status: ${response.status}`);
    logTest('Cart now has 2 items', response.body.cart?.items?.length === 2, `Items count: ${response.body.cart?.items?.length}`);

    // Test 5: Update item quantity
    console.log('\nTest 5: Update item quantity');
    response = await makeRequest('PUT', `/api/cart/update/${testProduct.id}`, { quantity: 3 });
    logTest('PUT /api/cart/update returns 200', response.status === 200, `Status: ${response.status}`);
    const updatedItem = response.body.cart?.items?.find(item => item.id === testProduct.id);
    logTest('Quantity updated correctly', updatedItem?.quantity === 3, `Quantity: ${updatedItem?.quantity}`);

    // Test 6: Verify cart total
    console.log('\nTest 6: Verify cart total');
    response = await makeRequest('GET', '/api/cart');
    const expectedTotal = (testProduct.price * 3) + testProduct2.price;
    logTest('Cart total calculated correctly', response.body.total === expectedTotal, `Total: ${response.body.total}, Expected: ${expectedTotal}`);
    logTest('Item count is correct', response.body.itemCount === 5, `Item count: ${response.body.itemCount}`);

    // Test 7: Remove item from cart
    console.log('\nTest 7: Remove item from cart');
    response = await makeRequest('DELETE', `/api/cart/remove/${testProduct.id}`);
    logTest('DELETE /api/cart/remove returns 200', response.status === 200, `Status: ${response.status}`);
    const itemExists = response.body.cart?.items?.some(item => item.id === testProduct.id);
    logTest('Item removed from cart', !itemExists, `Item still exists: ${itemExists}`);
    logTest('Only one item remains', response.body.cart?.items?.length === 1, `Items count: ${response.body.cart?.items?.length}`);

    // Test 8: Clear cart
    console.log('\nTest 8: Clear cart');
    response = await makeRequest('DELETE', '/api/cart/clear');
    logTest('DELETE /api/cart/clear returns 200', response.status === 200, `Status: ${response.status}`);
    logTest('Cart cleared successfully', response.body.cart?.items?.length === 0, `Items count: ${response.body.cart?.items?.length}`);
    logTest('Total is zero', response.body.cart?.total === 0, `Total: ${response.body.cart?.total}`);

    // WISHLIST TESTS
    console.log('\n═══════════════════════════════════════');
    console.log('❤️ WISHLIST TESTS');
    console.log('═══════════════════════════════════════\n');

    // Test 9: Get empty wishlist
    console.log('Test 9: Get empty wishlist');
    response = await makeRequest('GET', '/api/wishlist');
    logTest('GET /api/wishlist returns 200', response.status === 200, `Status: ${response.status}`);
    logTest('Empty wishlist returns items array', Array.isArray(response.body.items), `Items: ${JSON.stringify(response.body.items)}`);

    // Test 10: Add item to wishlist
    console.log('\nTest 10: Add item to wishlist');
    response = await makeRequest('POST', '/api/wishlist/add', {
      id: testProduct.id,
      name: testProduct.name,
      price: testProduct.price,
      image: testProduct.image
    });
    logTest('POST /api/wishlist/add returns 201', response.status === 201, `Status: ${response.status}`);
    logTest('Item added to wishlist', response.body.message === 'Item added to wishlist', `Message: ${response.body.message}`);
    logTest('Wishlist contains item', response.body.wishlist?.items?.length > 0, `Items count: ${response.body.wishlist?.items?.length}`);

    // Test 11: Verify addedAt timestamp
    console.log('\nTest 11: Verify addedAt timestamp');
    response = await makeRequest('GET', '/api/wishlist');
    const wishlistItem = response.body.items?.[0];
    logTest('Item has addedAt field', wishlistItem?.addedAt !== undefined && wishlistItem?.addedAt !== null, `addedAt: ${wishlistItem?.addedAt}`);
    logTest('addedAt is a number', typeof wishlistItem?.addedAt === 'number', `Type: ${typeof wishlistItem?.addedAt}`);
    logTest('addedAt is valid timestamp', wishlistItem?.addedAt > 0 && wishlistItem?.addedAt < Date.now() + 1000, `Timestamp: ${wishlistItem?.addedAt}`);

    // Test 12: Add second item to wishlist
    console.log('\nTest 12: Add second item to wishlist');
    response = await makeRequest('POST', '/api/wishlist/add', {
      id: testProduct2.id,
      name: testProduct2.name,
      price: testProduct2.price,
      image: testProduct2.image
    });
    logTest('Second item added', response.status === 201, `Status: ${response.status}`);
    logTest('Wishlist has 2 items', response.body.wishlist?.items?.length === 2, `Items count: ${response.body.wishlist?.items?.length}`);

    // Test 13: Verify wishlist count
    console.log('\nTest 13: Verify wishlist count');
    response = await makeRequest('GET', '/api/wishlist');
    logTest('Wishlist count is correct', response.body.count === 2, `Count: ${response.body.count}`);
    logTest('Items array length matches count', response.body.items?.length === response.body.count, `Array length: ${response.body.items?.length}`);

    // Test 14: Remove item from wishlist
    console.log('\nTest 14: Remove item from wishlist');
    response = await makeRequest('DELETE', `/api/wishlist/remove/${testProduct.id}`);
    logTest('DELETE /api/wishlist/remove returns 200', response.status === 200, `Status: ${response.status}`);
    const wishlistItemExists = response.body.wishlist?.items?.some(item => item.id === testProduct.id);
    logTest('Item removed from wishlist', !wishlistItemExists, `Item still exists: ${wishlistItemExists}`);
    logTest('One item remains', response.body.wishlist?.items?.length === 1, `Items count: ${response.body.wishlist?.items?.length}`);

    // Test 15: Clear wishlist
    console.log('\nTest 15: Clear wishlist');
    response = await makeRequest('DELETE', '/api/wishlist/clear');
    logTest('DELETE /api/wishlist/clear returns 200', response.status === 200, `Status: ${response.status}`);
    logTest('Wishlist cleared successfully', response.body.wishlist?.items?.length === 0, `Items count: ${response.body.wishlist?.items?.length}`);
    logTest('Count is zero', response.body.wishlist?.count === 0, `Count: ${response.body.wishlist?.count}`);

    // INTEGRATION TESTS
    console.log('\n═══════════════════════════════════════');
    console.log('🔗 INTEGRATION TESTS');
    console.log('═══════════════════════════════════════\n');

    // Test 16: Cart and Wishlist independence
    console.log('Test 16: Cart and Wishlist independence');
    await makeRequest('POST', '/api/cart/add', testProduct);
    await makeRequest('POST', '/api/wishlist/add', testProduct2);
    
    let cartResp = await makeRequest('GET', '/api/cart');
    let wishlistResp = await makeRequest('GET', '/api/wishlist');
    
    const cartHasProduct1 = cartResp.body.items?.some(item => item.id === testProduct.id);
    const wishlistHasProduct2 = wishlistResp.body.items?.some(item => item.id === testProduct2.id);
    const cartDoesntHaveProduct2 = !cartResp.body.items?.some(item => item.id === testProduct2.id);
    const wishlistDoesntHaveProduct1 = !wishlistResp.body.items?.some(item => item.id === testProduct.id);
    
    logTest('Cart and wishlist are separate', 
      cartHasProduct1 && wishlistHasProduct2 && cartDoesntHaveProduct2 && wishlistDoesntHaveProduct1,
      `Cart items: ${cartResp.body.items?.map(i => i.id).join(', ')}, Wishlist items: ${wishlistResp.body.items?.map(i => i.id).join(', ')}`
    );

    // Test 17: API response format consistency
    console.log('\nTest 17: API response format consistency');
    response = await makeRequest('GET', '/api/cart');
    const hasRequiredCartFields = response.body.items !== undefined && response.body.itemCount !== undefined && response.body.total !== undefined;
    logTest('Cart response has required fields', hasRequiredCartFields, `Fields: items, itemCount, total`);

    response = await makeRequest('GET', '/api/wishlist');
    const hasRequiredWishlistFields = response.body.items !== undefined && response.body.count !== undefined;
    logTest('Wishlist response has required fields', hasRequiredWishlistFields, `Fields: items, count`);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    logTest('Test execution', false, error.message);
  }

  // Print summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════\n');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.passed + testResults.failed}`);
  console.log(`💯 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%\n`);

  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  • ${t.name}`);
      if (t.details) console.log(`    ${t.details}`);
    });
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
