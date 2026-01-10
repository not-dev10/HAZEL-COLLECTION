#!/usr/bin/env node

/**
 * Test script to verify wishlist functionality is working
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
  console.log('🧪 WISHLIST FUNCTIONALITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sessionId = `guest_test_${Date.now()}`;
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Get empty wishlist
    console.log('📋 TEST 1: Get Empty Wishlist');
    const getEmptyResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (getEmptyResult.status === 200 && Array.isArray(getEmptyResult.body.items)) {
      console.log('✅ PASS: Empty wishlist retrieved');
      console.log(`   Items: ${getEmptyResult.body.items.length}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not retrieve empty wishlist');
      console.log(`   Status: ${getEmptyResult.status}`);
      failed++;
    }

    // Test 2: Add first item
    console.log('\n🛍️  TEST 2: Add First Item to Wishlist');
    const addFirstResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/add',
      method: 'POST',
      headers: {
        'Authorization': `Guest ${sessionId}`,
        'Content-Type': 'application/json'
      }
    }, {
      id: '1',
      name: 'Test Product 1',
      price: 100,
      image: 'test1.jpg'
    });

    if (addFirstResult.status === 201 && addFirstResult.body.wishlist.items.length === 1) {
      console.log('✅ PASS: First item added to wishlist');
      console.log(`   Items in wishlist: ${addFirstResult.body.wishlist.items.length}`);
      console.log(`   Item: ${addFirstResult.body.wishlist.items[0].name}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not add first item');
      console.log(`   Status: ${addFirstResult.status}`);
      console.log(`   Response:`, addFirstResult.body);
      failed++;
    }

    // Test 3: Add second item
    console.log('\n🛍️  TEST 3: Add Second Item to Wishlist');
    const addSecondResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/add',
      method: 'POST',
      headers: {
        'Authorization': `Guest ${sessionId}`,
        'Content-Type': 'application/json'
      }
    }, {
      id: '2',
      name: 'Test Product 2',
      price: 200,
      image: 'test2.jpg'
    });

    if (addSecondResult.status === 201 && addSecondResult.body.wishlist.items.length === 2) {
      console.log('✅ PASS: Second item added to wishlist');
      console.log(`   Items in wishlist: ${addSecondResult.body.wishlist.items.length}`);
      console.log(`   Items: ${addSecondResult.body.wishlist.items.map(i => i.name).join(', ')}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not add second item');
      console.log(`   Status: ${addSecondResult.status}`);
      failed++;
    }

    // Test 4: Verify items persist (GET)
    console.log('\n✔️  TEST 4: Verify Items Persist in Database');
    const getPersistedResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (getPersistedResult.status === 200 && getPersistedResult.body.items.length === 2) {
      console.log('✅ PASS: Items persisted in database');
      console.log(`   Items retrieved: ${getPersistedResult.body.items.length}`);
      console.log(`   Items: ${getPersistedResult.body.items.map(i => i.name).join(', ')}`);
      passed++;
    } else {
      console.log('❌ FAIL: Items did not persist');
      console.log(`   Status: ${getPersistedResult.status}`);
      console.log(`   Items: ${getPersistedResult.body.items?.length || 0}`);
      failed++;
    }

    // Test 5: Remove item
    console.log('\n🗑️  TEST 5: Remove Item from Wishlist');
    const removeResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/remove/1',
      method: 'DELETE',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (removeResult.status === 200 && removeResult.body.wishlist.items.length === 1) {
      console.log('✅ PASS: Item removed from wishlist');
      console.log(`   Items remaining: ${removeResult.body.wishlist.items.length}`);
      console.log(`   Remaining item: ${removeResult.body.wishlist.items[0].name}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not remove item');
      console.log(`   Status: ${removeResult.status}`);
      failed++;
    }

    // Test 6: Verify removal persisted
    console.log('\n✔️  TEST 6: Verify Removal Persisted');
    const getAfterRemoveResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (getAfterRemoveResult.status === 200 && getAfterRemoveResult.body.items.length === 1) {
      console.log('✅ PASS: Removal persisted in database');
      console.log(`   Items: ${getAfterRemoveResult.body.items.length}`);
      passed++;
    } else {
      console.log('❌ FAIL: Removal did not persist');
      console.log(`   Items: ${getAfterRemoveResult.body.items?.length || 0}`);
      failed++;
    }

    // Test 7: Clear wishlist
    console.log('\n🧹 TEST 7: Clear Wishlist');
    const clearResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/clear',
      method: 'DELETE',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (clearResult.status === 200 && clearResult.body.wishlist.items.length === 0) {
      console.log('✅ PASS: Wishlist cleared');
      console.log(`   Items: ${clearResult.body.wishlist.items.length}`);
      passed++;
    } else {
      console.log('❌ FAIL: Could not clear wishlist');
      console.log(`   Status: ${clearResult.status}`);
      failed++;
    }

    // Test 8: Verify clear persisted
    console.log('\n✔️  TEST 8: Verify Clear Persisted');
    const getAfterClearResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: {
        'Authorization': `Guest ${sessionId}`
      }
    });

    if (getAfterClearResult.status === 200 && getAfterClearResult.body.items.length === 0) {
      console.log('✅ PASS: Clear persisted in database');
      console.log(`   Items: ${getAfterClearResult.body.items.length}`);
      passed++;
    } else {
      console.log('❌ FAIL: Clear did not persist');
      console.log(`   Items: ${getAfterClearResult.body.items?.length || 0}`);
      failed++;
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
    console.log('🎉 ALL TESTS PASSED! Wishlist is working correctly.\n');
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
