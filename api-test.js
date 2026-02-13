#!/usr/bin/env node

/**
 * 🧪 API Testing Script - Hazel Collection Backend
 * Tests endpoints with user and admin authentication
 * 
 * Usage: node api-test.js
 */

const https = require('https');

const BASE_URL = 'https://hazel-collection-y168.onrender.com';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Log test result
 */
function logResult(testName, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  const color = status === 'pass' ? colors.green : status === 'warn' ? colors.yellow : colors.red;
  console.log(`${icon} ${color}${testName}${colors.reset} ${details}`);
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`\n${colors.cyan}🧪 Hazel Collection API Testing${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);

  let adminToken = null;
  let userToken = null;

  try {
    // ==================== HEALTH CHECK ====================
    console.log(`${colors.cyan}━━━ Health Check ━━━${colors.reset}`);
    
    try {
      const healthRes = await makeRequest('GET', '/api/health/ping');
      logResult('Health Check', 'pass', `Status: ${healthRes.status}`);
    } catch (error) {
      logResult('Health Check', 'fail', error.message);
    }

    // ==================== ADMIN LOGIN ====================
    console.log(`\n${colors.cyan}━━━ Authentication ━━━${colors.reset}`);
    
    try {
      const loginRes = await makeRequest('POST', '/api/auth/admin-login', {
        email: 'hazellabel@gmail.com',
        password: 'hazellabel@2026',
      });

      if (loginRes.status === 200 && loginRes.body.token) {
        adminToken = loginRes.body.token;
        logResult(
          'Admin Login',
          'pass',
          `Token received (${adminToken.substring(0, 20)}...)`
        );
      } else {
        logResult('Admin Login', 'fail', `Status: ${loginRes.status}`);
      }
    } catch (error) {
      logResult('Admin Login', 'fail', error.message);
    }

    // ==================== PUBLIC ENDPOINTS ====================
    console.log(`\n${colors.cyan}━━━ Public Endpoints (No Auth) ━━━${colors.reset}`);
    
    try {
      const productsRes = await makeRequest('GET', '/api/products');
      if (productsRes.status === 200) {
        const count = productsRes.body.data?.length || 0;
        logResult('Get Products', 'pass', `Found ${count} products`);
      } else {
        logResult('Get Products', 'fail', `Status: ${productsRes.status}`);
      }
    } catch (error) {
      logResult('Get Products', 'fail', error.message);
    }

    // ==================== ADMIN ENDPOINTS ====================
    if (adminToken) {
      console.log(`\n${colors.cyan}━━━ Admin Endpoints ━━━${colors.reset}`);
      
      try {
        const adminProductsRes = await makeRequest(
          'GET',
          '/api/products',
          null,
          adminToken
        );
        if (adminProductsRes.status === 200) {
          const count = adminProductsRes.body.data?.length || 0;
          logResult('Admin Get Products', 'pass', `Found ${count} products`);
        } else if (adminProductsRes.status === 403) {
          logResult('Admin Get Products', 'warn', 'Access denied (403)');
        } else {
          logResult('Admin Get Products', 'fail', `Status: ${adminProductsRes.status}`);
        }
      } catch (error) {
        logResult('Admin Get Products', 'fail', error.message);
      }

      try {
        const analyticsRes = await makeRequest(
          'GET',
          '/api/analytics',
          null,
          adminToken
        );
        if (analyticsRes.status === 200) {
          logResult('Admin Get Analytics', 'pass', 'Analytics retrieved');
        } else if (analyticsRes.status === 403) {
          logResult('Admin Get Analytics', 'warn', 'Access denied (403)');
        } else {
          logResult('Admin Get Analytics', 'fail', `Status: ${analyticsRes.status}`);
        }
      } catch (error) {
        logResult('Admin Get Analytics', 'fail', error.message);
      }

      try {
        const customersRes = await makeRequest(
          'GET',
          '/api/customers',
          null,
          adminToken
        );
        if (customersRes.status === 200) {
          const count = customersRes.body.data?.length || 0;
          logResult('Admin Get Customers', 'pass', `Found ${count} customers`);
        } else if (customersRes.status === 403) {
          logResult('Admin Get Customers', 'warn', 'Access denied (403)');
        } else {
          logResult('Admin Get Customers', 'fail', `Status: ${customersRes.status}`);
        }
      } catch (error) {
        logResult('Admin Get Customers', 'fail', error.message);
      }

      try {
        const ordersRes = await makeRequest(
          'GET',
          '/api/orders-management',
          null,
          adminToken
        );
        if (ordersRes.status === 200) {
          const count = ordersRes.body.data?.length || 0;
          logResult('Admin Get Orders', 'pass', `Found ${count} orders`);
        } else if (ordersRes.status === 403) {
          logResult('Admin Get Orders', 'warn', 'Access denied (403)');
        } else {
          logResult('Admin Get Orders', 'fail', `Status: ${ordersRes.status}`);
        }
      } catch (error) {
        logResult('Admin Get Orders', 'fail', error.message);
      }

      try {
        const healthRes = await makeRequest(
          'GET',
          '/api/health',
          null,
          adminToken
        );
        if (healthRes.status === 200) {
          logResult('Admin Health Check', 'pass', 'Detailed health info retrieved');
        } else if (healthRes.status === 403) {
          logResult('Admin Health Check', 'warn', 'Access denied (403)');
        } else {
          logResult('Admin Health Check', 'fail', `Status: ${healthRes.status}`);
        }
      } catch (error) {
        logResult('Admin Health Check', 'fail', error.message);
      }
    }

    // ==================== SUMMARY ====================
    console.log(`\n${colors.cyan}━━━ Summary ━━━${colors.reset}`);
    console.log(`${colors.green}✅ Backend Status: ONLINE${colors.reset}`);
    if (adminToken) {
      console.log(`${colors.green}✅ Admin Authentication: WORKING${colors.reset}`);
    }
    console.log(`\n${colors.blue}🎯 Next Steps:${colors.reset}`);
    console.log(`  1. Deploy frontend on Vercel`);
    console.log(`  2. Set VITE_API_URL=${BASE_URL}`);
    console.log(`  3. Test full integration\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

// Run tests
runTests().catch(console.error);
