# 🎯 Complete Backend & Supabase Setup Guide

**Status**: Ready to Deploy  
**Backend**: Dependencies Installed ✅  
**Database**: Waiting for Supabase SQL Execution ⏳

---

## 📊 What We Have

### Backend Structure ✅
```
backend/
├── src/
│   ├── server.js                 # Express app with all routes
│   ├── config/
│   │   └── supabase.js           # Supabase client setup
│   ├── middleware/
│   │   └── auth.js               # JWT validation & admin checks
│   └── routes/
│       ├── auth.js               # Signup, login, logout
│       ├── products.js           # Product CRUD
│       ├── orders.js             # Order management
│       ├── reviews.js            # Review moderation
│       ├── support.js            # Support tickets
│       └── customers.js          # Customer profiles
├── database.sql                  # Complete schema (280 lines)
├── package.json                  # Dependencies configured
├── .env                          # Credentials ready
└── README.md                     # API documentation
```

### Dependencies Installed ✅
```
✓ 101 packages installed
✓ Express.js - Web framework
✓ Supabase Client - Database/Auth
✓ Express Validator - Input validation
✓ CORS - Cross-origin requests
✓ Dotenv - Environment config
✓ Nodemon - Auto-reload dev server
```

### Environment Configured ✅
```
✓ SUPABASE_URL - Points to your project
✓ SUPABASE_ANON_KEY - For frontend auth
✓ SUPABASE_SERVICE_ROLE_KEY - For backend operations
✓ JWT_SECRET - 128-char secure key
✓ PORT=3000
✓ NODE_ENV=development
✓ CORS_ORIGIN=http://localhost:5173
```

---

## 🎬 Quick Start (5 Steps)

### 1. Execute Database Schema in Supabase

**Time**: 5 minutes

**Steps**:
1. Open Supabase: https://app.supabase.com
2. Select project: `cxqufkktwnvihxuzxkav`
3. Left sidebar → **SQL Editor**
4. Click **+ New Query**
5. Copy entire contents of `backend/database.sql`
6. Paste into editor
7. Click **Run** (blue button)

**Expected Result**:
```
✓ Query executed successfully
✓ No errors
✓ Tables created (check "Tables" section)
```

**What Gets Created**:
- 10 tables for e-commerce
- Row Level Security (RLS) policies
- Automatic `updated_at` triggers
- Performance indexes
- Constraints for data validation

---

### 2. Start Backend Server

**Time**: 2 minutes

**In PowerShell**:
```powershell
cd c:\Users\Rajiv\OneDrive\Desktop\didi-monorepo\backend
npm run dev
```

**Expected Output**:
```
> nodemon src/server.js
nodemon watching for file changes...
Server running on port 3000
Connected to Supabase
```

**Keep this terminal open!** (Or open a new one for next steps)

---

### 3. Test Backend Health

**In Browser or Postman**:
```
GET http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T12:00:00.000Z"
}
```

If you see this, **Step 1 worked!** ✅

---

### 4. Configure Frontend

**Create**: `frontend/.env.local`

```env
VITE_API_URL=http://localhost:3000
```

This tells your React app where to find the backend.

---

### 5. Verify Full Integration

**In PowerShell** (new terminal):
```powershell
cd c:\Users\Rajiv\OneDrive\Desktop\didi-monorepo\frontend
npm run dev
```

**In Browser**:
```
http://localhost:5173
```

Both frontend and backend should now be running! 🎉

---

## 📚 API Endpoints (35+ Available)

### Authentication
```
POST   /api/auth/signup           - Create account
POST   /api/auth/login            - Login
POST   /api/auth/logout           - Logout
POST   /api/auth/reset-password   - Reset password
```

### Products
```
GET    /api/products              - List all products
GET    /api/products/:id          - Get single product
POST   /api/products              - Create (admin only)
PUT    /api/products/:id          - Update (admin only)
DELETE /api/products/:id          - Delete (admin only)
GET    /api/products/category/:category - By category
```

