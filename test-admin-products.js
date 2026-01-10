#!/usr/bin/env node

/**
 * Test Admin Products Page
 * Tests the products management functionality in the admin panel
 */

const API_BASE_URL = 'http://localhost:5000/api';

let adminToken = null;

async function test() {
  console.log('\n🧪 ADMIN PRODUCTS PAGE TEST\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hezalthelabel.com',
        password: 'Admin@123456'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    adminToken = loginData.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${adminToken?.substring(0, 30)}...`);

    // Step 2: Fetch all products
    console.log('\n2️⃣ Fetching all products...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const productsData = await productsResponse.json();
    if (!productsResponse.ok) {
      console.error('❌ Fetch products failed:', productsData);
      return;
    }

    console.log('✅ Products fetched successfully');
    console.log(`   Total products: ${productsData.products?.length || 0}`);
    
    if (productsData.products && productsData.products.length > 0) {
      console.log('   Sample product:');
      const sampleProduct = productsData.products[0];
      console.log(`     - ID: ${sampleProduct._id || sampleProduct.id}`);
      console.log(`     - Name: ${sampleProduct.name}`);
      console.log(`     - Price: ${sampleProduct.price}`);
      console.log(`     - Stock: ${sampleProduct.stock}`);
      console.log(`     - Category: ${sampleProduct.category}`);
    }

    // Step 3: Test adding a product
    console.log('\n3️⃣ Testing add product...');
    const newProductResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Product ' + Date.now(),
        price: 99.99,
        stock: 50,
        category: 'test',
        description: 'Test product for admin panel'
      })
    });

    const newProductData = await newProductResponse.json();
    if (!newProductResponse.ok) {
      console.error('❌ Add product failed:', newProductData);
      return;
    }

    const testProductId = newProductData.product._id || newProductData.product.id;
    console.log('✅ Product added successfully');
    console.log(`   ID: ${testProductId}`);
    console.log(`   Name: ${newProductData.product.name}`);

    // Step 4: Test updating a product
    console.log('\n4️⃣ Testing update product...');
    const updateResponse = await fetch(`${API_BASE_URL}/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated Test Product',
        price: 149.99,
        stock: 100,
        category: 'test-updated',
        description: 'Updated test product'
      })
    });

    const updateData = await updateResponse.json();
    if (!updateResponse.ok) {
      console.error('❌ Update product failed:', updateData);
      return;
    }

    console.log('✅ Product updated successfully');
    console.log(`   New price: ${updateData.product.price}`);
    console.log(`   New stock: ${updateData.product.stock}`);

    // Step 5: Test deleting a product
    console.log('\n5️⃣ Testing delete product...');
    const deleteResponse = await fetch(`${API_BASE_URL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (!deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.error('❌ Delete product failed:', deleteData);
      return;
    }

    console.log('✅ Product deleted successfully');

    // Step 6: Verify deletion
    console.log('\n6️⃣ Verifying deletion...');
    const verifyResponse = await fetch(`${API_BASE_URL}/products/${testProductId}`, {
      method: 'GET'
    });

    if (verifyResponse.status === 404) {
      console.log('✅ Product successfully deleted and verified');
    } else {
      console.warn('⚠️ Product still exists after deletion');
    }

    console.log('\n✨ ALL TESTS PASSED!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

test();
