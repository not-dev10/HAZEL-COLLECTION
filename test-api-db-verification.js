const API_BASE_URL = 'http://localhost:5000';

// Expected field structures from analysis
const expectedStructures = {
  userOrdersList: {
    count: 'number',
    orders: 'array'
  },
  userOrderItem: {
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
  },
  adminOrdersList: {
    success: 'boolean',
    data: {
      orders: 'array',
      total: 'number',
      page: 'number',
      limit: 'number',
      pages: 'number'
    }
  },
  adminOrderItem: {
    _id: 'string',
    userId: 'string',
    items: 'array',
    personalInfo: {
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      phone: 'string'
    },
    billingAddress: {
      street: 'string',
      city: 'string',
      state: 'string',
      zip: 'string',
      country: 'string'
    },
    deliveryAddress: {
      street: 'string',
      city: 'string',
      state: 'string',
      zip: 'string',
      country: 'string',
      sameAsBilling: 'boolean'
    },
    paymentMethod: 'string',
    totals: {
      subtotal: 'number',
      shipping: 'number',
      tax: 'number',
      grandTotal: 'number'
    },
    status: 'string',
    createdAt: 'string',
    updatedAt: 'string'
  },
  adminStats: {
    success: 'boolean',
    data: {
      dateRange: {
        startDate: 'string',
        endDate: 'string'
      },
      totalOrders: 'number',
      statuses: 'object',
      revenue: {
        totalRevenue: 'number',
        averageOrder: 'number'
      }
    }
  }
};

const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

let adminToken = '';

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

function validateStructure(obj, expected, path = '') {
  const issues = [];
  
  for (const [key, expectedType] of Object.entries(expected)) {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj)) {
      issues.push(`❌ MISSING: ${fullPath}`);
    } else {
      const actualValue = obj[key];
      
      if (typeof expectedType === 'object' && expectedType !== null && !Array.isArray(expectedType)) {
        // Nested object
        if (typeof actualValue !== 'object' || actualValue === null) {
          issues.push(`❌ TYPE MISMATCH: ${fullPath} - expected object, got ${typeof actualValue}`);
        } else {
          const nestedIssues = validateStructure(actualValue, expectedType, fullPath);
          issues.push(...nestedIssues);
        }
      } else if (expectedType === 'array') {
        if (!Array.isArray(actualValue)) {
          issues.push(`❌ TYPE MISMATCH: ${fullPath} - expected array, got ${typeof actualValue}`);
        }
      } else if (expectedType === 'number') {
        if (typeof actualValue !== 'number') {
          issues.push(`❌ TYPE MISMATCH: ${fullPath} - expected number, got ${typeof actualValue}`);
        }
      } else if (expectedType === 'string') {
        if (typeof actualValue !== 'string') {
          issues.push(`❌ TYPE MISMATCH: ${fullPath} - expected string, got ${typeof actualValue}`);
        }
      } else if (expectedType === 'boolean') {
        if (typeof actualValue !== 'boolean') {
          issues.push(`❌ TYPE MISMATCH: ${fullPath} - expected boolean, got ${typeof actualValue}`);
        }
      }
    }
  }
  
  return issues;
}

function findExtraFields(obj, expected, path = '') {
  const extras = [];
  
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (!(key in expected)) {
      extras.push(`⚠️  EXTRA: ${fullPath}`);
    } else if (typeof expected[key] === 'object' && expected[key] !== null && typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedExtras = findExtraFields(obj[key], expected[key], fullPath);
      extras.push(...nestedExtras);
    }
  }
  
  return extras;
}

