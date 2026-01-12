# Quick Testing Guide - Customer Management System

## Prerequisites
- Backend running on port 5000
- Frontend running on port 5173
- MongoDB running locally

## Test Scenarios

### Scenario 1: User Registration & Profile Edit

**Steps:**
1. Open http://localhost:5173
2. Click "Sign Up" 
3. Register new account with:
   - Email: testuser@example.com
   - Password: Test@123
   - Full Name: John Smith
   - Phone: +44-7911-123456

**Expected Result:**
- User created with:
  - `isGuest: false` (in database)
  - `gender: ''` (empty)
  - `loyalty: 'bronze'` (tier)
  - `totalOrders: 0`
  - `address: ''` (empty)

---

### Scenario 2: Edit Profile with Gender

**Prerequisites:** Must be logged in from Scenario 1

**Steps:**
1. Go to "My Account" / Account page
2. Click "Edit" button
3. Fill in form:
   - First Name: John
   - Last Name: Smith
   - Phone: +44-7911-654321
   - Gender: Male (from dropdown)
   - Billing Street: 123 Oxford Street
   - Billing City: London
   - Country: United Kingdom

4. Click "Save Changes"

**Expected Result:**
- Success message appears: "Profile updated successfully!"
- Form closes to view mode
- Data persists (refresh page, data still there)
- Gender shows as "Male" in Overview section

**Debug:**
- Check browser Network tab → PUT request to `/api/user/profile`
- Should have `Authorization: Bearer <token>` header
- Response should include updated user data

---

### Scenario 3: Verify Customer in Admin Panel

**Prerequisites:** 
- Admin account exists (or create one)
- TestUser from Scenario 1 exists in database with `isGuest: false`

**Steps:**
1. Log in as admin
2. Go to Admin Panel → Customers
3. Look for "John Smith" in customer list

**Expected Result:**
- Customer appears in list showing:
  - Name: John Smith
  - Email: testuser@example.com
  - Phone: +44-7911-654321
  - City: London
  - Loyalty: bronze
  - Total Orders: 0
  - Total Spent: £0.00

- Statistics card shows:
  - Total Customers: ≥1 (including testuser)
  - Active Customers: 1
  - Total Revenue: £0.00
  - Avg Order Value: £0.00

---

### Scenario 4: Guest vs Registered Users

**Steps:**
1. Open browser DevTools → Application → localStorage
2. Clear all storage
3. Go to home page (do NOT log in)
4. Add product to cart as guest
5. Check browser Network tab
   - Should see POST /api/cart
   - Should have `X-Session-ID` header (not Authorization)

6. Go to Admin Panel → Customers
7. Guest user should NOT appear in list

**Expected Result:**
- Guest user stored with `isGuest: true`
- Registered customers stored with `isGuest: false`
- Admin panel only shows `isGuest: false` users

---

### Scenario 5: Gender Field Validation

**Prerequisites:** Logged in user from Scenario 2

**Steps:**
1. Account → Edit mode
2. Change Gender from Male to Female
3. Save Changes
4. Refresh page
5. Check if Gender still shows Female

**Expected Result:**
- Gender field properly updated
- Persists across page refreshes
- Dropdown shows correct selection

---

## API Endpoint Testing (via cURL)

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>"
```

### Update User Profile
```bash
curl -X PUT http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "phone": "+44-7922-654321",
    "gender": "Female",
    "city": "Manchester",
    "country": "United Kingdom"
  }'
```

### Get All Customers (Admin)
```bash
curl -X GET "http://localhost:5000/api/customers?limit=10&offset=0" \
  -H "Authorization: Bearer <admin-token>"
```

---

## Database Verification

```javascript
// Find registered user in MongoDB
db.users.findOne({ email: "testuser@example.com" })

// Check fields:
// - isGuest: false ✓
// - gender: "Male"
// - city: "London"
// - loyalty: "bronze"
// - role: "user" ✓
```

---

## Success Criteria

- [x] User registration sets `isGuest: false`
- [x] Profile edit with gender field works
- [x] API endpoint updates user data
- [x] Changes persist after refresh
- [x] Admin panel shows only registered customers
- [x] Guest users not in admin list
- [x] Currency displays as £
- [x] Loading state during save
- [x] Success/error messages display
