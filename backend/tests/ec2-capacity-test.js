import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10, name: 'Ramp up 10 users' },
    { duration: '1m', target: 30, name: 'Ramp up 30 users' },
    { duration: '1m30s', target: 50, name: 'Ramp up 50 users' },
    { duration: '2m', target: 50, name: 'Stay at 50 users' },
    { duration: '30s', target: 20, name: 'Ramp down 20 users' },
    { duration: '30s', target: 0, name: 'Ramp down to 0' },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['<0.05'],
  },
};

// EC2 backend URL
const BASE_URL = 'http://13.63.199.225:5000';

// Setup function (runs once before test)
export function setup() {
  console.log('=== CAPACITY TEST STARTING ===');
  console.log('Target URL:', BASE_URL);
  console.log('Test duration: ~6 minutes');
  console.log('Max concurrent users: 50');
  console.log('============================');
}

// Main test function (runs for each VU)
export default function () {
  // Test 1: Product Listing
  group('1. Product Listing', () => {
    const response = http.get(`${BASE_URL}/api/products`);
    check(response, {
      'status 200': (r) => r.status === 200,
      'response time < 300ms': (r) => r.timings.duration < 300,
      'has products': (r) => r.body.length > 10,
    });
  });

  sleep(1);

  // Test 2: Product Details (Single Product)
  group('2. Product Details', () => {
    const response = http.get(`${BASE_URL}/api/products/507f1f77bcf86cd799439011`);
    check(response, {
      'status 200 or 404': (r) => [200, 404].includes(r.status),
      'response time < 400ms': (r) => r.timings.duration < 400,
    });
  });

  sleep(1);

  // Test 3: Search Products
  group('3. Search', () => {
    const response = http.get(`${BASE_URL}/api/products?search=shirt&page=1`);
    check(response, {
      'status 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);

  // Test 4: Cart Operations (if authenticated)
  group('4. Cart Operations', () => {
    const payload = JSON.stringify({
      productId: '507f1f77bcf86cd799439011',
      quantity: 1,
      size: 'M',
      color: 'red',
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = http.post(`${BASE_URL}/api/cart/add`, payload, params);
    check(response, {
      'status is 200 or 401 (auth required)': (r) => [200, 401].includes(r.status),
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  sleep(1);

  // Test 5: Health Check
  group('5. Health Check', () => {
    const response = http.get(`${BASE_URL}/health`);
    check(response, {
      'status 200 or 404': (r) => [200, 404].includes(r.status),
      'response time < 100ms': (r) => r.timings.duration < 100,
    });
  });

  sleep(2); // Think time between virtual user actions
}

// Teardown function (runs once after test)
export function teardown(data) {
  console.log('=== CAPACITY TEST COMPLETE ===');
  console.log('Check results above for performance metrics');
  console.log('==============================');
}
