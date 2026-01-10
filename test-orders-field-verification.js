const API_BASE_URL = 'http://localhost:5000';

// Test credentials
const adminEmail = 'admin@hezalthelabel.com';
const adminPassword = 'Admin@123456';

let adminToken = '';
let userToken = '';

// Expected fields for user orders
const expectedUserOrderFields = {
  _id: 'string',
  items: 'array',
  personalInfo: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    phone: 'string'
  },
  totals: {
    subtotal: 'number',
    shipping: 'number',
    tax: 'number',
    grandTotal: 'number'
  },
  status: 'string',
  createdAt: 'string',
  updatedAt: 'string'
};

// Expected fields for admin orders
const expectedAdminOrderFields = {
  _id: 'string',
  items: 'array',
  personalInfo: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    phone: 'string'
  },
  totals: {
    subtotal: 'number',
    shipping: 'number',
    tax: 'number',
    grandTotal: 'number'
  },
  status: 'string',
  createdAt: 'string',
  updatedAt: 'string'
};

async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

function checkFieldStructure(obj, expectedStructure, path = '') {
  const issues = [];
  
  for (const [key, expectedType] of Object.entries(expectedStructure)) {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj)) {
      issues.push(`❌ Missing field: ${fullPath}`);
    } else if (typeof expectedType === 'object' && expectedType !== null) {
      // Nested object
      if (typeof obj[key] !== 'object' || obj[key] === null) {
        issues.push(`❌ Field ${fullPath} should be an object, got ${typeof obj[key]}`);
      } else {
        const nestedIssues = checkFieldStructure(obj[key], expectedType, fullPath);
        issues.push(...nestedIssues);
      }
    } else if (expectedType === 'array') {
      if (!Array.isArray(obj[key])) {
        issues.push(`❌ Field ${fullPath} should be an array, got ${typeof obj[key]}`);
      }
    } else if (expectedType === 'number') {
      if (typeof obj[key] !== 'number') {
        issues.push(`❌ Field ${fullPath} should be a number, got ${typeof obj[key]}`);
      }
    } else if (expectedType === 'string') {
      if (typeof obj[key] !== 'string') {
        issues.push(`❌ Field ${fullPath} should be a string, got ${typeof obj[key]}`);
      }
    }
  }
  
  return issues;
}

function findExtraFields(obj, expectedStructure, path = '') {
  const extras = [];
  
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (!(key in expectedStructure)) {
      extras.push(`⚠️  Extra field: ${fullPath}`);
    } else if (typeof expectedStructure[key] === 'object' && expectedStructure[key] !== null && typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedExtras = findExtraFields(obj[key], expectedStructure[key], fullPath);
      extras.push(...nestedExtras);
    }
  }
  
  return extras;
}

async function testUserOrdersAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING USER ORDERS API');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const data = await response.json();
    
    if (!data.orders || data.orders.length === 0) {
      console.log('⚠️  No orders found for user');
      return;
    }
    
    const order = data.orders[0];
    console.log('\n📋 Sample User Order Structure:');
    console.log(JSON.stringify(order, null, 2));
    
    console.log('\n🔍 Field Validation:');
    const missingFields = checkFieldStructure(order, expectedUserOrderFields);
    const extraFields = findExtraFields(order, expectedUserOrderFields);
    
    if (missingFields.length === 0) {
      console.log('✅ All expected fields present');
    } else {
      missingFields.forEach(issue => console.log(issue));
    }
    
    if (extraFields.length > 0) {
      console.log('\nExtra fields found:');
      extraFields.forEach(extra => console.log(extra));
    }
    
  } catch (error) {
    console.error('Error testing user orders:', error.message);
  }
}

async function testAdminOrdersAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING ADMIN ORDERS API');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/list`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    
    // Admin API returns data.data.orders, not data.data
    const orders = data.data?.orders || data.data || [];
    
    if (!orders || orders.length === 0) {
      console.log('⚠️  No orders found in admin panel');
      return;
    }
    
    const order = orders[0];
    console.log('\n📋 Sample Admin Order Structure:');
    console.log(JSON.stringify(order, null, 2));
    
    console.log('\n🔍 Field Validation:');
    const missingFields = checkFieldStructure(order, expectedAdminOrderFields);
    const extraFields = findExtraFields(order, expectedAdminOrderFields);
    
    if (missingFields.length === 0) {
      console.log('✅ All expected fields present');
    } else {
      missingFields.forEach(issue => console.log(issue));
    }
    
    if (extraFields.length > 0) {
      console.log('\nExtra fields found:');
      extraFields.forEach(extra => console.log(extra));
    }
    
  } catch (error) {
    console.error('Error testing admin orders:', error.message);
  }
}

async function compareAPIs() {
  console.log('\n' + '='.repeat(60));
  console.log('COMPARING USER vs ADMIN ORDERS API');
  console.log('='.repeat(60));
  
  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const userData = await userResponse.json();
    
    const adminResponse = await fetch(`${API_BASE_URL}/api/orders-management/admin/list`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminData = await adminResponse.json();
    
    const userOrders = userData.orders || [];
    const adminOrders = adminData.data?.orders || adminData.data || [];
    
    if (userOrders.length > 0 && adminOrders.length > 0) {
      const userOrder = userOrders[0];
      const adminOrder = adminOrders[0];
      
      console.log('\n✅ Both APIs return data');
      console.log(`User API returns: ${userOrders.length} order(s)`);
      console.log(`Admin API returns: ${adminOrders.length} order(s)`);
      
      // Check if structures match
      const userKeys = Object.keys(userOrder).sort();
      const adminKeys = Object.keys(adminOrder).sort();
      
      console.log('\nUser Order Top-Level Keys:', userKeys);
      console.log('Admin Order Top-Level Keys:', adminKeys);
      
      const missingInAdmin = userKeys.filter(k => !adminKeys.includes(k));
      const extraInAdmin = adminKeys.filter(k => !userKeys.includes(k));
      
      if (missingInAdmin.length > 0) {
        console.log('\n⚠️  Fields in User API but missing in Admin API:', missingInAdmin);
      }
      if (extraInAdmin.length > 0) {
        console.log('\n⚠️  Extra fields in Admin API:', extraInAdmin);
      }
      if (missingInAdmin.length === 0 && extraInAdmin.length === 0) {
        console.log('\n✅ Both APIs return identical field structures');
      }
    } else {
      console.log(`⚠️  Insufficient data: User orders: ${userOrders.length}, Admin orders: ${adminOrders.length}`);
    }
  } catch (error) {
    console.error('Error comparing APIs:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Orders Field Verification Test\n');
  
  // Login as admin
  console.log('🔐 Logging in as admin...');
  adminToken = await login(adminEmail, adminPassword);
  if (!adminToken) {
    console.error('Failed to login as admin');
    process.exit(1);
  }
  console.log('✅ Admin login successful');
  
  // For user orders, we need a regular user token
  // Try to find a user or create one
  console.log('\n🔐 Attempting to get user token...');
  // You might need to adjust this based on your test user
  userToken = adminToken; // For now, use admin token to test
  
  // Run tests
  await testUserOrdersAPI();
  await testAdminOrdersAPI();
  await compareAPIs();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Field Verification Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
