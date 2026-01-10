/**
 * Automated Stock Update Test Script
 * Tests login -> fetch products -> update stock
 */

import http from 'http';
import https from 'https';

const API_BASE = 'http://localhost:5000/api';

const makeRequest = (method, urlString, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: 'Parse failed' }, rawBody: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

// Test sequence
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         STOCK UPDATE AUTOMATED TEST SCRIPT                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let token = null;
  let productId = null;

  try {
    // TEST 1: Login
    console.log('━━━ TEST 1: Admin Login ━━━');
    const loginUrl = `${API_BASE}/auth/admin-login`;
    console.log(`POST ${loginUrl}`);
    const loginRes = await makeRequest('POST', loginUrl, {
      email: 'admin@hezalthelabel.com',
      password: 'Admin@123456'
    });
    
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, JSON.stringify(loginRes.data, null, 2));
    
    if (loginRes.status === 200 && loginRes.data.token) {
      token = loginRes.data.token;
      console.log(`✅ Login successful - Token: ${token.substring(0, 30)}...`);
    } else {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    // TEST 2: Fetch products
    console.log('\n━━━ TEST 2: Fetch Products ━━━');
    const productsUrl = `${API_BASE}/products`;
    console.log(`GET ${productsUrl}`);
    const productsRes = await makeRequest('GET', productsUrl);
    
    console.log(`Status: ${productsRes.status}`);
    if (productsRes.data.products && productsRes.data.products.length > 0) {
      const product = productsRes.data.products[0];
      productId = product.productId || product._id;
      console.log(`✅ Found ${productsRes.data.products.length} products`);
      console.log(`Using product ID: ${productId}`);
      console.log(`Product: ${product.name || product.productName} (Stock: ${product.stock})`);
    } else {
      throw new Error('No products found');
    }

    // TEST 3: Update stock WITH auth token
    console.log('\n━━━ TEST 3: Update Stock (WITH TOKEN) ━━━');
    const stockUrl = `${API_BASE}/products-attributes/${productId}/stock`;
    console.log(`PUT ${stockUrl}`);
    console.log(`Authorization: Bearer ${token.substring(0, 30)}...`);
    
    const stockRes = await makeRequest('PUT', stockUrl, 
      { quantity: 88 },
      { Authorization: `Bearer ${token}` }
    );
    
    console.log(`Status: ${stockRes.status}`);
    console.log(`Response:`, JSON.stringify(stockRes.data, null, 2));
    
    if (stockRes.status === 200) {
      console.log(`✅ Stock update SUCCESSFUL!`);
    } else {
      console.log(`❌ Stock update FAILED - Status: ${stockRes.status}`);
      console.log(`Error message: ${stockRes.data.message}`);
    }

    // TEST 4: Update stock WITHOUT auth (should fail)
    console.log('\n━━━ TEST 4: Update Stock (NO TOKEN - Should Fail) ━━━');
    console.log(`PUT ${stockUrl}`);
    console.log(`Authorization: NONE`);
    
    const noAuthRes = await makeRequest('PUT', stockUrl, { quantity: 50 });
    
    console.log(`Status: ${noAuthRes.status}`);
    console.log(`Response:`, JSON.stringify(noAuthRes.data, null, 2));
    
    if (noAuthRes.status === 401) {
      console.log(`✅ Correctly rejected unauthorized request`);
    }

    // TEST 5: Verify updated stock
    console.log('\n━━━ TEST 5: Verify Stock Was Updated ━━━');
    const verifyUrl = `${API_BASE}/products/${productId}`;
    console.log(`GET ${verifyUrl}`);
    const verifyRes = await makeRequest('GET', verifyUrl);
    
    console.log(`Status: ${verifyRes.status}`);
    if (verifyRes.data.product) {
      console.log(`Current stock: ${verifyRes.data.product.stock}`);
      if (verifyRes.data.product.stock === 88) {
        console.log(`✅ Stock correctly updated to 88`);
      } else {
        console.log(`⚠️  Stock is ${verifyRes.data.product.stock}, expected 88`);
      }
    }

  } catch (err) {
    console.error(`\n❌ Test failed:`, err.message);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST COMPLETE                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

runTests();
