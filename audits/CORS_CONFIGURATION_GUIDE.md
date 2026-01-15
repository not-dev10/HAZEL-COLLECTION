# 🌐 CORS Configuration Guide

## Overview

CORS (Cross-Origin Resource Sharing) has been configured securely with environment-based settings for development and production.

---

## 🔒 **Current Configuration**

### **Development (Local)**
- **Frontend:** `http://localhost:8080`
- **Backend:** `http://localhost:5000`
- **Allowed Origins:** Only `localhost:8080`

### **Production (Deployment)**
- **Frontend:** `https://didifashion.com`
- **Backend:** Your production API URL
- **Allowed Origins:** Only `didifashion.com` and `www.didifashion.com`

---

## ✅ **What Was Fixed**

### ❌ **BEFORE (Insecure):**
```javascript
// Accepted ANY localhost port - DANGEROUS!
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
if (isLocalhost) {
  return callback(null, true); // ← Allows localhost:3000, localhost:9999, etc.
}
```

**Problem:**
- Allowed **ANY** localhost port
- Attacker could run malicious site on `localhost:3000` and access your API
- No distinction between development and production

### ✅ **AFTER (Secure):**
```javascript
// Development: Only specific port
if (process.env.NODE_ENV === 'development') {
  const allowedDevOrigins = [
    'http://localhost:8080',  // ← ONLY port 8080
    'http://127.0.0.1:8080',
  ];
  
  if (allowedDevOrigins.includes(origin)) {
    return callback(null, true);
  }
}

// Production: Only your domain
if (process.env.NODE_ENV === 'production') {
  const allowedProdOrigins = [
    'https://didifashion.com',
    'https://www.didifashion.com',
  ];
  
  if (allowedProdOrigins.includes(origin)) {
    return callback(null, true);
  }
}

// Block everything else
callback(new Error('Not allowed by CORS'));
```

---

## 🚀 **Deployment Instructions**

### **Step 1: Update Environment Variables**

When deploying to production, update your `.env` file:

```bash
# .env (Production)
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://didifashion.com
CORS_ORIGIN=https://didifashion.com
```

### **Step 2: Verify CORS Settings**

The code automatically detects the environment:

**Development:**
```javascript
// Automatically allows:
✅ http://localhost:8080
✅ http://127.0.0.1:8080
❌ http://localhost:3000 (blocked)
❌ http://localhost:9999 (blocked)
```

**Production:**
```javascript
// Automatically allows:
✅ https://didifashion.com
✅ https://www.didifashion.com
❌ http://localhost:8080 (blocked)
❌ https://attacker.com (blocked)
```

---

## 📋 **Configuration Details**

### **CORS Options:**

```javascript
{
  origin: (origin, callback) => { ... },  // Dynamic origin checking
  credentials: true,                       // Allow cookies & auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  exposedHeaders: ['X-New-Token', 'X-Token-Rotated'],
  maxAge: 86400,                          // Cache preflight for 24 hours
}
```

### **Allowed Methods:**
- ✅ GET - Fetch data
- ✅ POST - Create data
- ✅ PUT - Update data (full)
- ✅ PATCH - Update data (partial)
- ✅ DELETE - Delete data
- ✅ OPTIONS - Preflight requests

### **Allowed Headers:**
- ✅ `Content-Type` - JSON/form data
- ✅ `Authorization` - JWT tokens
- ✅ `X-Session-ID` - Guest sessions

### **Exposed Headers:**
- ✅ `X-New-Token` - Token rotation
- ✅ `X-Token-Rotated` - Token refresh indicator

---

## 🧪 **Testing**

### **Test 1: Development (Allowed)**
```bash
# From localhost:8080
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/products

# Expected: 200 OK with CORS headers
# Access-Control-Allow-Origin: http://localhost:8080
# Access-Control-Allow-Credentials: true
```

### **Test 2: Wrong Port (Blocked)**
```bash
# From localhost:3000
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/products

# Expected: CORS error
# ❌ CORS: Blocked unauthorized origin http://localhost:3000
```

### **Test 3: Production (Allowed)**
```bash
# From production domain
curl -H "Origin: https://didifashion.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.didifashion.com/api/products

# Expected: 200 OK with CORS headers
```

---

