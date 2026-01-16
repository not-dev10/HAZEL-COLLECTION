# 🚨 CRITICAL FIXES - IMPLEMENTATION GUIDE
**Priority:** MUST COMPLETE BEFORE PRODUCTION  
**Estimated Time:** 1-2 weeks  
**Date:** January 16, 2026

---

## 1. 🔐 FIX EXPOSED CREDENTIALS

### Issue
Sensitive credentials exposed in `.env` file committed to git history.

### Step 1: Rotate All Secrets

```bash
# Generate new JWT_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate new REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate new ENCRYPTION_KEY (64 hex characters = 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Update .env with New Secrets

```bash
# backend/.env
JWT_SECRET=<NEW_SECRET_HERE>
REFRESH_TOKEN_SECRET=<NEW_SECRET_HERE>
ENCRYPTION_KEY=<NEW_SECRET_HERE>
```

### Step 3: Rotate Cloudinary Credentials

1. Go to Cloudinary Dashboard
2. Settings → API Keys
3. Regenerate API Secret
4. Update `.env`:

```bash
CLOUDINARY_API_KEY=<NEW_KEY>
CLOUDINARY_API_SECRET=<NEW_SECRET>
```

### Step 4: Rotate Email Credentials

1. Gmail: Generate new App Password
2. Update `.env`:

```bash
SMTP_PASS=<NEW_APP_PASSWORD>
```

### Step 5: Create .env.example (No Secrets)

```bash
# backend/.env.example
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_min_32_chars
ENCRYPTION_KEY=your_encryption_key_here_64_hex_chars

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

FRONTEND_URL=http://localhost:8080

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

MAIL_FROM_NAME=Your Company Name

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_in_production

ADMIN_ALLOWED_IPS=
```

### Step 6: Verify .env is in .gitignore

```bash
# .gitignore
.env
.env.example
.env.local
.env.*.local
```

### Step 7: Remove from Git History (Already Done)

```bash
# Already completed in previous step
git log --oneline | head -5
```

---

## 2. 🔒 IMPLEMENT HTTPS ENFORCEMENT

### Step 1: Add HTTPS Redirect Middleware

**File:** `backend/src/middleware/https.middleware.js`

```javascript
/**
 * HTTPS Enforcement Middleware
 * Redirects all HTTP requests to HTTPS in production
 */

export const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Check if request is already HTTPS
    const isHttps = 
      req.header('x-forwarded-proto') === 'https' ||
      req.protocol === 'https';

    if (!isHttps) {
      // Redirect to HTTPS
      const host = req.header('host');
      return res.redirect(301, `https://${host}${req.url}`);
    }
  }
  next();
};

export default httpsRedirect;
```

### Step 2: Add to app.js

```javascript
// backend/src/app.js
import httpsRedirect from './middleware/https.middleware.js';

// Add HTTPS redirect as first middleware
app.use(httpsRedirect);

// ... rest of middleware
```

### Step 3: Update Helmet Configuration

```javascript
// backend/src/app.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  permittedCrossDomainPolicies: false,
  expectCT: {
    maxAge: 86400,
    enforce: true
  }
}));
```

### Step 4: Configure SSL Certificate

**For Vercel/Netlify:** Automatic SSL  
**For Self-Hosted:**

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Configure Nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://localhost:5000;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

---

## 3. 🛡️ IMPLEMENT CSRF PROTECTION

### Step 1: Install CSRF Package

```bash
cd backend
npm install csurf
```

### Step 2: Create CSRF Middleware

**File:** `backend/src/middleware/csrf.middleware.js`

```javascript
import csrf from 'csurf';

// CSRF protection middleware
export const csrfProtection = csrf({ cookie: false });

// Generate CSRF token for forms
export const generateCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export default {
  csrfProtection,
  generateCsrfToken
};
```

### Step 3: Add to app.js

```javascript
// backend/src/app.js
import { csrfProtection, generateCsrfToken } from './middleware/csrf.middleware.js';

// Add CSRF protection to all state-changing routes
app.use(csrfProtection);

// Generate token for forms
app.use(generateCsrfToken);
```

### Step 4: Update Routes

```javascript
// backend/src/routes/order.routes.js
import { csrfProtection } from '../middleware/csrf.middleware.js';

