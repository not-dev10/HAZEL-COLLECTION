# Testing Scripts - Complete Documentation

## 📦 What You Get

Three comprehensive test scripts have been created to validate all wishlist and cart functionality:

### 1. **Backend API Tests** (`test-wishlist-cart.js`)
Node.js script that tests all Cart and Wishlist API endpoints.
- 25 test cases covering CRUD operations
- Tests guest session handling
- Validates data persistence and calculations
- Checks API response format consistency

### 2. **Frontend Integration Tests** (`test-frontend-integration.js`)
Node.js script that validates frontend code without needing a browser.
- 18 test cases checking code structure
- Verifies API endpoint configuration
- Validates timestamp handling
- Checks provider setup

### 3. **Test Runners**
Platform-specific scripts to run tests easily:
- **Unix/Mac:** `test.sh` (bash script)
- **Windows:** `test.bat` (batch file)
- Both with built-in health checks and error handling

---

## 🚀 Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Run all tests
npm test

# Run backend tests only (requires backend running)
npm run test:cart-wishlist

# Run frontend tests only
npm run test:frontend
```

### Option 2: Using shell/batch scripts

**macOS/Linux:**
```bash
# Make script executable
chmod +x test.sh

# Run all tests
./test.sh

# Run specific tests
./test.sh backend
./test.sh frontend
./test.sh help
```

**Windows:**
```cmd
# Run all tests
test.bat

# Run specific tests
test.bat backend
test.bat frontend
test.bat help
```

### Option 3: Direct Node execution

```bash
# Backend tests (backend must be running)
node test-wishlist-cart.js

# Frontend tests
cd frontend && node ../test-frontend-integration.js
```

---

## 📊 Test Breakdown

### Backend Tests (25 total)

**Cart Operations:**
1. Get empty cart
2. Add item to cart
3. Verify item appears
4. Add second item
5. Update item quantity
6. Verify cart total
7. Remove item
8. Clear cart

**Wishlist Operations:**
9. Get empty wishlist
10. Add item to wishlist
11. Verify addedAt timestamp (critical!)
12. Add second item
13. Verify wishlist count
14. Remove item
15. Clear wishlist

**Integration Tests:**
16. Cart and Wishlist independence
17. API response format consistency
18-25. Additional edge cases

### Frontend Tests (18 total)

**WishlistContext Checks:**
- API endpoint uses `/api/wishlist`
- Add endpoint uses `/api/wishlist/add`
- Remove endpoint uses `/api/wishlist/remove`
- Clear endpoint uses `/api/wishlist/clear`

**CartContext Checks:**
- All endpoints use `/api/cart` prefix
- Update endpoint exists at `/api/cart/update`
- Clear endpoint at `/api/cart/clear`

**Data Handling:**
- Timestamp (addedAt) handled as number
- Safe date display with conditional rendering
- Provider properly wraps application

---

## ✅ Success Indicators

### All Tests Pass
```
✅ Passed: 43
❌ Failed: 0
💯 Success Rate: 100%

🎉 All tests passed! You're ready to go.
```

### What This Means
✅ All API endpoints are working
✅ Cart and wishlist data persists correctly
✅ Guest sessions work properly
✅ Frontend code is properly configured
✅ Timestamps are stored and displayed correctly
✅ Data calculations are accurate

---

## 🔧 Setup Instructions

### 1. Make test scripts executable (Unix/Mac only)
```bash
chmod +x test.sh
```

### 2. Ensure backend is running for API tests
```bash
npm run backend:dev