## 🔧 **Frontend Configuration**

### **Axios Setup (Recommended)**

```javascript
// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.didifashion.com'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← IMPORTANT: Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### **Fetch API Setup**

```javascript
// Always include credentials
fetch('http://localhost:5000/api/products', {
  method: 'GET',
  credentials: 'include', // ← IMPORTANT: Send cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 🌍 **Deployment Platforms**

### **Vercel (Frontend)**

```javascript
// vercel.json
{
  "env": {
    "VITE_API_URL": "https://api.didifashion.com"
  }
}
```

### **Railway/Render (Backend)**

```bash
# Environment Variables
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://didifashion.com
CORS_ORIGIN=https://didifashion.com
```

### **Custom Domain Setup**

If using custom domain:
1. Frontend: `https://didifashion.com`
2. Backend: `https://api.didifashion.com`

Update `.env`:
```bash
FRONTEND_URL=https://didifashion.com
```

---

## ⚠️ **Common Issues**

### **Issue 1: CORS Error in Browser**

**Error:**
```
Access to fetch at 'http://localhost:5000/api/products' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Make sure frontend is running on port **8080**, not 3000
- Check `NODE_ENV` is set to `development`
- Verify origin in request matches allowed origins

### **Issue 2: Credentials Not Sent**

**Error:**
```
Cookies not being sent with request
```

**Solution:**
```javascript
// Add withCredentials or credentials: 'include'
axios.defaults.withCredentials = true;

// OR
fetch(url, { credentials: 'include' });
```

### **Issue 3: Production CORS Blocked**

**Error:**
```
CORS: Blocked unauthorized origin https://yourdomain.com
```

**Solution:**
1. Set `NODE_ENV=production` in backend
2. Update `FRONTEND_URL` in `.env`
3. Restart backend server

---

## 📊 **Security Benefits**

### **Before Fix:**
- ❌ Accepted ANY localhost port
- ❌ No environment separation
- ❌ Vulnerable to local attacks
- ❌ No production security

### **After Fix:**
- ✅ Only specific ports allowed
- ✅ Environment-based configuration
- ✅ Protected from local attacks
- ✅ Production-ready security

---

## 🎯 **Best Practices**

### **1. Never Use Wildcards**
```javascript
// ❌ NEVER DO THIS
app.use(cors({ origin: '*' }));

// ✅ ALWAYS DO THIS
app.use(cors({ 
  origin: ['https://yourdomain.com'],
  credentials: true 
}));
```

### **2. Always Enable Credentials**
```javascript
// Required for cookies and auth headers
credentials: true
```

### **3. Use Environment Variables**
```javascript
// Don't hardcode domains
origin: process.env.FRONTEND_URL

// Do use environment variables
origin: ['https://didifashion.com']
```

### **4. Separate Dev and Prod**
```javascript
if (process.env.NODE_ENV === 'production') {
  // Production origins
} else {
  // Development origins
}
```

---

## 📁 **Files Modified**

1. ✅ `backend/src/app.js` - CORS configuration
2. ✅ `backend/.env` - Environment variables

---

## 🚦 **Quick Reference**

### **Development:**
```
Frontend: http://localhost:8080
Backend:  http://localhost:5000
Allowed:  localhost:8080 only
```

### **Production:**
```
Frontend: https://didifashion.com
Backend:  https://api.didifashion.com
Allowed:  didifashion.com only
```

### **Environment Variables:**
```bash
# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Production
NODE_ENV=production
FRONTEND_URL=https://didifashion.com
```

---

## ✅ **Verification Checklist**

- [x] CORS only allows specific origins
- [x] No wildcard (*) usage
- [x] Credentials enabled
- [x] Environment-based configuration
- [x] Development uses localhost:8080
- [x] Production uses didifashion.com
- [x] Proper headers configured
- [x] Preflight caching enabled

---

## 📞 **Support**

### **If CORS Issues Persist:**

1. **Check browser console** for exact error
2. **Verify origin** in request matches allowed list
3. **Check NODE_ENV** is set correctly
4. **Restart backend** after .env changes
5. **Clear browser cache** and cookies

---

**CORS is now properly configured for both development and production!** 🔒✅

---

**Last Updated:** January 15, 2026  
**Status:** ✅ **PRODUCTION READY**
