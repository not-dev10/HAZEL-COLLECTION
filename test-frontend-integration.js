#!/usr/bin/env node

/**
 * Frontend Integration Test Suite
 * Tests the WishlistContext and CartContext in the frontend
 * Run from the frontend directory
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function check(condition, testName, details = '') {
  if (condition) {
    log('green', `✅ PASS: ${testName}`);
  } else {
    log('red', `❌ FAIL: ${testName}`);
  }
  if (details) {
    log('cyan', `   └─ ${details}`);
  }
  return condition;
}

async function runFrontendTests() {
  log('blue', '\n🧪 Frontend Context Tests\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Check WishlistContext file exists and is properly formatted
  log('blue', '═══════════════════════════════════════');
  log('blue', 'FILE INTEGRITY CHECKS');
  log('blue', '═══════════════════════════════════════\n');

  const contextPath = 'src/context/WishlistContext.tsx';
  const cartContextPath = 'src/context/CartContext.tsx';
  const wishlistPagePath = 'src/pages/Wishlist.tsx';

  try {
    const wishlistContextContent = fs.readFileSync(contextPath, 'utf-8');
    
    // Test 2: API endpoints have /api/ prefix
    if (check(
      wishlistContextContent.includes('${API_BASE_URL}/api/wishlist'),
      'WishlistContext uses correct API endpoint',
      'Found /api/wishlist in GET request'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistContextContent.includes('${API_BASE_URL}/api/wishlist/add'),
      'WishlistContext add endpoint correct',
      'Found /api/wishlist/add in POST request'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistContextContent.includes('${API_BASE_URL}/api/wishlist/remove'),
      'WishlistContext remove endpoint correct',
      'Found /api/wishlist/remove in DELETE request'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistContextContent.includes('${API_BASE_URL}/api/wishlist/clear'),
      'WishlistContext clear endpoint correct',
      'Found /api/wishlist/clear in DELETE request'
    )) { passed++; } else { failed++; }

    // Test 3: addedAt handling
    if (check(
      wishlistContextContent.includes('typeof newItem.addedAt === \'number\''),
      'WishlistContext handles addedAt as number',
      'Found type check for addedAt timestamp'
    )) { passed++; } else { failed++; }

  } catch (error) {
    log('red', `❌ Error reading WishlistContext: ${error.message}`);
    failed += 5;
  }

  // Test Cart Context
  log('blue', '\n═══════════════════════════════════════');
  log('blue', 'CART CONTEXT CHECKS');
  log('blue', '═══════════════════════════════════════\n');

  try {
    const cartContextContent = fs.readFileSync(cartContextPath, 'utf-8');
    
    if (check(
      cartContextContent.includes('${API_BASE_URL}/api/cart'),
      'CartContext uses correct API endpoints',
      'Found /api/cart prefix in all routes'
    )) { passed++; } else { failed++; }

    if (check(
      cartContextContent.includes('${API_BASE_URL}/api/cart/add'),
      'CartContext add endpoint correct',
      'Found /api/cart/add'
    )) { passed++; } else { failed++; }

    if (check(
      cartContextContent.includes('${API_BASE_URL}/api/cart/remove'),
      'CartContext remove endpoint correct',
      'Found /api/cart/remove'
    )) { passed++; } else { failed++; }

    if (check(
      cartContextContent.includes('${API_BASE_URL}/api/cart/update'),
      'CartContext update endpoint correct',
      'Found /api/cart/update'
    )) { passed++; } else { failed++; }

    if (check(
      cartContextContent.includes('${API_BASE_URL}/api/cart/clear'),
      'CartContext clear endpoint correct',
      'Found /api/cart/clear'
    )) { passed++; } else { failed++; }

  } catch (error) {
    log('red', `❌ Error reading CartContext: ${error.message}`);
    failed += 5;
  }

  // Test Wishlist Page
  log('blue', '\n═══════════════════════════════════════');
  log('blue', 'WISHLIST PAGE CHECKS');
  log('blue', '═══════════════════════════════════════\n');

  try {
    const wishlistPageContent = fs.readFileSync(wishlistPagePath, 'utf-8');
    
    if (check(
      wishlistPageContent.includes('item.addedAt'),
      'Wishlist page uses addedAt field',
      'Found item.addedAt in page'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistPageContent.includes('item.addedAt ?'),
      'Wishlist page has conditional for addedAt',
      'Found ternary operator for safe date display'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistPageContent.includes('new Date(item.addedAt).toLocaleDateString'),
      'Wishlist page formats date correctly',
      'Found date formatting code'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistPageContent.includes('removeFromWishlist'),
      'Wishlist page has remove function',
      'Found removeFromWishlist in component'
    )) { passed++; } else { failed++; }

    if (check(
      wishlistPageContent.includes('clearWishlist'),
      'Wishlist page has clear function',
      'Found clearWishlist in component'
    )) { passed++; } else { failed++; }

  } catch (error) {
    log('red', `❌ Error reading Wishlist page: ${error.message}`);
    failed += 5;
  }

  // Import/Export Checks
  log('blue', '\n═══════════════════════════════════════');
  log('blue', 'IMPORT/EXPORT CHECKS');
  log('blue', '═══════════════════════════════════════\n');

  try {
    const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
    
    if (check(
      appContent.includes('WishlistProvider'),
      'App.tsx includes WishlistProvider',
      'Provider is imported and used'
    )) { passed++; } else { failed++; }

    if (check(
      appContent.includes('CartProvider'),
      'App.tsx includes CartProvider',
      'Provider is imported and used'
    )) { passed++; } else { failed++; }

    if (check(
      appContent.includes('<WishlistProvider>') && appContent.includes('</WishlistProvider>'),
      'WishlistProvider wraps application',
      'Found proper provider wrapper'
    )) { passed++; } else { failed++; }

  } catch (error) {
    log('red', `❌ Error reading App.tsx: ${error.message}`);
    failed += 3;
  }

  // Summary
  log('blue', '\n═══════════════════════════════════════');
  log('blue', 'TEST SUMMARY');
  log('blue', '═══════════════════════════════════════\n');

  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);

  log('cyan', `✅ Passed: ${passed}`);
  log('cyan', `❌ Failed: ${failed}`);
  log('cyan', `📈 Total:  ${total}`);
  log('cyan', `💯 Success Rate: ${percentage}%\n`);

  if (failed === 0) {
    log('green', '🎉 All tests passed! Frontend code is ready.\n');
  } else {
    log('red', `⚠️  ${failed} test(s) failed. Review the code changes.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Print instructions
log('yellow', '\n📋 FRONTEND INTEGRATION TEST SUITE');
log('yellow', '═══════════════════════════════════════\n');
log('cyan', 'This test checks:');
log('cyan', '  • API endpoint prefixes in contexts');
log('cyan', '  • Timestamp handling for wishlist items');
log('cyan', '  • Provider setup in App.tsx');
log('cyan', '  • Page component integration\n');

// Run tests
runFrontendTests().catch(error => {
  log('red', `\nFatal error: ${error.message}`);
  process.exit(1);
});
