#!/usr/bin/env node

/**
 * Debug Product ID Issue
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function debugTest() {
  console.log('\n🔍 DEBUGGING PRODUCT ID ISSUE\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hezalthelabel.com',
        password: 'Admin@123456'
      })
    });

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin logged in\n');

    // Step 2: Create a product
    console.log('2️⃣ Creating product...');
    const testName = 'Debug Test Product ' + Date.now();
    const createResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: testName,
        price: 99.99,
        stock: 50,
        category: 'debug-test',
        description: 'Debug test product'
      })
    });

    const createData = await createResponse.json();
    console.log('Create response:');
    console.log(JSON.stringify(createData, null, 2));

    const productFromCreate = createData.product;
    const createdId = productFromCreate._id || productFromCreate.id;
    console.log(`\n📍 Created product ID: ${createdId}`);
    console.log(`   Product object keys: ${Object.keys(productFromCreate).join(', ')}\n`);

    // Step 3: Immediately fetch to see what ID we get
    console.log('3️⃣ Fetching product immediately after creation...');
    const fetchResponse = await fetch(`${API_BASE_URL}/products/${createdId}`, {
      method: 'GET'
    });

    const fetchData = await fetchResponse.json();
    if (fetchResponse.ok) {
      console.log('Fetch successful:');
      const fetchedProduct = fetchData.product;
      console.log(`   ID from fetch: ${fetchedProduct.id}`);
      console.log(`   _id field: ${fetchedProduct._id}`);
      console.log(`   Product keys: ${Object.keys(fetchedProduct).join(', ')}\n`);
    } else {
      console.log('❌ Fetch failed:');
      console.log(JSON.stringify(fetchData, null, 2));
    }

    // Step 4: Try to update with the same ID
    console.log('4️⃣ Attempting update with ID:', createdId);
    const updateResponse = await fetch(`${API_BASE_URL}/products/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated ' + testName,
        price: 199.99,
        stock: 100,
        category: 'debug-test-updated'
      })
    });

    const updateData = await updateResponse.json();
    console.log('Update response status:', updateResponse.status);
    console.log('Update response:');
    console.log(JSON.stringify(updateData, null, 2));

    if (!updateResponse.ok) {
      // Try fetching again to see if it exists
      console.log('\n5️⃣ Double-checking if product exists...');
      const doubleCheckResponse = await fetch(`${API_BASE_URL}/products/${createdId}`);
      const doubleCheckData = await doubleCheckResponse.json();
      console.log('Double-check response status:', doubleCheckResponse.status);
      if (!doubleCheckResponse.ok) {
        console.log('❌ Product does not exist!');
      } else {
        console.log('✅ Product exists:');
        console.log(JSON.stringify(doubleCheckData.product, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTest();
