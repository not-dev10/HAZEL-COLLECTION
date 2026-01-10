# Didi Fashion E-Commerce Platform - Complete Implementation Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [What's Already Done](#whats-already-done)
5. [What's Pending](#whats-pending)
6. [Asset & Image Management](#asset--image-management)
7. [Database Setup](#database-setup)
8. [Step-by-Step Implementation](#step-by-step-implementation)

---

## Project Overview

**Didi Fashion** is a luxury fashion e-commerce platform built with a modern tech stack.

### Key Features
- 👗 Product catalog with collections
- 🛒 Shopping cart functionality
- ❤️ Wishlist management
- 👤 User authentication (signup/login)
- 🖼️ Image management via Cloudinary
- 💾 MongoDB database for persistence
- 📱 Responsive design
- ⚡ Real-time data sync

### Technology Stack
```
Frontend:  React + TypeScript + Vite + Tailwind CSS
Backend:   Node.js + Express + JWT
Database:  MongoDB
Storage:   Cloudinary (CDN for images)
```

---

## Architecture

### Project Structure
```
didi-monorepo/
├── frontend/                    # React app
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # Reusable components
│   │   ├── context/           # State management (Cart, Wishlist, User)
│   │   ├── lib/               # Utilities, API config
│   │   └── admin/             # Admin panel
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Express server
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database schemas
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Auth, validation
│   │   └── utils/             # Helper functions
│   ├── package.json
│   └── server.js
├── package.json               # Root workspace
└── test-*.js                  # Test scripts
```

### Data Flow
```
User Browser
    ↓
Frontend (React) ← Context API (Cart, Wishlist, User)
    ↓ (HTTP)
Backend API (Express)
    ↓
MongoDB Database ← Cloudinary (Images)
```

---

## Setup Instructions

### Prerequisites
- Node.js v16+ and npm
- MongoDB (local or Atlas)
- Cloudinary account
- Git

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repo-url>
cd didi-monorepo

# Install all dependencies
npm run install:all

# Or manually:
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Backend Setup

**Create `.env` file in `backend/` directory:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/didi?retryWrites=true&w=majority
DB_NAME=didi

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Start Backend:**
```bash
npm run backend:dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

**Create `.env` in `frontend/` directory:**

```env
VITE_API_BASE_URL=http://localhost:5000
```

**Start Frontend:**
```bash
npm run frontend:dev
# App runs on http://localhost:5173
```

### 4. Test the Setup

```bash
# Terminal 1: Backend running
npm run backend:dev

# Terminal 2: Run tests
npm run test:cart-wishlist

# Terminal 3: Run frontend
npm run frontend:dev
```

---

## What's Already Done

### ✅ Core Features Implemented

#### Authentication System
- ✅ User signup with email validation
- ✅ Login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Session persistence
- ✅ Role-based access (user/admin)
- ✅ Guest session handling

#### Product Management
- ✅ Product catalog with filtering
- ✅ Multiple collections (Ready to Wear, Festive, etc.)
- ✅ Product search functionality
- ✅ Dynamic product pages
- ✅ Collection pages
- ✅ Product images via Cloudinary

#### Shopping Cart
- ✅ Add/remove items
- ✅ Update quantities
- ✅ Calculate totals
- ✅ Cart persistence (localStorage + API)
- ✅ Guest session support
- ✅ Clear cart functionality

#### Wishlist
- ✅ Add/remove items
- ✅ View wishlist page
- ✅ Timestamp tracking (addedAt)
- ✅ Wishlist persistence
- ✅ Guest session support
- ✅ Add to cart from wishlist

#### Admin Panel
- ✅ Dashboard view
- ✅ Product management
- ✅ Order tracking
- ✅ Admin authentication
- ✅ User management interface

#### API Endpoints
**Cart:**
- ✅ GET `/api/cart` - Get cart items
- ✅ POST `/api/cart/add` - Add to cart
- ✅ DELETE `/api/cart/remove/:itemId` - Remove item
- ✅ PUT `/api/cart/update/:itemId` - Update quantity
- ✅ DELETE `/api/cart/clear` - Clear cart

**Wishlist:**
- ✅ GET `/api/wishlist` - Get wishlist items
- ✅ POST `/api/wishlist/add` - Add to wishlist
- ✅ DELETE `/api/wishlist/remove/:itemId` - Remove item
- ✅ DELETE `/api/wishlist/clear` - Clear wishlist

**Products:**
- ✅ GET `/api/products` - All products
- ✅ GET `/api/products/:id` - Single product
- ✅ GET `/api/products/collection/:slug` - Collection products

**Orders:**
- ✅ GET `/api/orders` - User orders
- ✅ POST `/api/orders` - Create order
- ✅ GET `/api/orders/:id` - Order details

**Auth:**
- ✅ POST `/api/auth/signup` - Create account
- ✅ POST `/api/auth/login` - Login user
- ✅ GET `/api/auth/me` - Get current user

#### Frontend Features
- ✅ Home page with featured products
- ✅ Product catalog
- ✅ Collection pages
- ✅ Product detail pages
- ✅ Shopping cart page
- ✅ Wishlist page
- ✅ User account page
- ✅ Admin panel
- ✅ Mobile responsive design
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Loading states

#### Database Models
- ✅ User (authentication, profile)
- ✅ Product (catalog)
- ✅ Cart (shopping cart)
- ✅ Wishlist (saved items)
- ✅ Order (transactions)

#### Testing
- ✅ Backend API test suite (25 tests)
- ✅ Frontend integration tests (18 tests)
- ✅ Test runner scripts (bash, batch, npm)

---

## What's Pending

### 🔲 Features in Development

#### Payment Integration
- ⏳ Stripe integration
- ⏳ Payment processing
- ⏳ Invoice generation
- ⏳ Refund handling

**What needs to be done:**
```javascript
// backend/src/controllers/payment.controller.js (TO DO)
export const processPayment = async (req, res) => {
  // Implement Stripe payment
  // 1. Validate order total
  // 2. Create Stripe PaymentIntent
  // 3. Process payment
  // 4. Update order status
  // 5. Send confirmation email
};
```

#### Email Notifications
- ⏳ Account confirmation emails
- ⏳ Order confirmation
- ⏳ Shipping notifications
- ⏳ Password reset emails

**What needs to be done:**
```javascript
// backend/src/services/email.service.js (TO DO)
export const sendOrderConfirmation = async (email, order) => {
  // Use Nodemailer or SendGrid
  // Send HTML email template
  // Include order details
};
```

#### Inventory Management
- ⏳ Stock tracking
- ⏳ Low stock alerts
- ⏳ Backorder handling
- ⏳ Size/color variants

**What needs to be done:**
```javascript
// backend/src/models/Inventory.js (TO DO)
export class Inventory {
  static async checkStock(productId, size, color) {
    // Check if item is in stock
    // Return quantity available
  }

  static async reduceStock(productId, quantity) {
    // Reduce stock after purchase
    // Trigger alerts if low
  }
};
```

#### Advanced Search & Filtering
- ⏳ Price range filtering
- ⏳ Material filtering
- ⏳ Season filtering
- ⏳ Sort options
- ⏳ Advanced search

**What needs to be done:**
```javascript
// backend/src/routes/product.routes.js (TO DO)
router.get('/search', async (req, res) => {
  // Implement MongoDB text search
  // Apply filters: price, material, season
  // Apply sorting: price, newest, popular
  // Pagination
});
```

#### Reviews & Ratings
- ⏳ Product reviews
- ⏳ Star ratings
- ⏳ Review moderation
- ⏳ Customer feedback

**What needs to be done:**
```javascript
// backend/src/models/Review.js (TO DO)
export class Review {
  static async createReview(productId, userId, rating, text) {
    // Validate rating (1-5)
    // Store review
    // Update product rating average
  }
};
```

#### Shipping Integration
- ⏳ Real-time shipping rates
- ⏳ Tracking numbers
- ⏳ Multiple carriers (FedEx, UPS, DHL)
- ⏳ Address validation

**What needs to be done:**
```javascript
// backend/src/services/shipping.service.js (TO DO)
export const getShippingRates = async (zipCode, weight) => {
  // Call shipping API
  // Return available options
  // Calculate costs
};
```

#### Analytics & Reporting
- ⏳ Sales dashboard
- ⏳ Customer analytics
- ⏳ Product performance
- ⏳ Conversion tracking

---

## Asset & Image Management

### Cloudinary Setup

#### 1. Create Cloudinary Account
```
1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email
3. Confirm email
4. Log in to dashboard
```

#### 2. Get Your Credentials
```
Dashboard → Settings → API Keys

Copy:
- Cloud Name: xxx_xxxxx
- API Key: 123456789
- API Secret: xxxxxxxxxxxxx
```

#### 3. Create Upload Preset
```
Settings → Upload
→ Add Upload Preset
→ Name: didi_preset
→ Folder: didi-fashion
→ Signing Mode: Unsigned (for frontend uploads)
→ Copy Preset Name
```

#### 4. Environment Variables
```env
# backend/.env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=didi_preset
```

### Image Naming Convention

```
cloudinary/
├── products/
│   ├── product-1-main.jpg
│   ├── product-1-alt-1.jpg
│   ├── product-2-main.jpg
├── collections/
│   ├── collection-name.jpg
├── banners/
│   ├── homepage-hero.jpg
└── thumbnails/
    ├── product-1-thumb.jpg
```

### Image Upload Methods

#### Method 1: Backend Upload (Secure)
```javascript
// backend/src/controllers/upload.controller.js
import cloudinary from 'cloudinary';

export const uploadProductImage = async (req, res) => {
  try {
    const file = req.files.image;
    
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: 'didi-fashion/products',
      public_id: `product-${Date.now()}`,
      quality: 'auto',
      fetch_format: 'auto',
      width: 800,
      height: 1000,
      crop: 'fill'
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Usage:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/image.jpg" \
  -H "Authorization: Bearer token"
```

#### Method 2: Frontend Upload (Widget)
```javascript
// frontend/src/components/ImageUpload.tsx
import { CldUploadWidget } from 'next-cloudinary';

export const ImageUpload = ({ onUpload }) => {
  return (
    <CldUploadWidget
      uploadPreset="didi_preset"
      onSuccess={(result) => onUpload(result.info.secure_url)}
    >
      {({ open }) => (
        <button onClick={() => open()}>
          Upload Image
        </button>
      )}
    </CldUploadWidget>
  );
};
```

#### Method 3: Direct URL from Cloudinary
```javascript
// For pre-existing images
const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${version}/path/to/image.jpg`;

// With transformations
const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_500,c_fill,q_auto,f_auto/path/to/image.jpg`;
```

### Image Transformations

```javascript
// Width and height
w_400,h_500

// Quality auto (best compression)
q_auto,f_auto

// Crop options
c_fill    // Fill area, crop excess
c_fit     // Fit inside, keep ratio
c_pad     // Add padding

// Examples
const thumb = `${imageUrl}?w_200,h_250,c_fill,q_auto`;
const full = `${imageUrl}?w_800,h_1000,c_fill,q_auto`;
const hero = `${imageUrl}?w_1920,h_600,c_fill,q_auto`;
```

### Image Management Code

```javascript
// lib/cloudinary.ts
export const CLOUDINARY_IMAGES = {
  // Products
  TEST_PRODUCT_1: 'didi-fashion/products/product-1',
  TEST_PRODUCT_2: 'didi-fashion/products/product-2',
  
  // Collections
  FESTIVE_COLLECTION: 'didi-fashion/collections/festive',
  PRET_COLLECTION: 'didi-fashion/collections/pret',
  
  // Banners
  HOMEPAGE_HERO: 'didi-fashion/banners/hero'
};

export const getProductImageUrl = (imagePath, size = 'full') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  const sizes = {
    thumbnail: 'w_200,h_250,c_fill,q_auto',
    medium: 'w_400,h_500,c_fill,q_auto',
    full: 'w_800,h_1000,c_fill,q_auto',
    hero: 'w_1920,h_600,c_fill,q_auto'
  };
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${sizes[size]}/${imagePath}`;
};
```

---

## Database Setup

### MongoDB Atlas (Cloud)

#### 1. Create Account
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up with email
3. Create organization
```

#### 2. Create Cluster
```
Project → Create Deployment
→ Choose "Shared" (free tier)
→ Select region (closest to you)
→ Create cluster
→ Wait 5-10 minutes for creation
```

#### 3. Create Database User
```
Security → Database Access
→ Add Database User
→ Username: didi-user
→ Password: (strong password)
→ Built-in Role: readWriteAnyDatabase
→ Add User
```

#### 4. Get Connection String
```
Deployment → Connect
→ Drivers
→ Driver: Node.js
→ Version: 4.x or higher
→ Copy Connection String

mongodb+srv://didi-user:password@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

#### 5. Add IP Address
```
Security → Network Access
→ Add IP Address
→ Choose "Allow Access from Anywhere" (for dev)
→ Or add your IP: xxx.xxx.xxx.xxx
```

#### 6. Update .env
```env
MONGODB_URI=mongodb+srv://didi-user:password@cluster.mongodb.net/didi?retryWrites=true&w=majority
DB_NAME=didi
```

### MongoDB Local Setup

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongod

# Windows
# Download from: https://www.mongodb.com/try/download/community
# Run installer and choose "Install as a service"
```

**Connect Locally:**
```env
MONGODB_URI=mongodb://localhost:27017/didi
DB_NAME=didi
```

### Database Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "hashed_password",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  role: "user", // "user" or "admin"
  isVerified: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### Products
```javascript
{
  _id: ObjectId,
  name: "Silk Saree",
  slug: "silk-saree",
  description: "Premium silk saree",
  price: 299.99,
  originalPrice: 399.99,
  images: [
    "cloudinary_url_1",
    "cloudinary_url_2"
  ],
  collection: "Ready to Wear",
  category: "Sarees",
  size: ["XS", "S", "M", "L", "XL"],
  color: ["Black", "Red", "Blue"],
  material: "Pure Silk",
  inStock: true,
  rating: 4.5,
  reviews: [ObjectId],
  createdAt: ISODate
}
```

#### Cart
```javascript
{
  _id: ObjectId,
  userId: ObjectId || null, // null for guests
  sessionId: "guest_session_id",
  isGuest: true,
  items: [
    {
      id: "product_id",
      name: "Product Name",
      price: 299.99,
      quantity: 2,
      image: "cloudinary_url",
      size: "M",
      color: "Black"
    }
  ],
  createdAt: ISODate,
  updatedAt: ISODate,
  expiresAt: ISODate // For guest carts (6 hours)
}
```

#### Orders
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  orderNumber: "ORD-2024-001",
  items: [...],
  status: "pending", // pending, confirmed, shipped, delivered
  total: 599.98,
  shippingAddress: {...},
  billingAddress: {...},
  paymentMethod: "card",
  paymentStatus: "paid",
  trackingNumber: "123456789",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Step-by-Step Implementation

### Minute-by-Minute Setup (First Run)

#### 0:00 - 1:00 | Prerequisites Check
```bash
# Check Node.js version
node --version  # Should be v16+

# Check npm
npm --version   # Should be v7+

# Check if git is installed
git --version
```

#### 1:00 - 3:00 | Clone Repository
```bash
# Clone the repo
git clone <repo-url>
cd didi-monorepo

# Verify structure
ls -la
# Should see: frontend/, backend/, package.json, etc.
```

#### 3:00 - 7:00 | Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend
cd frontend
npm install
cd ..

# Install backend
cd backend
npm install
cd ..
```

#### 7:00 - 10:00 | MongoDB Setup

**Option A: MongoDB Atlas (Cloud)**
```bash
# 1. Create account at mongodb.com/cloud/atlas
# 2. Create cluster (free tier)
# 3. Create database user
# 4. Get connection string
# 5. Whitelist IP
```

**Option B: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongod
```

#### 10:00 - 12:00 | Cloudinary Setup
```bash
# 1. Create account at cloudinary.com
# 2. Get API credentials from dashboard
# 3. Create upload preset
# 4. Note down: cloud name, API key, preset name
```

#### 12:00 - 13:00 | Backend Configuration
```bash
cd backend

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/didi
JWT_SECRET=your-secret-key-change-this
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=didi_preset
EOF

# Verify .env was created
cat .env
```

#### 13:00 - 14:00 | Frontend Configuration
```bash
cd ../frontend

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
EOF

cat .env
```

#### 14:00 - 15:00 | Start Backend
```bash
cd ../backend
npm run dev

# You should see:
# ✅ Connected to MongoDB
# 🚀 Server running on http://localhost:5000
# Keep this terminal open
```

#### 15:00 - 16:00 | Start Frontend (New Terminal)
```bash
# New terminal window
cd frontend
npm run frontend:dev

# You should see:
# ✅ VITE ready
# Local: http://localhost:5173
# Keep this terminal open
```

#### 16:00 - 17:00 | Test Everything (New Terminal)
```bash
# New terminal window
npm run test:frontend

# Expected: 18/18 tests pass
```

#### 17:00 - 18:00 | Run API Tests (Backend must be running)
```bash
npm run test:cart-wishlist

# Expected: 25/25 tests pass
```

### Total Time: ~20 minutes for complete setup

---

## Daily Development Workflow

### Start Development Server

```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run frontend:dev

# Terminal 3: Tests (optional)
npm run test:cart-wishlist
```

### Making Changes

#### Add New API Endpoint

```javascript
// 1. Create route
// backend/src/routes/myfeature.routes.js
import express from 'express';
import { myController } from '../controllers/myfeature.controller.js';

const router = express.Router();
router.get('/endpoint', myController);
export default router;

// 2. Create controller
// backend/src/controllers/myfeature.controller.js
export const myController = async (req, res) => {
  // Logic here
  res.json({ data: 'response' });
};

// 3. Add route to app.js
// backend/src/app.js
import myRoutes from './routes/myfeature.routes.js';
app.use('/api/myfeature', myRoutes);
```

#### Add New Frontend Page

```typescript
// frontend/src/pages/MyPage.tsx
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/endpoint')
      .then(r => r.json())
      .then(setData);
  }, []);

  return <div>Your page</div>;
}
```

#### Add Database Model

```javascript
// backend/src/models/MyModel.js
import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class MyModel {
  static async create(data) {
    const db = getDB();
    const result = await db.collection('mymodels').insertOne(data);
    return result;
  }

  static async find(query = {}) {
    const db = getDB();
    return await db.collection('mymodels').find(query).toArray();
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('mymodels').findOne({
      _id: new ObjectId(id)
    });
  }

  static async update(id, data) {
    const db = getDB();
    return await db.collection('mymodels').updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
  }

  static async delete(id) {
    const db = getDB();
    return await db.collection('mymodels').deleteOne({
      _id: new ObjectId(id)
    });
  }
}
```

### Deployment Checklist

Before deploying to production:

```bash
# 1. Build frontend
npm run frontend:build

# 2. Run tests
npm test

# 3. Build backend (if applicable)
npm run backend:build

# 4. Update environment variables
# - Use production MongoDB URL
# - Use production Cloudinary account
# - Update JWT secret
# - Update CORS origins

# 5. Deploy to hosting
# Frontend: Vercel, Netlify, AWS S3
# Backend: Heroku, Render, AWS EC2

# 6. Run health checks
curl https://yourdomain.com/api/health
```

---

## Troubleshooting

### Backend Won't Connect to MongoDB

```bash
# Check connection string
echo $MONGODB_URI

# Test connection
mongosh "$MONGODB_URI"

# Common issues:
# 1. IP not whitelisted (MongoDB Atlas)
# 2. Wrong password
# 3. Cluster not created yet
# 4. Database doesn't exist (auto-created on first write)
```

### Frontend API Errors

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check CORS issues in browser console
# Solution: Backend CORS settings in app.js
```

### Tests Failing

```bash
# Ensure backend is running
npm run backend:dev

# Clear any cached data
rm backend/data/* (if using file storage)

# Run tests with verbose output
DEBUG=* npm run test:cart-wishlist
```

### Image Upload Issues

```bash
# Check Cloudinary credentials in .env
echo $CLOUDINARY_CLOUD_NAME

# Verify preset exists
# Login to Cloudinary dashboard → Settings → Upload

# Test upload
curl -X POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload \
  -F "file=@image.jpg" \
  -F "upload_preset=didi_preset"
```

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run frontend:dev        # Start frontend dev server
npm run backend:dev         # Start backend dev server
npm run dev                 # Start both (if configured)

# Testing
npm test                    # Run all tests
npm run test:cart-wishlist  # Run API tests
npm run test:frontend       # Run frontend checks

# Building
npm run frontend:build      # Build for production
npm run backend:build       # Build backend (if applicable)

# Installation
npm run install:all         # Install all dependencies
npm run frontend:install    # Install frontend only
npm run backend:install     # Install backend only

# Database
# MongoDB local: mongosh
# MongoDB Atlas: use connection string in .env
```

### Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `frontend/.env` | Frontend configuration |
| `backend/src/app.js` | Express app setup |
| `frontend/src/App.tsx` | React root component |
| `backend/src/config/mongodb.js` | Database connection |
| `frontend/src/lib/api.ts` | API client configuration |
| `backend/src/models/*` | Database schemas |
| `frontend/src/context/*` | State management |

### API Documentation

**See swagger/API docs:**
```bash
# Coming soon - will be added
# For now, check backend/src/routes/*.routes.js for endpoints
```

---

## Admin Panel Implementation (PRIORITY)

### Overview
The admin panel is partially done but needs completion for full functionality. This section covers what needs to be implemented NOW.

### Current Status
- ✅ Admin routes created
- ✅ Authentication middleware
- ✅ Basic dashboard structure
- 🔲 Product management CRUD
- 🔲 Order management
- 🔲 User management
- 🔲 Analytics/reporting

### Step 1: Admin Routes Setup (Backend)

**File: `backend/src/routes/admin.routes.js`**

```javascript
import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Analytics
router.get('/analytics/sales', adminController.getSalesAnalytics);
router.get('/analytics/products', adminController.getProductAnalytics);

// Reports
router.get('/reports/daily', adminController.getDailyReport);
router.get('/reports/monthly', adminController.getMonthlyReport);

export default router;
```

### Step 2: Admin Controller (Backend)

**File: `backend/src/controllers/admin.controller.js`**

```javascript
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

// Dashboard
export const getDashboard = async (req, res) => {
  try {
    const totalSales = await Order.getTotalSales();
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalCustomers = await User.count({ role: 'user' });
    const recentOrders = await Order.getRecent(5);
    
    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', collection = '' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (collection) query.collection = collection;
    
    const products = await Product.find(query).skip(skip).limit(parseInt(limit));
    const total = await Product.count(query);
    
    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, originalPrice, collection, images, size, color, material } = req.body;
    
    // Validation
    if (!name || !price || !collection) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const product = await Product.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s/g, '-'),
      description,
      price,
      originalPrice,
      collection,
      images: images || [],
      size: size || [],
      color: color || [],
      material,
      inStock: true,
      createdAt: new Date()
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await Product.update(id, updateData);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.delete(id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Orders
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) query.status = status;
    
    const orders = await Order.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Order.count(query);
    
    res.json({
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.update(id, { status, updatedAt: new Date() });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const users = await User.find({}).skip(skip).limit(parseInt(limit));
    const total = await User.count();
    
    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.update(id, { role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.delete(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const orders = await Order.find({
      createdAt: { $gte: date }
    });
    
    const dailySales = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailySales[day] = (dailySales[day] || 0) + order.total;
    });
    
    res.json({ dailySales, total: orders.reduce((sum, o) => sum + o.total, 0) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductAnalytics = async (req, res) => {
  try {
    const products = await Product.find({});
    const analytics = products.map(p => ({
      id: p._id,
      name: p.name,
      sold: p.sold || 0,
      revenue: (p.sold || 0) * p.price
    }));
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const orders = await Order.find({
      createdAt: { $gte: new Date(today) }
    });
    
    res.json({
      date: today,
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrder: orders.length ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const date = new Date();
    date.setDate(1);
    
    const orders = await Order.find({
      createdAt: { $gte: date }
    });
    
    res.json({
      month: date.toISOString().slice(0, 7),
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrder: orders.length ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 3: Admin Frontend Components

**File: `frontend/src/pages/admin/Dashboard.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="metrics">
        <div className="metric-card">
          <h3>Total Sales</h3>
          <p className="value">${dashboard?.totalSales || 0}</p>
        </div>
        <div className="metric-card">
          <h3>Total Orders</h3>
          <p className="value">{dashboard?.totalOrders || 0}</p>
        </div>
        <div className="metric-card">
          <h3>Total Products</h3>
          <p className="value">{dashboard?.totalProducts || 0}</p>
        </div>
        <div className="metric-card">
          <h3>Total Customers</h3>
          <p className="value">{dashboard?.totalCustomers || 0}</p>
        </div>
      </div>

      <div className="admin-navigation">
        <button onClick={() => navigate('/admin/products')}>Manage Products</button>
        <button onClick={() => navigate('/admin/orders')}>View Orders</button>
        <button onClick={() => navigate('/admin/users')}>Manage Users</button>
        <button onClick={() => navigate('/admin/analytics')}>Analytics</button>
      </div>
    </div>
  );
}
```

**File: `frontend/src/pages/admin/ProductsManager.tsx`**

```typescript
import { useEffect, useState } from 'react';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    collection: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setFormData({ name: '', price: '', collection: '', description: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="products-manager">
      <h1>Manage Products</h1>
      
      <button onClick={() => setShowForm(!showForm)} className="btn-add">
        {showForm ? 'Cancel' : 'Add New Product'}
      </button>

      {showForm && (
        <form onSubmit={handleAddProduct} className="product-form">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <select
            value={formData.collection}
            onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
            required
          >
            <option>Select Collection</option>
            <option>Ready to Wear</option>
            <option>Festive</option>
            <option>Premium</option>
          </select>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button type="submit">Add Product</button>
        </form>
      )}

      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Collection</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.collection}</td>
              <td>
                <button className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 4: Admin Routes in App.tsx

**File: `frontend/src/App.tsx` (Add routes)**

```typescript
// Add these imports
import AdminDashboard from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';

// Add these routes in your router
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/products" element={<ProductsManager />} />
<Route path="/admin/orders" element={<OrdersManager />} />
<Route path="/admin/users" element={<UsersManager />} />
<Route path="/admin/analytics" element={<Analytics />} />
```

### Step 5: Add to app.js (Backend)

**File: `backend/src/app.js`**

```javascript
import adminRoutes from './routes/admin.routes.js';

// Add this line after other routes
app.use('/api/admin', adminRoutes);
```

---

## Deployment Checks & Testing

### Pre-Deployment Checklist

#### 1. Code Quality Checks
```bash
# Check for linting errors
npm run lint

# Check for TypeScript errors
npm run type-check

# Run all tests
npm test

# Expected: 0 errors, 43 tests passing
```

#### 2. Security Checks

**Environment Variables:**
```bash
# Verify all .env files have production values
# backend/.env
✅ MONGODB_URI - Production Atlas URL
✅ JWT_SECRET - Long random string (32+ chars)
✅ CLOUDINARY_CLOUD_NAME - Verified
✅ CORS_ORIGIN - Production URL only
✅ NODE_ENV=production

# frontend/.env
✅ VITE_API_BASE_URL - Production API URL
```

**Code Security:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 3. Performance Checks

```bash
# Frontend build size
npm run frontend:build
# Check output: "✅ dist size after gzip: XXX"
# Should be < 500KB for main bundle

# Backend startup time
npm run backend:dev
# Should start in < 2 seconds

# API response time
curl -w "@curl-format.txt" http://localhost:5000/api/products
# Should respond in < 200ms
```

#### 4. Database Checks

```bash
# Verify indexes exist
mongosh "$MONGODB_URI" << EOF
use didi;
db.products.getIndexes();
db.orders.getIndexes();
db.users.getIndexes();
EOF

# Check collections exist
db.collections()
# Should include: products, orders, users, carts, wishlists
```

#### 5. Image Asset Checks

```bash
# Verify Cloudinary connectivity
curl -I https://res.cloudinary.com/{your-cloud-name}/image/upload/didi-fashion/test.jpg

# Test upload
curl -X POST https://api.cloudinary.com/v1_1/{cloud-name}/image/upload \
  -F "file=@test-image.jpg" \
  -F "upload_preset=didi_preset"
```

### Testing Procedures

#### A. Unit Testing
```bash
# Run all unit tests
npm test

# Test specific feature
npm run test:cart-wishlist

# Test with coverage
npm run test:coverage
```

#### B. Integration Testing
```bash
# Test frontend integration
npm run test:frontend

# Test API endpoints
# Run backend, then:
npm run test:api
```

#### C. Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new email
- [ ] Login with valid credentials
- [ ] Login fails with wrong password
- [ ] Logout clears session
- [ ] Token persists on page reload

**Products:**
- [ ] Browse all products
- [ ] Filter by collection
- [ ] Search products
- [ ] View product details
- [ ] Images load from Cloudinary

**Cart:**
- [ ] Add item to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persists on reload
- [ ] Guest cart works

**Wishlist:**
- [ ] Add to wishlist
- [ ] View wishlist
- [ ] Remove from wishlist
- [ ] Move to cart from wishlist
- [ ] Timestamps display correctly

**Admin Panel:**
- [ ] Login as admin
- [ ] Dashboard loads
- [ ] View all products
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] View orders
- [ ] Update order status
- [ ] View users
- [ ] Analytics display

**Mobile:**
- [ ] Test on mobile viewport
- [ ] Touch interactions work
- [ ] Images responsive
- [ ] Navigation accessible

#### D. Browser Testing

```
Browsers to test:
✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)
✅ Mobile Safari (iOS)
✅ Chrome Mobile (Android)
```

#### E. Performance Testing

```javascript
// Measure API response times
const testAPI = async () => {
  const tests = [
    { name: 'GET /products', url: '/api/products' },
    { name: 'GET /cart', url: '/api/cart' },
    { name: 'GET /wishlist', url: '/api/wishlist' },
    { name: 'GET /admin/dashboard', url: '/api/admin/dashboard' }
  ];

  for (const test of tests) {
    const start = performance.now();
    const response = await fetch(test.url);
    const end = performance.now();
    console.log(`${test.name}: ${end - start}ms`);
  }
};
```

**Expected Times:**
- Simple GET: < 100ms
- Database queries: < 200ms
- Image loads: < 500ms
- Admin endpoints: < 300ms

### Deployment Steps

#### Step 1: Build for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: dist/ folder

# Backend build (if applicable)
cd ../backend
npm run build
# Output: build/ or dist/ folder
```

#### Step 2: Prepare Production Environment

**MongoDB Atlas:**
```bash
# Create production cluster (Shared M0 to M2 recommended)
# Create dedicated database user for prod
# Update connection string in .env
# Set IP whitelist to production server IP
```

**Cloudinary:**
```bash
# Create separate API credentials for production
# Update CLOUDINARY_UPLOAD_PRESET
# Configure CDN caching (24 hours recommended)
```

**Environment Files:**
```bash
# Production .env
MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/didi-prod
NODE_ENV=production
JWT_SECRET=<long-random-string>
CLOUDINARY_CLOUD_NAME=<prod-account>
CLOUDINARY_API_KEY=<prod-key>
CLOUDINARY_API_SECRET=<prod-secret>
CORS_ORIGIN=https://your-domain.com
```

#### Step 3: Deploy Frontend

**Option A: Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_API_BASE_URL=https://api.your-domain.com
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend/dist

# Set build command: npm run frontend:build
# Set publish directory: frontend/dist
```

**Option C: AWS S3 + CloudFront**
```bash
# Build frontend
npm run frontend:build

# Upload to S3
aws s3 sync frontend/dist s3://your-bucket-name

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

#### Step 4: Deploy Backend

**Option A: Render**
```bash
# Connect GitHub repo to Render
# Set build command: npm install
# Set start command: npm start
# Add environment variables
# Deploy
```

**Option B: Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=<url>
heroku config:set JWT_SECRET=<secret>

# Deploy
git push heroku main
```

**Option C: AWS EC2**
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# Clone repo
git clone <repo-url>
cd didi-monorepo/backend

# Install dependencies
npm install

# Start with PM2
npm install -g pm2
pm2 start server.js --name "didi-backend"
pm2 save
pm2 startup
```

#### Step 5: Post-Deployment Testing

```bash
# Test production API
curl https://your-api.com/api/products
curl https://your-api.com/api/health

# Test frontend
curl https://your-domain.com

# Check SSL certificate
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443

# Monitor logs
# Vercel: vercel logs
# Heroku: heroku logs --tail
# AWS EC2: pm2 logs
```

#### Step 6: Post-Deployment Checklist

```bash
✅ Frontend loads without errors
✅ API requests work
✅ Database connections stable
✅ Images load from Cloudinary
✅ Admin panel accessible
✅ Authentication works
✅ Cart/wishlist persist
✅ No console errors in browser
✅ SSL certificate valid
✅ Performance metrics acceptable
✅ Backups configured
```

### Monitoring & Maintenance

#### Daily Checks
```bash
# Check error logs
vercel logs
heroku logs --tail

# Verify API uptime
curl https://your-api.com/api/health

# Check Cloudinary usage
# Dashboard → Usage → Current month
```

#### Weekly Checks
```bash
# Database backups
# MongoDB Atlas → Backups → Verify latest backup

# Performance metrics
# Dashboard → Analytics → Check metrics

# Update dependencies
npm outdated
npm update
```

#### Monthly Checks
```bash
# Security audit
npm audit

# Cost analysis
# MongoDB Atlas → Billing
# Cloudinary → Account → Billing

# User feedback review
# Check support emails, reviews
```

### Rollback Plan

If issues occur after deployment:

```bash
# Frontend rollback (Vercel)
vercel rollback

# Backend rollback (Heroku)
heroku releases
heroku rollback v123

# Database rollback
# MongoDB Atlas → Backups → Restore snapshot

# Manual rollback
git revert <commit-hash>
git push production main
```

---

## Next Steps

1. **Implement Admin Panel** → Follow steps 1-5 above
2. **Test Admin Features** → Use testing checklist
3. **Run Deployment Checks** → Complete pre-deployment checklist
4. **Deploy to Production** → Follow deployment steps
5. **Monitor & Maintain** → Daily/weekly/monthly checks

---

## Support & Resources

- **Backend Issues:** Check `backend/README.md`
- **Frontend Issues:** Check `frontend/README.md`
- **Testing:** See `TESTING_GUIDE.md`
- **Fixes Applied:** See `WISHLIST_CART_FIXES.md`

---

**Last Updated:** January 2026  
**Status:** ✅ Core Features Complete | 🔲 Payments Pending  
**Maintainers:** Development Team
