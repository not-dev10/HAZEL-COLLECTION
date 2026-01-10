# 🚀 Supabase Setup Guide

Your backend already has Supabase credentials configured in `.env`. Now you need to:

## Step 1: Verify Supabase Project is Active

Your current `.env` has:
```
SUPABASE_URL=https://cxqufkktwnvihxuzxkav.supabase.co
```

This URL indicates a project already exists. Visit this URL in your browser to access your Supabase dashboard.

## Step 2: Execute the Database Schema

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in left sidebar
3. Create a **New Query**
4. Copy the entire contents of `/backend/database.sql`
5. Paste into the SQL editor
6. Click **Run**

The schema will create:
- ✅ 10 tables (users, customers, products, orders, cart, wishlist, reviews, support_tickets, support_responses, order_items)
- ✅ Row Level Security (RLS) policies for data isolation
- ✅ Indexes for performance
- ✅ Auto-update triggers
- ✅ CHECK constraints for data validation

## Step 3: Verify Authentication Settings

1. Go to **Authentication** (left sidebar)
2. Click **Providers**
3. Ensure **Email** is enabled (should be by default)
4. Click **Settings** → check **Disable sign ups** is OFF
5. Go to **URL Configuration** → Set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: 
     - `http://localhost:5173`
     - `http://localhost:5173/account`

## Step 4: Test Database Connection

After running database.sql, test the connection:

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 3000
Connected to Supabase
```

## Step 5: Test an API Endpoint

Open Postman or your browser and test:

**GET** `http://localhost:3000/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## ⚠️ Important Notes

### Credentials Security
- ✅ Anon Key is safe to expose (frontend)
- ✅ Service Role Key is in `.env` (backend only)
- 🔒 Keep Service Role Key SECRET - never commit to git

### Database Access
- Supabase provides PostgreSQL access
- RLS policies automatically enforce security
- Users can only see their own data

### CORS Configuration
Backend `.env` has:
```
CORS_ORIGIN=http://localhost:5173
```

This allows your frontend (running on port 5173) to access the backend (running on port 3000).

---

## 🔧 Troubleshooting

### Error: "Cannot connect to Supabase"
1. Check `.env` has correct URL and keys
2. Verify internet connection
3. Visit the Supabase URL in browser to confirm project exists

### Error: "Table does not exist"
1. Ensure database.sql was executed successfully
2. Check SQL Editor history for errors
3. Re-run database.sql if needed

### Error: "RLS policy violation"
1. Check you're using correct role (anon vs service_role)
2. Verify RLS policies were created (check Tables → RLS)
3. Ensure authenticated user making requests

### Error: "Port 3000 already in use"
Change port in backend `.env`:
```
PORT=3001
```

---

## ✅ Verification Checklist

- [ ] Supabase project is active
- [ ] Database.sql executed successfully
- [ ] All 10 tables created
- [ ] RLS policies enabled
- [ ] Email auth provider enabled
- [ ] Backend `npm install` completed
- [ ] Backend starts with `npm run dev`
- [ ] Health check endpoint responds
- [ ] Frontend can reach backend at `http://localhost:3000`

---

## Next Steps After Setup

1. ✅ Backend dependencies installed
2. ⏳ Execute database.sql in Supabase
3. ⏳ Start backend with `npm run dev`
4. ⏳ Test API endpoints
5. ⏳ Update frontend to use backend API
6. ⏳ Test full signup/login flow

**Questions?** Check Supabase docs at https://supabase.com/docs