// Protect state-changing operations
router.post('/', csrfProtection, requireAuth, validateOrderCreation, createOrder);
router.put('/:orderId/status', csrfProtection, requireAuth, requireAdmin, updateOrderStatus);
router.delete('/:orderId', csrfProtection, requireAuth, requireAdmin, deleteOrder);
```

### Step 5: Frontend Implementation

```typescript
// frontend/src/lib/api.ts
export const apiCall = async (
  url: string,
  options: RequestInit = {},
  retried: boolean = false
): Promise<Response> => {
  const accessToken = TokenManager.getAccessToken();
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  const headers = {
    ...options.headers,
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
  } as Record<string, string>;

  return fetch(url, { ...options, headers });
};
```

---

## 4. 🔑 FIX AUTHORIZATION CHECKS

### Issue
Order routes missing authentication and authorization checks.

### Step 1: Update Order Routes

**File:** `backend/src/routes/order.routes.js`

```javascript
import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validateOrderCreation, validateMongoId } from '../middleware/validation.middleware.js';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
  trackOrderByNumber,
  requestOrderOTP,
  verifyOrderOTP,
} from '../controllers/order.controller.js';

const router = express.Router();

// PUBLIC: OTP-based order tracking (no auth required)
router.post('/request-otp', requestOrderOTP);
router.post('/verify-otp', verifyOrderOTP);

// PUBLIC: Track order by order number (no auth required)
router.get('/track/:orderNumber', trackOrderByNumber);

// PROTECTED: Create new order (requires auth)
router.post('/', requireAuth, validateOrderCreation, createOrder);

// PROTECTED: Get user's orders (requires auth)
router.get('/', requireAuth, getUserOrders);

// PROTECTED: Get specific order (requires auth + ownership verification)
router.get('/:orderId', requireAuth, validateMongoId, getOrderById);

// ADMIN ONLY: Update order status
router.put('/:orderId/status', requireAuth, requireAdmin, validateMongoId, updateOrderStatus);

// ADMIN ONLY: Delete order
router.delete('/:orderId', requireAuth, requireAdmin, validateMongoId, deleteOrder);

export default router;
```

### Step 2: Update Order Controller

**File:** `backend/src/controllers/order.controller.js`

```javascript
/**
 * GET /api/orders/:orderId
 * Get specific order with ownership verification
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id; // From auth middleware

    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ✅ CRITICAL: Verify ownership (prevent IDOR)
    if (order.userId && order.userId.toString() !== userId) {
      console.log(`❌ IDOR attempt: User ${userId} tried to access order ${orderId} owned by ${order.userId}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this order"
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

/**
 * PUT /api/orders/:orderId/status
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await Order.updateStatus(orderId, status);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Log admin action
    console.log(`✅ Admin ${adminId} updated order ${orderId} status to ${status}`);

    res.json({
      success: true,
      message: "Order status updated",
      order: result
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};
```

### Step 3: Update Product Routes

**File:** `backend/src/routes/product.routes.js`

```javascript
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validateProduct, validateMongoId } from "../middleware/validation.middleware.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

// GET all products - public
router.get("/", getAllProducts);

// GET single product - public
router.get("/:id", validateMongoId, getProductById);

// CREATE product - admin only with validation
router.post("/", requireAuth, requireAdmin, validateProduct, createProduct);

// UPDATE product - admin only with validation
router.put("/:id", requireAuth, requireAdmin, validateMongoId, validateProduct, updateProduct);

// DELETE product - admin only
router.delete("/:id", requireAuth, requireAdmin, validateMongoId, deleteProduct);

export default router;
```

---

## 5. 💾 IMPLEMENT SESSION PERSISTENCE

### Step 1: Install Dependencies

```bash
cd backend
npm install express-session connect-mongo
```

### Step 2: Create Session Middleware

**File:** `backend/src/middleware/sessionPersistence.js`

```javascript
import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update (24 hours)
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  },
  name: 'sessionId' // Custom session cookie name
});

export default sessionMiddleware;
```

### Step 3: Add to app.js

```javascript
// backend/src/app.js
import sessionMiddleware from './middleware/sessionPersistence.js';

// Add session middleware after CORS
app.use(cors(corsOptions));
app.use(sessionMiddleware);

// ... rest of middleware
```

### Step 4: Update .env

```bash
# backend/.env
SESSION_SECRET=<NEW_SECRET_32_CHARS>
```

---

## 6. 🔐 ADD ENCRYPTION FOR SENSITIVE DATA

### Step 1: Create Encryption Utility

**File:** `backend/src/utils/encryption.js`

```javascript
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive data
 */