async function testUserOrdersAPI() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: USER ORDERS API - GET /api/orders');
  console.log('='.repeat(70));
  
  try {
    // For this test, we'll use admin token to test the endpoint
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    
    console.log('\n📋 Response Structure:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Validate top-level structure
    console.log('\n🔍 Top-Level Validation:');
    const topLevelIssues = validateStructure(data, expectedStructures.userOrdersList);
    if (topLevelIssues.length === 0) {
      console.log('✅ Top-level structure valid');
    } else {
      topLevelIssues.forEach(issue => console.log(issue));
    }
    
    // Validate order items if present
    if (data.orders && data.orders.length > 0) {
      console.log('\n🔍 Order Item Validation (first order):');
      const order = data.orders[0];
      const itemIssues = validateStructure(order, expectedStructures.userOrderItem);
      
      if (itemIssues.length === 0) {
        console.log('✅ Order item structure valid');
      } else {
        itemIssues.forEach(issue => console.log(issue));
      }
      
      // Check for extra fields
      const extraFields = findExtraFields(order, expectedStructures.userOrderItem);
      if (extraFields.length > 0) {
        console.log('\n⚠️  Extra fields in order:');
        extraFields.forEach(extra => console.log(extra));
      }
      
      // Validate status values
      console.log('\n🔍 Status Validation:');
      const invalidStatuses = data.orders.filter(o => !validStatuses.includes(o.status));
      if (invalidStatuses.length === 0) {
        console.log('✅ All order statuses are valid');
      } else {
        console.log(`❌ Found ${invalidStatuses.length} orders with invalid status`);
        invalidStatuses.forEach(o => console.log(`   - Order ${o._id}: status="${o.status}"`));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testAdminOrdersListAPI() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: ADMIN ORDERS LIST API - GET /api/orders-management/admin/list');
  console.log('='.repeat(70));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/list`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    
    console.log('\n📋 Response Structure:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Validate top-level structure
    console.log('\n🔍 Top-Level Validation:');
    const topLevelIssues = validateStructure(data, expectedStructures.adminOrdersList);
    if (topLevelIssues.length === 0) {
      console.log('✅ Top-level structure valid');
    } else {
      topLevelIssues.forEach(issue => console.log(issue));
    }
    
    // Validate order items if present
    if (data.data?.orders && data.data.orders.length > 0) {
      console.log('\n🔍 Order Item Validation (first order):');
      const order = data.data.orders[0];
      const itemIssues = validateStructure(order, expectedStructures.adminOrderItem);
      
      if (itemIssues.length === 0) {
        console.log('✅ Order item structure valid');
      } else {
        itemIssues.forEach(issue => console.log(issue));
      }
      
      // Check for extra fields
      const extraFields = findExtraFields(order, expectedStructures.adminOrderItem);
      if (extraFields.length > 0) {
        console.log('\n⚠️  Extra fields in order:');
        extraFields.forEach(extra => console.log(extra));
      }
      
      // Validate status values
      console.log('\n🔍 Status Validation:');
      const invalidStatuses = data.data.orders.filter(o => !validStatuses.includes(o.status));
      if (invalidStatuses.length === 0) {
        console.log('✅ All order statuses are valid');
      } else {
        console.log(`❌ Found ${invalidStatuses.length} orders with invalid status`);
        invalidStatuses.forEach(o => console.log(`   - Order ${o._id}: status="${o.status}"`));
      }
      
      // Validate numeric fields
      console.log('\n🔍 Numeric Fields Validation:');
      const order1 = data.data.orders[0];
      const numericIssues = [];
      
      if (typeof order1.totals.subtotal !== 'number') numericIssues.push('subtotal is not a number');
      if (typeof order1.totals.shipping !== 'number') numericIssues.push('shipping is not a number');
      if (typeof order1.totals.tax !== 'number') numericIssues.push('tax is not a number');
      if (typeof order1.totals.grandTotal !== 'number') numericIssues.push('grandTotal is not a number');
      
      if (numericIssues.length === 0) {
        console.log('✅ All numeric fields are correct type');
      } else {
        numericIssues.forEach(issue => console.log(`❌ ${issue}`));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testAdminStatsAPI() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: ADMIN STATS API - GET /api/orders-management/admin/stats');
  console.log('='.repeat(70));
  
  try {
    // Stats API requires date range parameters
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();
    
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await fetch(`${API_BASE_URL}/api/orders-management/admin/stats?${params}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const data = await response.json();
    
    console.log('\n📋 Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Validate structure
    console.log('\n🔍 Structure Validation:');
    if (data.success) {
      const issues = validateStructure(data, expectedStructures.adminStats);
      if (issues.length === 0) {
        console.log('✅ Stats structure valid');
      } else {
        issues.forEach(issue => console.log(issue));
      }
    } else {
      console.log(`⚠️  Stats API returned error: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testFieldConsistency() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: FIELD CONSISTENCY - User vs Admin APIs');
  console.log('='.repeat(70));
  
  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const userData = await userResponse.json();
    
    const adminResponse = await fetch(`${API_BASE_URL}/api/orders-management/admin/list`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminData = await adminResponse.json();
    
    if (userData.orders?.length > 0 && adminData.data?.orders?.length > 0) {
      const userOrder = userData.orders[0];
      const adminOrder = adminData.data.orders[0];
      
      console.log('\n🔍 Common Fields Comparison:');
      
      const commonFields = ['_id', 'items', 'personalInfo', 'totals', 'status', 'createdAt', 'updatedAt'];
      let allMatch = true;
      
      for (const field of commonFields) {
        const userHas = field in userOrder;
        const adminHas = field in adminOrder;
        
        if (userHas && adminHas) {
          console.log(`✅ ${field}: Present in both`);
        } else if (userHas && !adminHas) {
          console.log(`⚠️  ${field}: Only in User API`);
          allMatch = false;
        } else if (!userHas && adminHas) {
          console.log(`⚠️  ${field}: Only in Admin API`);
          allMatch = false;
        } else {
          console.log(`❌ ${field}: Missing from both`);
          allMatch = false;
        }
      }
      
      console.log('\n🔍 Admin-Only Fields:');
      const adminOnlyFields = ['userId', 'billingAddress', 'deliveryAddress', 'paymentMethod'];
      adminOnlyFields.forEach(field => {
        if (field in adminOrder) {
          console.log(`✅ ${field}: Present in Admin API`);
        } else {
          console.log(`❌ ${field}: Missing from Admin API`);
        }
      });
      
      if (allMatch) {
        console.log('\n✅ Field consistency verified');
      }
    } else {
      console.log('⚠️  Insufficient data to compare');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive API & DB Verification\n');
  
  // Login
  console.log('🔐 Logging in as admin...');
  adminToken = await login('admin@hezalthelabel.com', 'Admin@123456');
  if (!adminToken) {
    console.error('Failed to login');
    process.exit(1);
  }
  console.log('✅ Admin login successful\n');
  
  // Run tests
  await testUserOrdersAPI();
  await testAdminOrdersListAPI();
  await testAdminStatsAPI();
  await testFieldConsistency();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(70));
}

main().catch(console.error);
