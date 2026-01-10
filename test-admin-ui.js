#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let testResults = {
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
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testOrdersManagement(token) {
  console.log('\n📋 ORDERS MANAGEMENT');
  
  try {
    // Get orders list
    const ordersRes = await makeRequest('GET', '/api/orders-management/admin/list', null, token);
    logTest('Fetch orders list', ordersRes.status === 200, `Status: ${ordersRes.status}`);

    if (ordersRes.body.data?.length > 0) {
      const orderId = ordersRes.body.data[0]._id;
      
      // Update order status
      const statusRes = await makeRequest(
        'PUT',
        `/api/orders-management/admin/${orderId}/status`,
        { status: 'processing' },
        token
      );
      logTest('Update order status', statusRes.status === 200, `Status: ${statusRes.status}`);

      // Add order note
      const noteRes = await makeRequest(
        'POST',
        `/api/orders-management/admin/${orderId}/notes`,
        { note: 'Test note', noteType: 'admin' },
        token
      );
      logTest('Add order note', noteRes.status === 200, `Status: ${noteRes.status}`);

      // Update tracking
      const trackingRes = await makeRequest(
        'PUT',
        `/api/orders-management/admin/${orderId}/tracking`,
        {
          trackingNumber: 'TRK123456',
          carrier: 'DHL',
          trackingUrl: 'https://tracking.dhl.com',
          estimatedDelivery: '2025-01-15'
        },
        token
      );
      logTest('Update tracking info', trackingRes.status === 200, `Status: ${trackingRes.status}`);

      // Generate invoice
      const invoiceRes = await makeRequest(
        'POST',
        `/api/orders-management/admin/${orderId}/invoice`,
        {},
        token
      );
      logTest('Generate invoice', invoiceRes.status === 200, `Status: ${invoiceRes.status}`);
    }

    // Get order stats
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const statsRes = await makeRequest(
      'GET',
      `/api/orders-management/admin/stats?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`,
      null,
      token
    );
    logTest('Fetch order stats', statsRes.status === 200, `Status: ${statsRes.status}`);

  } catch (error) {
    logTest('Orders management', false, error.message);
  }
}

async function testProductAttributes(token) {
  console.log('\n🏷️  PRODUCT ATTRIBUTES');
  
  try {
    // Get products
    const productsRes = await makeRequest('GET', '/api/products', null, token);
    logTest('Fetch products', productsRes.status === 200, `Status: ${productsRes.status}`);

    if (productsRes.body.data?.length > 0) {
      const productId = productsRes.body.data[0]._id;

      // Update sizes
      const sizesRes = await makeRequest(
        'PUT',
        `/api/product-attributes/${productId}/sizes`,
        { sizes: ['XS', 'S', 'M', 'L', 'XL'] },
        token
      );
      logTest('Update product sizes', sizesRes.status === 200, `Status: ${sizesRes.status}`);

      // Update colors
      const colorsRes = await makeRequest(
        'PUT',
        `/api/product-attributes/${productId}/colors`,
        { colors: ['Red', 'Blue', 'Green', 'Black'] },
        token
      );
      logTest('Update product colors', colorsRes.status === 200, `Status: ${colorsRes.status}`);

      // Update stock
      const stockRes = await makeRequest(
        'PUT',
        `/api/product-attributes/${productId}/stock`,
        { stock: 100 },
        token
      );
      logTest('Update product stock', stockRes.status === 200, `Status: ${stockRes.status}`);

      // Update SEO
      const seoRes = await makeRequest(
        'PUT',
        `/api/product-attributes/${productId}/seo`,
        {
          metaTitle: 'Test Product',
          metaDescription: 'Test description',
          metaKeywords: 'test,product',
          slug: 'test-product'
        },
        token
      );
      logTest('Update product SEO', seoRes.status === 200, `Status: ${seoRes.status}`);

      // Create variant
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
      logTest('Create product variant', variantRes.status === 200, `Status: ${variantRes.status}`);

      // Update images
      const imagesRes = await makeRequest(
        'PUT',
        `/api/product-attributes/${productId}/images`,
        {
          main: 'https://example.com/main.jpg',
          alt1: 'https://example.com/alt1.jpg',
          thumbnail: 'https://example.com/thumb.jpg'
        },
        token
      );
      logTest('Update product images', imagesRes.status === 200, `Status: ${imagesRes.status}`);
    }

  } catch (error) {
    logTest('Product attributes', false, error.message);
  }
}

async function testSettings(token) {
  console.log('\n⚙️  SETTINGS MANAGEMENT');
  
  try {
    // Update store info
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
    logTest('Update store info', storeRes.status === 200, `Status: ${storeRes.status}`);

    // Update social media
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
    logTest('Update social media', socialRes.status === 200, `Status: ${socialRes.status}`);

    // Update payment methods
    const paymentRes = await makeRequest(
      'PUT',
      '/api/settings/payment-methods',
      {
        methods: [
          { name: 'Credit Card', enabled: true },
          { name: 'Bank Transfer', enabled: true },
          { name: 'Cash on Delivery', enabled: true }
        ]
      },
      token
    );
    logTest('Update payment methods', paymentRes.status === 200, `Status: ${paymentRes.status}`);

    // Update shipping rates
    const shippingRes = await makeRequest(
      'PUT',
      '/api/settings/shipping-rates',
      {
        rates: [
          { minAmount: 0, maxAmount: 500, rate: 50 },
          { minAmount: 500, maxAmount: 1000, rate: 30 },
          { minAmount: 1000, maxAmount: Infinity, rate: 0 }
        ]
      },
      token
    );
    logTest('Update shipping rates', shippingRes.status === 200, `Status: ${shippingRes.status}`);

    // Update currency
    const currencyRes = await makeRequest(
      'PUT',
      '/api/settings/currency',
      { currency: 'PKR', taxRate: 17 },
      token
    );
    logTest('Update currency', currencyRes.status === 200, `Status: ${currencyRes.status}`);

  } catch (error) {
    logTest('Settings management', false, error.message);
  }
}

async function testAuthorization() {
  console.log('\n🔐 AUTHORIZATION CHECKS');
  
  try {
    // No token
    const noTokenRes = await makeRequest('GET', '/api/orders-management/admin/list');
    logTest('Reject without token', noTokenRes.status === 401 || noTokenRes.status === 403, `Status: ${noTokenRes.status}`);

    // Invalid token
    const invalidRes = await makeRequest('GET', '/api/orders-management/admin/list', null, 'invalid_token');
    logTest('Reject invalid token', invalidRes.status === 401 || invalidRes.status === 403, `Status: ${invalidRes.status}`);

  } catch (error) {
    logTest('Authorization checks', false, error.message);
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

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         ADMIN PANEL FUNCTIONALITY TEST SUITE               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nBackend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);

  const token = await testAdminLogin();
  
  if (!token) {
    console.log('\n⚠️  Cannot proceed without admin token');
    console.log('Make sure backend is running and admin user exists\n');
    process.exit(1);
  }

  await testOrdersManagement(token);
  await testProductAttributes(token);
  await testSettings(token);
  await testAuthorization();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(`Total:   ${testResults.passed + testResults.failed}\n`);

  if (testResults.failed > 0) {
    console.log('Failed tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.details}`);
    });
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

runAllTests().catch(console.error);
