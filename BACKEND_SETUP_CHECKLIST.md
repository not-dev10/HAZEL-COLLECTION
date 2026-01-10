# ✅ Backend & Supabase Setup Checklist

**Status**: In Progress  
**Last Updated**: January 8, 2026

---

## ✅ COMPLETED STEPS

### 1. Backend Dependencies Installed ✅
```
✓ 101 packages installed
✓ No vulnerabilities found
✓ Ready to start
```

**Installed packages**:
- ✅ express@4.18.2 - Web framework
- ✅ @supabase/supabase-js@2.38.5 - Supabase client
- ✅ dotenv@16.3.1 - Environment variables
- ✅ cors@2.8.5 - Cross-origin requests
- ✅ express-validator@7.0.0 - Input validation
- ✅ axios@1.6.2 - HTTP client
- ✅ nodemon@3.0.2 - Development server

---

## ⏳ NEXT STEPS (You Need to Do These)

### Step 2️⃣: Execute Database Schema in Supabase

**Instructions**:

1. **Open Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Click on your project: `cxqufkktwnvihxuzxkav`

2. **Navigate to SQL Editor**
   - Left sidebar → SQL Editor
   - Click "+ New Query"

3. **Run Database.sql**
   - Open file: `backend/database.sql` (280 lines)
   - Copy ALL content
   - Paste into Supabase SQL editor
   - Click **Run** button (blue button in top right)

4. **Verify Success**
   - Should see: "Query executed successfully"
   - No red error messages
   - Check Tables section - should show 10 tables:
     - ✓ products
     - ✓ customers
     - ✓ orders
     - ✓ order_items
     - ✓ reviews
     - ✓ support_tickets
     - ✓ support_responses
     - ✓ wishlists
     - ✓ carts
     - ✓ order_items

---

### Step 3️⃣: Start Backend Server

**In PowerShell/Terminal**:
```powershell
cd c:\Users\Rajiv\OneDrive\Desktop\didi-monorepo\backend
npm run dev
```

**Expected Output**:
```
nodemon watching for file changes...
to restart at any time, type `rs`
Server running on port 3000
✓ Connected to Supabase
```

**If you see this, move to Step 4️⃣!**

---

### Step 4️⃣: Test Backend Connection

**In Browser**:
```
http://localhost:3000/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

If you see this, Supabase is connected! ✅

---

### Step 5️⃣: Configure Frontend API URL

**In**: `frontend/.env.local` (create if doesn't exist)

```env
VITE_API_URL=http://localhost:3000
```

This tells the frontend where to find the backend API.

---

## 📋 Current Configuration

### Backend `.env` (Already Set)
```
SUPABASE_URL=https://cxqufkktwnvihxuzxkav.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=a7f3d9c2e1b4f6a8d5c2e9f1a3b4c5...
```

✅ All configured! No changes needed.

### Frontend Configuration (Needs Update)
- [ ] Create `frontend/.env.local`
- [ ] Add `VITE_API_URL=http://localhost:3000`

---

## 🔍 Database Schema Summary

### Tables Created (10 total):
1. **products** - Clothing items with price, stock, category
2. **customers** - User profiles with address info
3. **orders** - Customer orders with status tracking
4. **order_items** - Items in each order
5. **reviews** - Product reviews with moderation
6. **support_tickets** - Customer support requests
7. **support_responses** - Support ticket replies
8. **wishlists** - Saved items for later
9. **carts** - Shopping cart items
10. **order_items** - Line items in orders

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ All tables have BEFORE UPDATE trigger for `updated_at`
- ✅ Price/quantity validation with CHECK constraints
- ✅ Unique constraints on emails
- ✅ Foreign key relationships
- ✅ Indexes for performance

---

## 🚀 Estimated Time

- ✅ Step 1 (Dependencies): **DONE** (15 minutes)
- ⏳ Step 2 (Database): **5-10 minutes** 
- ⏳ Step 3 (Start Server): **2 minutes**
- ⏳ Step 4 (Test API): **1 minute**
- ⏳ Step 5 (Frontend Setup): **2 minutes**

**Total Remaining**: ~10-20 minutes

---

## 🆘 Troubleshooting

### Error: "Cannot connect to Supabase"
**Solution**:
1. Verify `.env` has correct SUPABASE_URL
2. Check internet connection
3. Try visiting https://cxqufkktwnvihxuzxkav.supabase.co in browser

### Error: "Port 3000 already in use"
**Solution**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Error: "Table does not exist"
**Solution**:
1. Check that database.sql was executed in Supabase
2. Go to Tables section in Supabase - verify tables exist
3. If missing, re-run database.sql

### Error: "RLS policy violation"
**Solution**:
This is expected during development. RLS policies restrict access. See BACKEND_REVIEW.md for details.

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com
- **API Documentation**: See `backend/README.md`

---

## ✨ Next Phase (After Setup)

Once Steps 1-5 are complete:
1. Test signup/login flow
2. Create test orders
3. Test product reviews
4. Test support tickets
5. Deploy to production

---

**Start with Step 2️⃣ above!** 🎉
