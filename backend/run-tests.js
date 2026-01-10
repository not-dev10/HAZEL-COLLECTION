#!/usr/bin/env node

/**
 * Image Upload Feature Test Script
 * Simple, non-blocking test for image upload endpoints
 */

const baseUrl = 'http://localhost:5000/api';
let token = '';

const adminEmail = 'admin@hezalthtelabel.com';
const adminPassword = 'Admin@123456';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

async function request(method, endpoint, body = null) {
  const url = baseUrl + endpoint;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function test(name, fn) {
  try {
    console.log(`\n${colors.blue}→ ${name}${colors.reset}`);
    const result = await fn();
    if (result.success) {
      console.log(`  ${colors.green}✓ ${result.message}${colors.reset}`);
      return true;
    } else {
      console.log(`  ${colors.red}✗ ${result.message}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`  ${colors.red}✗ ${err.message}${colors.reset}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Image Upload Feature - Test Suite                        ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);

  let passed = 0;
  let failed = 0;

  // Test 1: Server Connection
  if (await test('Server Connection', async () => {
    const res = await request('GET', '/products');
    return {
      success: res.status === 200,
      message: res.status === 200 ? 'Server responding on port 5000' : `Server returned ${res.status}`
    };
  })) passed++; else failed++;

  // Test 2: Admin Login (or Signup)
  let loginSuccess = false;

  if (await test('Admin Login', async () => {
    const res = await request('POST', '/auth/admin-login', {
      email: adminEmail,
      password: adminPassword
    });
    if (res.status === 200 && res.data.token) {
      token = res.data.token;
      loginSuccess = true;
      return { success: true, message: 'Token obtained' };
    }
    return { success: false, message: `Login failed: ${res.status}` };
  })) passed++; else failed++;

  // Test 3: Create Product
  let productId = null;
  if (await test('Create Product', async () => {
    const res = await request('POST', '/products', {
      name: `Test-${Date.now()}`,
      price: 99.99,
      stock: 10,
      category: 'Electronics',
      description: 'Test product'
    });
    if ((res.status === 200 || res.status === 201) && res.data._id) {
      productId = res.data._id;
      return { success: true, message: `Product created: ${productId}` };
    }
    return { success: false, message: `Failed with status ${res.status}` };
  })) passed++; else failed++;

  if (!productId) {
    console.log(`${colors.red}Cannot continue without product ID${colors.reset}\n`);
    process.exit(1);
  }

  // Test 4: Upload Images
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q==';

  if (await test('Upload Images', async () => {
    const res = await request('POST', '/upload/product-images', {
      productId,
      images: [testImage, testImage]
    });
    if (res.status === 200 && res.data.images) {
      return { success: true, message: `Uploaded ${res.data.images.length} images` };
    }
    return { success: false, message: `Failed with status ${res.status}: ${res.data.message || 'Unknown'}` };
  })) passed++; else failed++;

  // Test 5: Verify Images in Database
  if (await test('Verify Database', async () => {
    const res = await request('GET', `/products/${productId}`);
    if (res.status === 200 && res.data.images && res.data.images.length > 0) {
      return { success: true, message: `Product has ${res.data.images.length} images stored` };
    }
    return { success: false, message: `Product has no images or not found` };
  })) passed++; else failed++;

  // Test 6: Cloudinary Signature
  if (await test('Cloudinary Signature', async () => {
    const res = await request('POST', '/upload/cloudinary-signature', {});
    if (res.status === 200 && res.data.signature) {
      return { success: true, message: 'Signature generated' };
    }
    return { success: false, message: `Failed with status ${res.status}` };
  })) passed++; else failed++;

  // Test 7: Get Products List
  if (await test('Get Products', async () => {
    const res = await request('GET', '/products');
    if (res.status === 200 && res.data.products) {
      return { success: true, message: `Found ${res.data.products.length} products` };
    }
    return { success: false, message: `Failed with status ${res.status}` };
  })) passed++; else failed++;

  // Summary
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   Summary                                                    ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╠════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${passed}`.padEnd(60) + '║');
  console.log(`${colors.red}✗ Failed: ${failed}`.padEnd(60) + '║');
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
