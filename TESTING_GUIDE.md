# Cart & Wishlist Testing Guide

## Quick Start

### Run Backend API Tests
```bash
# Make sure your backend server is running on localhost:5000
node test-wishlist-cart.js

# Or specify a custom API URL
API_URL=http://your-api-url:port node test-wishlist-cart.js
```

### Run Frontend Integration Tests
```bash
# From the frontend directory
cd frontend
node ../test-frontend-integration.js
```

---

## Test Scripts Overview

### 1. **test-wishlist-cart.js** (Backend API Tests)

Tests all Cart and Wishlist API endpoints with guest sessions.

**Tests Covered:**
- ✅ Cart CRUD operations (Create, Read, Update, Delete)
- ✅ Wishlist CRUD operations
- ✅ Item quantity updates
- ✅ Cart total calculations
- ✅ Timestamp validation (addedAt field)
- ✅ Data persistence
- ✅ API response format consistency
- ✅ Cart and Wishlist independence

**Sample Output:**
```
🧪 Starting Cart & Wishlist Test Suite
📍 API Base URL: http://localhost:5000

═══════════════════════════════════════
🛒 CART TESTS
═══════════════════════════════════════

Test 1: Get empty cart
✅ PASS: GET /api/cart returns 200
✅ PASS: Empty cart returns items array

Test 2: Add item to cart
✅ PASS: POST /api/cart/add returns 201
✅ PASS: Item added successfully
...

📊 TEST SUMMARY
═══════════════════════════════════════

✅ Passed: 25
❌ Failed: 0
📈 Total:  25
💯 Success Rate: 100%
```

### 2. **test-frontend-integration.js** (Frontend Code Checks)

Validates frontend code changes without needing browser/compilation.

**Tests Covered:**
- ✅ WishlistContext API endpoints use `/api/` prefix
- ✅ CartContext API endpoints use `/api/` prefix
- ✅ Timestamp handling is correct
- ✅ Safe date display in Wishlist page
- ✅ Provider setup in App.tsx
- ✅ Function imports and exports

**Sample Output:**
```
🧪 Frontend Context Tests

═══════════════════════════════════════
FILE INTEGRITY CHECKS
═══════════════════════════════════════

✅ PASS: WishlistContext uses correct API endpoint
✅ PASS: WishlistContext add endpoint correct
...

✅ Passed: 18
❌ Failed: 0
📈 Total:  18
💯 Success Rate: 100%

🎉 All tests passed! Frontend code is ready.
```

---

## Manual Testing Checklist

### Cart Functionality
- [ ] Navigate to product page
- [ ] Click "Add to Cart" button
- [ ] Verify item appears in cart page
- [ ] Update quantity with +/- buttons
- [ ] Verify total price updates correctly
- [ ] Remove item from cart
- [ ] Verify cart page shows empty state
- [ ] Add multiple items and click "Clear Cart"
- [ ] Verify cart is completely empty

### Wishlist Functionality
- [ ] Click "Save" (wishlist) button on product
- [ ] Verify heart icon shows as filled/active
- [ ] Go to /wishlist page
- [ ] Verify wishlisted items appear
- [ ] Verify "Added [date]" shows correctly
- [ ] Click "Add to Cart" from wishlist
- [ ] Verify item appears in cart
- [ ] Remove item from wishlist
- [ ] Verify item disappears from wishlist
- [ ] Click "Clear Wishlist" button
- [ ] Verify all items are removed

### Guest Session Testing
- [ ] Clear all browser storage (incognito window recommended)
- [ ] Add items to cart without logging in
- [ ] Add items to wishlist without logging in
- [ ] Refresh page - verify items persist
- [ ] Close and reopen browser - items should still be there

### Logged-in User Testing
- [ ] Login to account
- [ ] Add items to cart
- [ ] Add items to wishlist
- [ ] Refresh page - verify items persist
- [ ] Logout - verify cart/wishlist are cleared
- [ ] Login again - should be new empty cart/wishlist

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## API Endpoint Testing

You can also test endpoints directly using curl:

### Cart Endpoints
```bash
# Get cart
curl http://localhost:5000/api/cart \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"

# Add to cart
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "product-1",
    "name": "Test Product",
    "price": 99.99,
    "quantity": 1,
    "image": "https://example.com/image.jpg"
  }'

# Remove from cart
curl -X DELETE http://localhost:5000/api/cart/remove/product-1 \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"

# Update quantity
curl -X PUT http://localhost:5000/api/cart/update/product-1 \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Clear cart
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"
```

### Wishlist Endpoints
```bash
# Get wishlist
curl http://localhost:5000/api/wishlist \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"

# Add to wishlist
curl -X POST http://localhost:5000/api/wishlist/add \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "product-1",
    "name": "Test Product",
    "price": 99.99,
    "image": "https://example.com/image.jpg"
  }'

# Remove from wishlist
curl -X DELETE http://localhost:5000/api/wishlist/remove/product-1 \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"

# Clear wishlist
curl -X DELETE http://localhost:5000/api/wishlist/clear \
  -H "Authorization: Guest guest_test_123" \
  -H "Content-Type: application/json"
```

---

## Expected Results

### Successful Test Run

When all tests pass, you should see:
- ✅ All 25 backend tests passing
- ✅ All 18 frontend integration tests passing
- 💯 100% success rate

### Common Issues & Fixes

**Issue: "ECONNREFUSED" error in backend tests**
- Fix: Ensure backend server is running on the configured port

**Issue: Tests fail with "API endpoint" errors**
- Fix: Check that `/api/` prefix is present in API URLs

**Issue: "addedAt" tests failing**
- Fix: Ensure timestamp is stored as number, not Date object

**Issue: Cart total miscalculations**
- Fix: Verify quantity multiplication: `price * quantity`

---

## Performance Testing

To test performance under load:

```bash
# Install Apache Bench (ab) - comes with Apache
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test cart endpoint
ab -n 100 -c 10 -H "Authorization: Guest test_session" \
  http://localhost:5000/api/cart

# Test wishlist endpoint
ab -n 100 -c 10 -H "Authorization: Guest test_session" \
  http://localhost:5000/api/wishlist
```

---

## Debugging Tips

### Enable Verbose Logging

Add this to the test script before running:
```bash
# Node.js debug mode
DEBUG=* node test-wishlist-cart.js

# Check network requests in browser DevTools
# Open Console tab and watch Network requests
```

### Check Database

If tests fail with data persistence issues:
```bash
# MongoDB - check collections
mongosh
use didi
db.carts.find()
db.wishlists.find()
```

### Backend Logs

Monitor backend logs while tests run:
```bash
# Terminal 1: Run backend
npm run dev

# Terminal 2: Run tests
node test-wishlist-cart.js
```

Watch the backend console for any errors or warnings.

---

## Continuous Integration

To integrate tests into CI/CD pipeline:

```yaml
# .github/workflows/test.yml (example for GitHub Actions)
name: Test Cart & Wishlist

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install && npm run dev &
      - run: sleep 5  # Wait for backend
      - run: npm run test:cart-wishlist
```

---

## Support

If tests fail:
1. Check the detailed error messages
2. Review the files mentioned in the error
3. Verify all API endpoints are accessible
4. Check browser console for frontend errors
5. Monitor backend logs for server errors

For more help, review the WISHLIST_CART_FIXES.md file.
