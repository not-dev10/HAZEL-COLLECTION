#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Test data
let adminToken = null;
let testProductId = null;
let testOrderId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const protocol = url.protocol === 'https:' ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
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

// Test functions
async function testAdminLogin() {
  console.log('\n=== Testing Admin Login ===');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123',
    });

    if (response.status === 200 && response.body.token) {
      adminToken = response.body.token;
      console.log('✓ Admin login successful');
      console.log(`  Token: ${adminToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('✗ Admin login failed');
      console.log(`  Status: ${response.status}`);
      console.log(`  Response:`, response.body);
      return false;
    }
  } catch (error) {
    console.log('✗ Admin login error:', error.message);
    return false;
  }
}

async function testOrdersManagement() {
  console.log('\n=== Testing Orders Management ===');
  
  try {
    // Get all orders
    console.log('\n1. Fetching all orders...');
    const ordersResponse = await makeRequest('GET', '/api/orders/admin/list', null, adminToken);
    
    if (ordersResponse.status === 200) {
      console.log(`✓ Orders fetched successfully`);
      console.log(`  Total orders: ${ordersResponse.body.data?.length || 0}`);
      
      if (ordersResponse.body.data && ordersResponse.body.data.length > 0) {
        testOrderId = ordersResponse.body.data[0]._id;
        console.log(`  First order ID: ${testOrderId}`);
      }
    } else {
      console.log(`✗ Failed to fetch orders (Status: ${ordersResponse.status})`);
    }

    // Get order stats
    console.log('\n2. Fetching order statistics...');
    const statsResponse = await makeRequest('GET', '/api/orders/admin/stats', null, adminToken);
    
    if (statsResponse.status === 200) {
      console.log('✓ Order stats fetched successfully');
      console.log(`  Stats:`, statsResponse.body.data);
    } else {
      console.log(`✗ Failed to fetch stats (Status: ${statsResponse.status})`);
    }

    // Update order status (if we have an order)
    if (testOrderId) {
      console.log('\n3. Testing order status update...');
      const updateResponse = await makeRequest(
        'PUT',
        `/api/orders/admin/${testOrderId}/status`,
        { status: 'processing' },
        adminToken
      );

      if (updateResponse.status === 200) {
        console.log('✓ Order status updated successfully');
      } else {
        console.log(`✗ Failed to update order status (Status: ${updateResponse.status})`);
      }

      // Add order note
      console.log('\n4. Testing add order note...');
      const noteResponse = await makeRequest(
        'POST',
        `/api/orders/admin/${testOrderId}/notes`,
        { note: 'Test note from admin panel' },
        adminToken
      );

      if (noteResponse.status === 200) {
        console.log('✓ Order note added successfully');
      } else {
        console.log(`✗ Failed to add order note (Status: ${noteResponse.status})`);
      }
    }

  } catch (error) {
    console.log('✗ Orders management error:', error.message);
  }
}

async function testProductAttributes() {
  console.log('\n=== Testing Product Attributes Management ===');
  
  try {
    // Get a product first
    console.log('\n1. Fetching products...');
    const productsResponse = await makeRequest('GET', '/api/products', null, adminToken);
    
    if (productsResponse.status === 200 && productsResponse.body.data?.length > 0) {
      testProductId = productsResponse.body.data[0]._id;
      console.log(`✓ Product found: ${testProductId}`);

      // Update product sizes
      console.log('\n2. Testing update product sizes...');
      const sizesResponse = await makeRequest(
        'PUT',
        `/api/product-attributes/${testProductId}/sizes`,
        { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        adminToken
      );

      if (sizesResponse.status === 200) {
        console.log('✓ Product sizes updated successfully');
      } else {
        console.log(`✗ Failed to update sizes (Status: ${sizesResponse.status})`);
      }

      // Update product colors
      console.log('\n3. Testing update product colors...');
      const colorsResponse = await makeRequest(
        'PUT',
        `/api/product-attributes/${testProductId}/colors`,
        { colors: ['Red', 'Blue', 'Green', 'Black', 'White'] },
        adminToken
      );

      if (colorsResponse.status === 200) {
        console.log('✓ Product colors updated successfully');
      } else {
        console.log(`✗ Failed to update colors (Status: ${colorsResponse.status})`);
      }

      // Update stock
      console.log('\n4. Testing update product stock...');
      const stockResponse = await makeRequest(
        'PUT',
        `/api/product-attributes/${testProductId}/stock`,
        { stock: 100 },
        adminToken
      );

      if (stockResponse.status === 200) {
        console.log('✓ Product stock updated successfully');
      } else {
        console.log(`✗ Failed to update stock (Status: ${stockResponse.status})`);
      }

      // Update SEO
      console.log('\n5. Testing update product SEO...');
      const seoResponse = await makeRequest(
        'PUT',
        `/api/product-attributes/${testProductId}/seo`,
        {
          metaTitle: 'Test Product',
          metaDescription: 'Test product description',
          metaKeywords: ['test', 'product'],
        },
        adminToken
      );

      if (seoResponse.status === 200) {
        console.log('✓ Product SEO updated successfully');
      } else {
        console.log(`✗ Failed to update SEO (Status: ${seoResponse.status})`);
      }
    } else {
      console.log('✗ No products found');
    }

  } catch (error) {
    console.log('✗ Product attributes error:', error.message);
  }
}

async function testSettings() {
  console.log('\n=== Testing Settings Management ===');
  
  try {
    // Update store info
    console.log('\n1. Testing update store info...');
    const storeResponse = await makeRequest(
      'PUT',
      '/api/settings/store-info',
      {
        storeName: 'Test Store',
        storeDescription: 'Test store description',
        address: '123 Test St',
        city: 'Test City',
        country: 'Test Country',
      },
      adminToken
    );

    if (storeResponse.status === 200) {
      console.log('✓ Store info updated successfully');
    } else {
      console.log(`✗ Failed to update store info (Status: ${storeResponse.status})`);
    }

    // Update social media
    console.log('\n2. Testing update social media...');
    const socialResponse = await makeRequest(
      'PUT',
      '/api/settings/social-media',
      {
        facebook: 'https://facebook.com/teststore',
        instagram: 'https://instagram.com/teststore',
        twitter: 'https://twitter.com/teststore',
      },
      adminToken
    );

    if (socialResponse.status === 200) {
      console.log('✓ Social media updated successfully');
    } else {
      console.log(`✗ Failed to update social media (Status: ${socialResponse.status})`);
    }

    // Update payment methods
    console.log('\n3. Testing update payment methods...');
    const paymentResponse = await makeRequest(
      'PUT',
      '/api/settings/payment-methods',
      {
        paymentMethods: ['credit_card', 'debit_card', 'upi', 'net_banking'],
      },
      adminToken
    );

    if (paymentResponse.status === 200) {
      console.log('✓ Payment methods updated successfully');
    } else {
      console.log(`✗ Failed to update payment methods (Status: ${paymentResponse.status})`);
    }

    // Update shipping rates
    console.log('\n4. Testing update shipping rates...');
    const shippingResponse = await makeRequest(
      'PUT',
      '/api/settings/shipping-rates',
      {
        shippingRates: [
          { minAmount: 0, maxAmount: 500, rate: 50 },
          { minAmount: 500, maxAmount: 1000, rate: 30 },
          { minAmount: 1000, maxAmount: Infinity, rate: 0 },
        ],
      },
      adminToken
    );

    if (shippingResponse.status === 200) {
      console.log('✓ Shipping rates updated successfully');
    } else {
      console.log(`✗ Failed to update shipping rates (Status: ${shippingResponse.status})`);
    }

    // Update currency
    console.log('\n5. Testing update currency...');
    const currencyResponse = await makeRequest(
      'PUT',
      '/api/settings/currency',
      { currency: 'INR' },
      adminToken
    );

    if (currencyResponse.status === 200) {
      console.log('✓ Currency updated successfully');
    } else {
      console.log(`✗ Failed to update currency (Status: ${currencyResponse.status})`);
    }

  } catch (error) {
    console.log('✗ Settings management error:', error.message);
  }
}

async function testAuthorizationChecks() {
  console.log('\n=== Testing Authorization Checks ===');
  
  try {
    // Try to access admin endpoint without token
    console.log('\n1. Testing access without token...');
    const noTokenResponse = await makeRequest('GET', '/api/orders/admin/list');
    
    if (noTokenResponse.status === 401 || noTokenResponse.status === 403) {
      console.log('✓ Correctly rejected request without token');
    } else {
      console.log(`✗ Should have rejected request (Status: ${noTokenResponse.status})`);
    }

    // Try with invalid token
    console.log('\n2. Testing access with invalid token...');
    const invalidTokenResponse = await makeRequest('GET', '/api/orders/admin/list', null, 'invalid_token');
    
    if (invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403) {
      console.log('✓ Correctly rejected request with invalid token');
    } else {
      console.log(`✗ Should have rejected request (Status: ${invalidTokenResponse.status})`);
    }

  } catch (error) {
    console.log('✗ Authorization check error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          ADMIN PANEL COMPREHENSIVE TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nBackend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);

  const loginSuccess = await testAdminLogin();
  
  if (!loginSuccess) {
    console.log('\n✗ Cannot proceed without admin login');
    process.exit(1);
  }

  await testOrdersManagement();
  await testProductAttributes();
  await testSettings();
  await testAuthorizationChecks();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUITE COMPLETE                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run tests
runTests().catch(console.error);