export const encryptData = (data) => {
  if (!data) return null;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(String(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (IV needed for decryption)
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;

  try {
    const [iv, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(iv, 'hex')
    );
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export default {
  encryptData,
  decryptData
};
```

### Step 2: Update User Model

```javascript
// backend/src/models/User.js
import { encryptData, decryptData } from '../utils/encryption.js';

export class User {
  static async create({ email, password, fullName, phone, dateOfBirth, gender }) {
    const db = getDB();
    const users = db.collection("users");

    // ... existing code ...

    const result = await users.insertOne({
      email,
      password: hashedPassword,
      fullName,
      phone: encryptData(phone), // ✅ Encrypt phone
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || '',
      address: encryptData(''), // ✅ Encrypt address
      city: encryptData(''),
      country: 'United Kingdom',
      // ... rest of fields
    });

    return {
      id: result.insertedId.toString(),
      email,
      fullName,
      phone: decryptData(phone), // Decrypt for response
      dateOfBirth,
      gender
    };
  }

  static async updateProfile(userId, updates) {
    const db = getDB();
    const users = db.collection("users");

    const allowedUpdates = ['fullName', 'phone', 'gender', 'address', 'city', 'country'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (key in updates) {
        // Encrypt sensitive fields
        if (['phone', 'address', 'city'].includes(key)) {
          filteredUpdates[key] = encryptData(updates[key]);
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    // ... rest of update logic
  }

  static formatCustomerResponse(user) {
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      name: user.fullName || '',
      email: user.email,
      phone: decryptData(user.phone) || '', // ✅ Decrypt for response
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
      address: decryptData(user.address) || '', // ✅ Decrypt
      city: decryptData(user.city) || '',
      // ... rest of fields
    };
  }
}
```

---

## 7. ✅ APPLY INPUT VALIDATION TO ALL ROUTES

### Step 1: Update All Route Files

**Example:** `backend/src/routes/cart.routes.js`

```javascript
import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateCartItem, validateMongoId } from "../middleware/validation.middleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart
} from "../controllers/cart.controller.js";

const router = express.Router();

// Get cart
router.get("/", requireAuth, getCart);

// Add to cart with validation
router.post("/add", requireAuth, validateCartItem, addToCart);

// Update cart item with validation
router.put("/:itemId", requireAuth, validateMongoId, validateCartItem, updateCartItem);

// Remove from cart
router.delete("/:itemId", requireAuth, validateMongoId, removeFromCart);

// Clear cart
router.delete("/", requireAuth, clearCart);

export default router;
```

---

## 8. 🚀 DEPLOYMENT CHECKLIST

### Before Deploying:

```bash
# 1. Run security audit
npm audit

# 2. Run tests
npm test

# 3. Check for console.log statements
grep -r "console.log" backend/src --exclude-dir=node_modules

# 4. Verify .env is not committed
git status | grep ".env"

# 5. Verify all secrets are rotated
echo "Check .env file for new secrets"

# 6. Test HTTPS redirect
curl -I http://yourdomain.com

# 7. Test CSRF protection
# Make POST request without CSRF token - should fail

# 8. Test authorization
# Try accessing admin endpoints without admin role - should fail
```

---

## 📋 IMPLEMENTATION TIMELINE

| Week | Task | Status |
|------|------|--------|
| Week 1 | Rotate secrets, HTTPS, CSRF | 🔴 TODO |
| Week 1 | Fix authorization, session persistence | 🔴 TODO |
| Week 2 | Add encryption, input validation | 🔴 TODO |
| Week 2 | Security testing & fixes | 🔴 TODO |
| Week 3 | Performance testing & optimization | 🔴 TODO |
| Week 4 | Final review & deployment prep | 🔴 TODO |
| Week 5 | Deploy to production | 🔴 TODO |

---

## ✅ VERIFICATION CHECKLIST

After implementing each fix:

- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] No security warnings
- [ ] Functionality works as expected
- [ ] Performance acceptable
- [ ] Logged and monitored

---

**Last Updated:** January 16, 2026  
**Next Review:** After Phase 1 implementation