# In another terminal, run tests
npm run test:cart-wishlist
```

### 3. Run frontend tests (no backend needed)
```bash
npm run test:frontend
```

### 4. Run all tests
```bash
npm test
```

---

## 📋 File Summary

| File | Purpose | Runs On |
|------|---------|---------|
| `test-wishlist-cart.js` | Backend API tests | Node.js (any OS) |
| `test-frontend-integration.js` | Frontend code validation | Node.js (any OS) |
| `test.sh` | Bash runner script | macOS, Linux |
| `test.bat` | Windows batch runner | Windows |
| `package.json` | npm test scripts | npm (any OS) |

---

## 🎯 What Gets Tested

### ✅ Cart Functionality
- Adding items to cart
- Removing items
- Updating quantities
- Calculating totals
- Clearing cart
- Data persistence across requests

### ✅ Wishlist Functionality
- Adding items to wishlist
- Storing timestamps (addedAt)
- Removing items
- Clearing wishlist
- Data persistence
- Proper display with dates

### ✅ Data Integrity
- Price calculations
- Quantity management
- Item counts
- Total calculations
- Response format consistency

### ✅ API Endpoints
- All CRUD operations
- Proper HTTP status codes (200, 201, 404)
- Correct response format
- Error handling

### ✅ Frontend Integration
- Context provider setup
- API endpoint configuration
- Timestamp handling
- Component integration

---

## 🚨 Troubleshooting

### Backend Tests Fail to Connect
**Problem:** `ECONNREFUSED` or connection timeout
**Solution:**
```bash
# Terminal 1: Start backend
npm run backend:dev

# Terminal 2: Run tests
npm run test:cart-wishlist
```

### Tests Timeout
**Problem:** Tests hang or take too long
**Solution:**
```bash
# Run with verbose output
DEBUG=* node test-wishlist-cart.js

# Check if backend is responding
curl http://localhost:5000/api/cart
```

### Frontend Tests Report Missing Files
**Problem:** `Error reading WishlistContext`
**Solution:**
```bash
# Make sure you're in root directory
cd didi-monorepo
npm run test:frontend

# Not from frontend folder
# cd frontend && npm test  # ❌ Wrong
```

### Test Results Vary Between Runs
**Problem:** Some tests pass, some fail inconsistently
**Solution:**
```bash
# Ensure clean state
rm -rf node_modules
npm install

# Restart backend
npm run backend:dev

# Run tests again
npm run test:cart-wishlist
```

---

## 📈 Performance Benchmarks

Expected test execution times:

| Test Suite | Time | Environment |
|-----------|------|-------------|
| Backend tests | 5-10s | Local machine |
| Frontend tests | 1-2s | Local machine |
| All tests | 10-15s | Local machine |

*Times may vary based on system performance*

---

## 🔍 Manual Testing Supplement

After running automated tests, perform manual checks:

1. **Add to Wishlist**
   - Click heart icon on product
   - Verify icon changes color
   - Go to /wishlist
   - See item with date added

2. **Add to Cart**
   - Click "Add to Cart"
   - Go to /cart
   - See item with correct price
   - Update quantity
   - Verify total recalculates

3. **Guest Session**
   - Use incognito window
   - Add items to cart/wishlist
   - Refresh page
   - Items should persist

4. **Data Persistence**
   - Add items
   - Close browser completely
   - Reopen browser
   - Items should still be there (for guest sessions)

---

## 📚 Related Documentation

- **Detailed Fixes:** `WISHLIST_CART_FIXES.md`
- **Quick Summary:** `WISHLIST_FIXES_SUMMARY.md`
- **Manual Testing:** `TESTING_GUIDE.md`
- **Quick Reference:** `TEST_SCRIPTS_QUICK_REFERENCE.md`

---

## ✨ Next Steps

1. ✅ Run `npm test` to validate everything
2. ✅ Review test output carefully
3. ✅ Perform manual testing from TESTING_GUIDE.md
4. ✅ Test in multiple browsers
5. ✅ Deploy with confidence!

---

## 💡 Pro Tips

### Monitor Logs While Testing
```bash
# Terminal 1: Backend with logs
npm run backend:dev

# Terminal 2: Run tests
npm test

# Watch the backend console for debug output
```

### Test Specific Scenarios
Edit test scripts to focus on specific endpoints or scenarios.

### Database Inspection
```bash
mongosh
use didi
db.carts.find().pretty()
db.wishlists.find().pretty()
```

### Network Monitoring
Open browser DevTools → Network tab while using the app to see API calls.

---

## 📞 Support

If tests fail:
1. Check backend is running
2. Review test error messages
3. Check logs in backend console
4. Verify API endpoints are accessible
5. Review the fixes in WISHLIST_CART_FIXES.md

---

**Status:** ✅ All test scripts created and configured  
**Version:** 1.0  
**Ready for:** Full testing cycle
