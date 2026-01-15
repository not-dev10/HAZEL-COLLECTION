# 🚨 CRITICAL SECURITY FIXES - QUICK START GUIDE

## ⚡ IMMEDIATE ACTIONS (DO THIS NOW!)

### 1. Create .gitignore File
```bash
# Run this in the root directory
cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local
backend/.env
frontend/.env

# Dependencies
node_modules/
*/node_modules/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db
.DS_Store?

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/
*.tsbuildinfo
.next/
out/

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
EOF
```

### 2. Remove .env from Git History (IF ALREADY COMMITTED)
```bash
# WARNING: This rewrites git history!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team first!)
git push origin --force --all
```

### 3. Rotate ALL Credentials

#### A. MongoDB
1. Go to MongoDB Atlas → Database Access
2. Edit user "Dexter" → Change password
3. Update `.env` with new password

#### B. Cloudinary
1. Go to Cloudinary Dashboard → Settings → Security
2. Regenerate API Secret
3. Update `.env` with new secret

#### C. SMTP
1. Go to Google Account → Security → App Passwords
2. Delete old app password
3. Generate new app password
4. Update `.env` with new password

#### D. JWT Secret
```bash
# Generate new JWT secret
openssl rand -base64 64

# Update .env:
JWT_SECRET=<paste_generated_secret_here>
REFRESH_TOKEN_SECRET=<paste_another_generated_secret_here>
```

#### E. Remove Hardcoded Admin Password
```env
# DELETE these lines from .env:
ADMIN_EMAIL=hazellabel@gmail.com
ADMIN_PASSWORD=hazellabel@2026

# Create admin through secure script instead
```

### 4. Fix TLS Certificate Validation

**File:** `backend/src/config/mongodb.js`
```javascript
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  tls: true,
  // ❌ REMOVE THESE TWO LINES:
  // tlsAllowInvalidCertificates: true,
  // tlsAllowInvalidHostnames: true,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
});
```

**File:** `backend/package.json`
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 5. Fix Admin Privilege Escalation

**File:** `backend/src/controllers/auth.controller.js`

Replace the `adminLogin` function:

```javascript
export const adminLogin = async (req, res) => {
  try {
    console.log("🔐 Admin login attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ CHECK IF USER IS ACTUALLY AN ADMIN
    if (user.role !== 'admin') {
      console.log(`❌ Non-admin user attempted admin login: ${email}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    console.log("✓ User found:", email);

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ Password verified");

    // Issue JWT - use user's actual role, don't override
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✓ Token issued");

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};
```

### 6. Add Rate Limiting to Auth Routes

**File:** `backend/src/routes/auth.routes.js`

```javascript
import express from "express";
import { 
  signup, login, adminLogin, forgotPassword, 
  resetPassword, requestSignupOTP, verifySignupOTP 
} from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.js";  // ✅ Import

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Auth API is running" });
});

// ✅ Add rate limiting to all auth endpoints
router.post("/register/request-otp", authLimiter, requestSignupOTP);
router.post("/register/verify-otp", authLimiter, verifySignupOTP);
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/admin-login", authLimiter, adminLogin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
```

### 7. Fix require() in ES Modules

**File:** `backend/src/controllers/auth.controller.js`

At the top of the file, add:
```javascript
import crypto from 'crypto';
```

Then replace lines 249-250:
```javascript
// ❌ OLD:
const resetToken = require('crypto').randomBytes(32).toString('hex');
const hashedToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');

// ✅ NEW:
const resetToken = crypto.randomBytes(32).toString('hex');
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
```

### 8. Install Security Headers

```bash
cd backend
npm install helmet
```

**File:** `backend/src/app.js`

Add at the top:
```javascript
import helmet from 'helmet';
```

Add after `const app = express();`:
```javascript
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### 9. Fix CORS Configuration

**File:** `backend/src/app.js`

Replace the CORS configuration:
```javascript
// ❌ OLD: Allows all localhost
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// ✅ NEW: Specific origins only
const allowedOrigins = [
  'http://localhost:8080',
  process.env.FRONTEND_URL,
  // Add production domains here
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`🌐 CORS: Allowing origin ${origin}`);
      return callback(null, true);
    }
    
    console.log(`❌ CORS: Blocked origin ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 10. Reduce Request Size Limits

**File:** `backend/src/app.js`

```javascript
// ❌ OLD:
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ NEW:
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Special limit for image upload routes only
app.use('/api/upload', express.json({ limit: '10mb' }));
app.use('/api/cloudinary', express.json({ limit: '10mb' }));
```

---

## 🧪 TESTING YOUR FIXES

### 1. Test Admin Login Security
```bash
# This should FAIL if user is not admin
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"regular@user.com","password":"password123"}'

# Expected: 403 Forbidden
```

### 2. Test Rate Limiting
```bash
# Run this 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 6th request should return 429 Too Many Requests
```

### 3. Test TLS Connection
```bash
# Should connect without errors
node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI, {tls:true}).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"
```

### 4. Verify .env is Ignored
```bash
git status
# Should NOT show .env file
```

---

## 📋 VERIFICATION CHECKLIST

After completing all fixes:

- [ ] `.gitignore` file created
- [ ] `.env` removed from git (if was committed)
- [ ] MongoDB password rotated
- [ ] Cloudinary API secret rotated
- [ ] SMTP password rotated
- [ ] JWT secret regenerated (64+ characters)
- [ ] Hardcoded admin password removed
- [ ] TLS certificate validation enabled
- [ ] Admin privilege escalation fixed
- [ ] Rate limiting added to auth routes
- [ ] `require()` replaced with `import`
- [ ] Helmet.js installed and configured
- [ ] CORS restricted to specific origins
- [ ] Request size limits reduced
- [ ] All tests passing
- [ ] Backend restarts without errors
- [ ] Frontend connects successfully

---

## 🆘 TROUBLESHOOTING

### "Cannot connect to MongoDB"
- Check new password is correct in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure TLS is enabled

### "CORS error"
- Add your frontend URL to `allowedOrigins`
- Check `FRONTEND_URL` in `.env`

### "Rate limit too strict"
- Adjust limits in `backend/src/middleware/rateLimiter.js`
- Increase `max` value for development

### "Admin login fails"
- Ensure at least one user has `role: 'admin'` in database
- Run admin creation script: `node backend/scripts/create-admin.js`

---

## 📞 NEED HELP?

If you encounter issues:
1. Check the full audit report: `audits/SECURITY_AUDIT_REPORT.md`
2. Review error logs in console
3. Test each fix individually
4. Rollback if needed: `git checkout <file>`

---

**Last Updated:** January 15, 2026  
**Priority:** 🔴 CRITICAL - Complete within 24 hours