### Orders
```
GET    /api/orders                - List user's orders
GET    /api/orders/:id            - Get order details
POST   /api/orders                - Create new order
PUT    /api/orders/:id            - Update order (admin)
DELETE /api/orders/:id            - Cancel order
GET    /api/orders/:id/items      - Get order items
```

### And More...
- Reviews (6 endpoints)
- Support Tickets (5 endpoints)
- Customer Profiles (4 endpoints)
- Wishlists (CRUD)
- Shopping Carts (CRUD)

Full docs: See `backend/README.md` (335+ lines)

---

## 🔒 Security Features

### ✅ Already Implemented
- JWT authentication (128-char secret key)
- Row Level Security (RLS) in database
- CORS for frontend only
- Express middleware validation
- Password hashing (Supabase handles)
- Service role + Anon key separation
- Admin role verification

### ⏳ Coming Soon
- Rate limiting (prevent brute force)
- Input sanitization (XSS prevention)
- Request logging/monitoring
- Email verification on signup

---

## 🧪 Testing Your Setup

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

### Test 2: Get Products (No Auth)
```bash
curl http://localhost:3000/api/products
```

### Test 3: Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### Test 4: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 📋 Database Tables

### 1. Products
- id, name, sku, price, stock, category
- description, image, status, is_visible
- created_at, updated_at

### 2. Customers  
- id (references auth.users)
- email, phone, address, city, country
- postal_code, is_active
- created_at, updated_at

### 3. Orders
- id, customer_id, total_price
- shipping_address, status, payment_status
- created_at, updated_at

### 4. Reviews
- id, product_id, customer_id
- rating (1-5), title, comment
- status (pending/approved/rejected)
- helpful_count

### 5-10. Support, Wishlist, Cart, OrderItems, etc.
See database.sql for full schema

---

## 🚨 Troubleshooting

### "Port 3000 already in use"
```powershell
# Find process
netstat -ano | findstr :3000

# Kill it (replace with actual PID)
taskkill /PID 12345 /F

# Or use different port
# Change in backend/.env: PORT=3001
```

### "Cannot connect to Supabase"
1. Check `.env` has correct URL
2. Test internet connection
3. Verify Supabase project exists
4. Try visiting URL in browser

### "Tables don't exist"
1. Verify database.sql was executed
2. Check Supabase → Tables section
3. Look for error messages in SQL Editor
4. Re-run database.sql if needed

### "RLS policy violation"
1. This is expected during development
2. RLS restricts access based on roles
3. Ensure proper authorization headers
4. Use Supabase anon key for auth routes

### "CORS error"
1. Verify frontend is on port 5173
2. Check CORS_ORIGIN in `.env`
3. Frontend needs `VITE_API_URL=http://localhost:3000`
4. Clear browser cache

---

## 📞 Help Resources

- **Supabase**: https://supabase.com/docs
- **Express**: https://expressjs.com
- **API Docs**: `backend/README.md`
- **Setup Checklist**: `BACKEND_SETUP_CHECKLIST.md`

---

## ✨ What's Next

After setup works:

1. **Test Authentication**
   - Create new user account
   - Test login/logout
   - Verify JWT token

2. **Test Shopping Flow**
   - Browse products
   - Add to cart
   - Create order
   - Review order

3. **Test Admin Features**
   - Add new product
   - Moderate reviews
   - Manage support tickets

4. **Deployment**
   - Deploy backend to Vercel/Heroku
   - Deploy frontend to Vercel
   - Update production URLs
   - Configure HTTPS

---

## 🎯 Success Criteria

✅ Database tables created in Supabase  
✅ Backend starts without errors  
✅ /health endpoint responds  
✅ Frontend can reach backend  
✅ Authentication flow works  
✅ Orders can be created  
✅ Reviews can be submitted  

**You're here now!** 👈 Just need to execute database.sql

---

**Start with Step 1 above and follow through!** 🚀
