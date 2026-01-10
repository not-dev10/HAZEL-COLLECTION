import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const log = (...args) => console.log('[test:products]', ...args);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  log(`Using BASE_URL=${BASE_URL}`);

  // 1) Health check (optional)
  try {
    const health = await axios.get(`${BASE_URL}/api/auth/health`).catch(e => e.response);
    if (health?.status === 200) {
      log('Auth health:', health.data);
    } else {
      log('Auth health endpoint not reachable yet. Make sure server is running.');
    }
  } catch {}

  // 2) Create or reuse a user, then admin-login
  const ts = Date.now();
  const email = `admin.test+${ts}@example.com`;
  const password = 'AdminTest123!';
  const fullName = 'Admin Tester';

  try {
    const signup = await axios.post(`${BASE_URL}/api/auth/signup`, { email, password, fullName }).catch(e => e.response);
    if (signup.status === 201) {
      log('Signup ok:', signup.data.user?.email);
    } else if (signup.status === 409) {
      log('Signup skipped (user exists).');
    } else {
      log('Signup unexpected:', signup?.status, signup?.data);
    }
  } catch (err) {
    log('Signup error:', err?.response?.data || err.message);
  }

  // 3) Admin login to get token
  let token;
  try {
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/admin-login`, { email, password });
    token = adminLogin.data.token;
    log('Admin login ok. Token acquired.');
  } catch (err) {
    log('Admin login error:', err?.response?.data || err.message);
    process.exit(1);
  }

  const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });

  // 4) Negative test (unauthorized create)
  try {
    const noAuth = await axios.post(`${BASE_URL}/api/products`, { name: 'X', price: 1, category: 'Test' }, { validateStatus: () => true });
    log('Unauth create status (expected 401/403):', noAuth.status);
  } catch {}

  // 5) Create a product
  let productId;
  try {
    const createRes = await api.post('/products', {
      name: `Test Product ${ts}`,
      description: 'Created via script',
      price: 19.99,
      stock: 5,
      category: 'Automation'
    });
    log('Create status:', createRes.status);
    if (createRes.status === 201) {
      productId = createRes.data.product._id || createRes.data.product.id;
      log('Created product id:', productId);
    } else {
      log('Create response:', createRes.data);
      process.exit(1);
    }
  } catch (err) {
    log('Create error:', err?.response?.data || err.message);
    process.exit(1);
  }

  // 6) Update the product
  try {
    const updateRes = await api.put(`/products/${productId}`, {
      price: 24.99,
      stock: 7,
    });
    log('Update status:', updateRes.status);
  } catch (err) {
    log('Update error:', err?.response?.data || err.message);
  }

  // 7) Delete the product
  try {
    const delRes = await api.delete(`/products/${productId}`);
    log('Delete status:', delRes.status);
  } catch (err) {
    log('Delete error:', err?.response?.data || err.message);
  }

  log('Done.');
}

main();
