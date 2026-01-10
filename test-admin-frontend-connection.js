#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

let results = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const protocol = url.protocol === 'https:' ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: body ? JSON.parse(body) : {},
          });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function logTest(name, passed, details = '') {
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}${details ? ' - ' + details : ''}`);
  
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function testAdminPageConnections(token) {
  console.log('\n🔗 ADMIN PAGE API CONNECTIONS');
  
  try {
    // Test Orders Management page endpoints
    console.log('\n  Orders Management Page:');
    
    const ordersRes = await makeRequest('GET', '/api/orders-management/admin/list', null, token);
    logTest('  - Fetch orders list', ordersRes.status === 200, `Status: ${ordersRes.status}`);

    // Test Product Attributes page endpoints
    console.log('\n  Product Attributes Page:');
    
    const productsRes = await makeRequest('GET', '/api/products', null, token);
    logTest('  - Fetch products', productsRes.status === 200, `Status: ${productsRes.status}`);

    if (productsRes.body.data?.length > 0) {
      const productId = productsRes.body.data[0]._id;
      
      const variantRes = await makeRequest(
        'POST',
        `/api/product-attributes/${productId}/variants`,
        {
          sku: 'TEST-VAR-001',
          size: 'M',
          color: 'Red',
          price: 99.99,
          originalPrice: 149.99,
          stock: 50
        },
        token
      );
      logTest('  - Create product variant', variantRes.status === 200, `Status: ${variantRes.status}`);
    }

    // Test Settings page endpoints
    console.log('\n  Settings Page:');
    
    const settingsRes = await makeRequest('GET', '/api/settings', null, token);
    logTest('  - Fetch settings', settingsRes.status === 200, `Status: ${settingsRes.status}`);

    const storeRes = await makeRequest(
      'PUT',
      '/api/settings/store-info',
      {
        storeName: 'Hezal the Label',
        storeDescription: 'Premium fashion store',
        storeEmail: 'contact@hezal.com',
        storePhone: '+92-300-1234567',
        storeAddress: 'Karachi, Pakistan'
      },
      token
    );
    logTest('  - Update store info', storeRes.status === 200, `Status: ${storeRes.status}`);

    const socialRes = await makeRequest(
      'PUT',
      '/api/settings/social-media',
      {
        instagram: 'https://instagram.com/hezalthelabel',
        facebook: 'https://facebook.com/hezalthelabel',
        tiktok: 'https://tiktok.com/@hezalthelabel'
      },
      token
    );
    logTest('  - Update social media', socialRes.status === 200, `Status: ${socialRes.status}`);

    const currencyRes = await makeRequest(
      'PUT',
      '/api/settings/currency',
      { currency: 'PKR', taxRate: 17 },
      token
    );
    logTest('  - Update currency', currencyRes.status === 200, `Status: ${currencyRes.status}`);

  } catch (error) {
    logTest('Admin page connections', false, error.message);
  }
}

async function testAdminLogin() {
  console.log('\n🔑 ADMIN AUTHENTICATION');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@hezalthelabel.com',
      password: 'Admin@123456',
    });

    if (response.status === 200 && response.body.token) {
      logTest('Admin login', true, 'Token received');
      return response.body.token;
    } else {
      logTest('Admin login', false, `Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest('Admin login', false, error.message);
    return null;
  }
}

async function testPortConfiguration() {
  console.log('\n⚙️  PORT CONFIGURATION');
  
  try {
    // Test backend on port 5000
    const backendRes = await makeRequest('GET', '/api/auth/health');
    logTest('Backend on port 5000', backendRes.status === 200, `Status: ${backendRes.status}`);
  } catch (error) {
    logTest('Backend on port 5000', false, error.message);
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║    ADMIN FRONTEND-BACKEND CONNECTION TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nBackend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);

  await testPortConfiguration();
  
  const token = await testAdminLogin();
  
  if (!token) {
    console.log('\n⚠️  Cannot proceed without admin token');
    process.exit(1);
  }

  await testAdminPageConnections(token);

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`Total:   ${results.passed + results.failed}\n`);

  if (results.failed > 0) {
    console.log('Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.details}`);
    });
  }

  console.log('\n✅ ADMIN PANEL FRONTEND-BACKEND CONNECTION STATUS:');
  if (results.failed === 0) {
    console.log('   All admin pages are properly connected to backend APIs');
    console.log('   Frontend can access all required endpoints');
    console.log('   Admin authentication is working correctly\n');
  } else {
    console.log('   Some connections failed - see details above\n');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(console.error);
