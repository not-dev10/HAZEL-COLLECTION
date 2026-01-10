# Testing Scripts - Quick Reference

## 📋 Available Test Scripts

### Run All Tests
```bash
npm test
```
Runs both frontend integration tests and backend API tests.

### Run Backend API Tests Only
```bash
npm run test:cart-wishlist
```
Tests all Cart and Wishlist API endpoints (requires backend running).

### Run Frontend Integration Tests Only
```bash
npm run test:frontend
```
Validates frontend code changes without needing API running.

---

## 🚀 Quick Start

### 1. Ensure Backend is Running
```bash
npm run backend:dev
# Backend starts on http://localhost:5000
```

### 2. Run API Tests
```bash
npm run test:cart-wishlist
```

### 3. Run Frontend Checks
```bash
npm run test:frontend
```

---

## 📊 Test Coverage

### Backend API Tests (25 total)
- **Cart Tests (8)**
  - Get empty cart
  - Add item to cart
  - Verify item in cart
  - Add multiple items
  - Update item quantity
  - Verify cart total
  - Remove item from cart
  - Clear cart

- **Wishlist Tests (7)**
  - Get empty wishlist
  - Add item to wishlist
  - Verify addedAt timestamp
  - Add multiple items
  - Verify wishlist count
  - Remove item from wishlist
  - Clear wishlist

- **Integration Tests (2)**
  - Cart and Wishlist independence
  - API response format consistency

### Frontend Integration Tests (18 total)
- **File Integrity (4)**
  - WishlistContext API endpoints
  - CartContext API endpoints
  - Wishlist page implementation
  - Date formatting

- **Provider Setup (3)**
  - App.tsx WishlistProvider
  - App.tsx CartProvider
  - Provider wrapping

- **Code Validation (11)**
  - Timestamp handling
  - Safe date display
  - Function imports/exports
  - API response handling

---

## 📈 Success Criteria

### Passing Backend Tests
```
✅ Passed: 25
❌ Failed: 0
💯 Success Rate: 100%
```

### Passing Frontend Tests
```
✅ Passed: 18
❌ Failed: 0
💯 Success Rate: 100%
```

---

## 🔧 Troubleshooting

### Backend Tests Fail to Connect
**Error:** `ECONNREFUSED`

**Solution:**
```bash
# Make sure backend is running
npm run backend:dev

# In a new terminal, run tests
npm run test:cart-wishlist
```

### Frontend Tests Fail
**Error:** `Error reading WishlistContext`

**Solution:**
```bash
# Run from root directory (not from frontend folder)
cd didi-monorepo
npm run test:frontend
```

### Tests Timeout
**Error:** Request timeout or no response

**Solution:**
```bash
# Increase timeout and add verbose logging
DEBUG=* node test-wishlist-cart.js
```

---

## 📝 Test Output Examples

### Successful Cart Test
```
Test 1: Get empty cart
✅ PASS: GET /api/cart returns 200
✅ PASS: Empty cart returns items array

Test 2: Add item to cart
✅ PASS: POST /api/cart/add returns 201
✅ PASS: Item added successfully
✅ PASS: Cart contains item
```

### Successful Wishlist Test
```
Test 9: Get empty wishlist
✅ PASS: GET /api/wishlist returns 200
✅ PASS: Empty wishlist returns items array

Test 10: Add item to wishlist
✅ PASS: POST /api/wishlist/add returns 201
✅ PASS: Item added to wishlist
✅ PASS: Wishlist contains item
```

### Successful Frontend Check
```
✅ PASS: WishlistContext uses correct API endpoint
   └─ Found /api/wishlist in GET request

✅ PASS: WishlistContext add endpoint correct
   └─ Found /api/wishlist/add in POST request

✅ PASS: WishlistContext handles addedAt as number
   └─ Found type check for addedAt timestamp
```

---

## 🎯 What Gets Tested

### API Functionality
- ✅ CRUD operations for cart items
- ✅ CRUD operations for wishlist items
- ✅ Quantity management
- ✅ Total calculations
- ✅ Data persistence
- ✅ Guest session handling

### Data Validation
- ✅ Timestamp format (addedAt)
- ✅ Price calculations
- ✅ Item counts
- ✅ Response format consistency

### Frontend Integration
- ✅ API endpoint configuration
- ✅ Context provider setup
- ✅ Component implementation
- ✅ Data flow correctness

---

## 📚 Additional Resources

- **Full Testing Guide:** See `TESTING_GUIDE.md`
- **Fixes Summary:** See `WISHLIST_FIXES_SUMMARY.md`
- **Detailed Report:** See `WISHLIST_CART_FIXES.md`
- **Manual Testing:** See `TESTING_GUIDE.md` for checklist

---

## ✨ Next Steps

After running tests successfully:

1. ✅ Review test results carefully
2. ✅ Perform manual testing from `TESTING_GUIDE.md`
3. ✅ Test in different browsers
4. ✅ Test guest session flow
5. ✅ Test logged-in user flow
6. ✅ Deploy with confidence

---

## 💡 Pro Tips

### Run Tests While Developing
```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run frontend:dev

# Terminal 3: Watch tests
npm run test:cart-wishlist
```

### Test Specific Endpoint
Edit `test-wishlist-cart.js` to focus on specific tests.

### Monitor Database
```bash
mongosh
use didi
db.carts.find().pretty()
db.wishlists.find().pretty()
```

### Check Network
Open browser DevTools → Network tab to see API calls in real-time.

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** ✅ All Fixes Implemented
