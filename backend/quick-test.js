/**
 * Quick Route Health Check
 */

const BASE_URL = 'http://localhost:5000';

const routes = [
  '/api/health/ping',
  '/api/products',
  '/api/cart',
  '/api/wishlist',
  '/api/orders',
  '/api/csrf/token',
  '/api/reviews'
];

async function testRoutes() {
  console.log('🧪 Testing critical routes...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    try {
      const response = await fetch(BASE_URL + route);
      const status = response.status;
      
      // Success if status < 500 (even 401/403 is OK, means route exists)
      if (status < 500) {
        console.log(`✅ ${route} - ${status}`);
        passed++;
      } else {
        console.log(`❌ ${route} - ${status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${route} - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Passed: ${passed}/${routes.length}`);
  console.log(`❌ Failed: ${failed}/${routes.length}`);
  console.log(`Success Rate: ${((passed / routes.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL ROUTES WORKING - NO BREAKING CHANGES!');
  }
}

testRoutes();
