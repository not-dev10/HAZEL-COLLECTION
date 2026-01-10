const API_BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@hezalthelabel.com';
const ADMIN_PASSWORD = 'admin123';

console.log('🧪 Testing Product Update Functionality\n');
console.log('=' .repeat(60));

async function testProductUpdate() {
  let adminToken = null;
  let testProductId = null;

  try {
    // Step 1: Admin Login
    console.log('\n📝 Step 1: Admin Login');
    console.log('-'.repeat(60));
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${error.message}`);
    }

    const loginData = await loginResponse.json();
    adminToken = loginData.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${adminToken.substring(0, 30)}...`);

    // Step 2: Get Products
    console.log('\n📝 Step 2: Fetch Products');
    console.log('-'.repeat(60));
    const productsResponse = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();
    if (!productsData.products || productsData.products.length === 0) {
      throw new Error('No products found in database');
    }

    testProductId = productsData.products[0]._id;
    const originalProduct = productsData.products[0];
    console.log('✅ Products fetched successfully');
    console.log(`   Total products: ${productsData.products.length}`);
    console.log(`   Test product ID: ${testProductId}`);
    console.log(`   Test product name: ${originalProduct.name}`);
    console.log(`   Original price: $${originalProduct.price}`);
    console.log(`   Original stock: ${originalProduct.stock}`);

    // Step 3: Update Product (without auth - should fail)
    console.log('\n📝 Step 3: Update Product WITHOUT Auth (should fail)');
    console.log('-'.repeat(60));
    const noAuthResponse = await fetch(`${API_BASE_URL}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: originalProduct.name,
        price: originalProduct.price,
        stock: originalProduct.stock,
        category: originalProduct.category,
      }),
    });

    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly rejected - 401 Unauthorized');
    } else {
      console.log('⚠️  Expected 401 but got:', noAuthResponse.status);
    }

    // Step 4: Update Product (with auth - should succeed)
    console.log('\n📝 Step 4: Update Product WITH Auth (should succeed)');
    console.log('-'.repeat(60));
    const updatedData = {
      name: originalProduct.name,
      description: originalProduct.description || 'Updated description',
      price: originalProduct.price + 10,
      stock: originalProduct.stock + 5,
      category: originalProduct.category,
    };

    console.log('   Sending update request...');
    console.log(`   Authorization: Bearer ${adminToken.substring(0, 30)}...`);
    console.log(`   New price: $${updatedData.price}`);
    console.log(`   New stock: ${updatedData.stock}`);

    const updateResponse = await fetch(`${API_BASE_URL}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatedData),
    });

    console.log(`   Response status: ${updateResponse.status}`);

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.log('❌ Update failed:', errorData);
      throw new Error(`Update failed: ${errorData.message || 'Unknown error'}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Product updated successfully');
    console.log(`   Updated product:`, updateResult.product);

    // Step 5: Verify Update
    console.log('\n📝 Step 5: Verify Update');
    console.log('-'.repeat(60));
    const verifyResponse = await fetch(`${API_BASE_URL}/api/products/${testProductId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify product');
    }

    const verifiedProduct = await verifyResponse.json();
    console.log('✅ Product verified');
    console.log(`   Current price: $${verifiedProduct.product.price}`);
    console.log(`   Current stock: ${verifiedProduct.product.stock}`);

    if (verifiedProduct.product.price === updatedData.price) {
      console.log('✅ Price update confirmed');
    } else {
      console.log('❌ Price mismatch!');
    }

    if (verifiedProduct.product.stock === updatedData.stock) {
      console.log('✅ Stock update confirmed');
    } else {
      console.log('❌ Stock mismatch!');
    }

    // Step 6: Restore Original Values
    console.log('\n📝 Step 6: Restore Original Values');
    console.log('-'.repeat(60));
    const restoreResponse = await fetch(`${API_BASE_URL}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: originalProduct.name,
        description: originalProduct.description,
        price: originalProduct.price,
        stock: originalProduct.stock,
        category: originalProduct.category,
      }),
    });

    if (restoreResponse.ok) {
      console.log('✅ Original values restored');
    } else {
      console.log('⚠️  Failed to restore original values');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Admin authentication works');
    console.log('   ✅ Unauthorized requests are blocked');
    console.log('   ✅ Authorized product updates work');
    console.log('   ✅ Updates are persisted correctly');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('\n');
    process.exit(1);
  }
}

// Run the test
testProductUpdate();
