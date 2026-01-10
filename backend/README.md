# 🚀 Didi Fashion Backend - Supabase API

Production-ready Express.js backend with Supabase PostgreSQL and Authentication.

## Quick Start

### 1. Setup Supabase Project
```bash
# Go to supabase.com and create a new project
# Get your URL and API keys from project settings
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env

# Fill in your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Setup Database
```bash
# Open Supabase SQL Editor and run database.sql
# This creates all tables, indexes, and RLS policies
```

### 5. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🔐 Authentication

### Supabase Auth Features
- ✅ Email/Password authentication
- ✅ JWT tokens (auto-refresh)
- ✅ Role-based access control
- ✅ User metadata (for roles)
- ✅ Built-in session management

### Endpoints
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout
GET    /api/auth/me              - Get current user
POST   /api/auth/reset-password  - Reset password
```

---

## 📦 Products API

**Base**: `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | - | List products (search, filter) |
| GET | /:id | - | Get single product |
| POST | / | Admin | Create product |
| PUT | /:id | Admin | Update product |
| DELETE | /:id | Admin | Delete product |

**Query Params**: `category`, `status`, `search`

---

## 📋 Orders API

**Base**: `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | User | List user's orders |
| GET | /:id | User | Get order details with items |
| POST | / | User | Create order |
| PUT | /:id | Admin | Update status |
| DELETE | /:id | Admin | Delete order |

**Statuses**: pending, processing, shipped, delivered, cancelled

---

## ⭐ Reviews API

**Base**: `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /product/:id | - | Get approved reviews |
| GET | / | Admin | Get all reviews |
| POST | / | User | Create review |
| PUT | /:id | Admin | Approve/reject |
| DELETE | /:id | Admin | Delete review |

**Ratings**: 1-5 stars

---

## 💬 Support API

**Base**: `/api/support`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | User | List user's tickets |
| GET | /:id | User | Get ticket with responses |
| POST | / | User | Create ticket |
| POST | /:id/response | User | Add response |
| PUT | /:id | Admin | Update status |
| DELETE | /:id | Admin | Delete ticket |

**Categories**: billing, shipping, product, general, return
**Statuses**: open, in-progress, resolved, closed
**Priority**: low, medium, high

---

## 👥 Customers API

**Base**: `/api/customers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Admin | List all customers |
| GET | /profile/:id | User | Get user profile |
| PUT | /profile/:id | User | Update profile |
| GET | /:id/orders | User | Get user's orders |

---

## 📊 Database Schema

### Tables
```
products
├── id, name, sku, price, stock
├── category, description, image
├── status (active/inactive)
└── created_at, updated_at

customers
├── id (from auth.users)
├── email, phone
├── address, city, country, postal_code
└── created_at, updated_at

orders
├── id, customer_id
├── total_price, shipping_address
├── status (pending, processing, shipped, delivered, cancelled)
└── created_at, updated_at

order_items
├── id, order_id, product_id
├── quantity, price
└── created_at

reviews
├── id, product_id, customer_id
├── rating (1-5), title, comment
├── status (pending, approved, rejected)
├── helpful_count
└── created_at, updated_at

support_tickets
├── id, customer_id
├── category, subject, message
├── priority, status
└── created_at, updated_at

support_responses
├── id, ticket_id
├── sender_type (customer/admin), sender_id
├── message
└── created_at
```

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled:

- **Products**: Public read, admin modify
- **Orders**: Users see own, admins see all
- **Reviews**: Approved visible to all
- **Support**: Users see own, admins see all

---

## 🛠️ Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   ├── support.js
│   │   └── customers.js
│   └── server.js
├── database.sql
├── .env.example
└── package.json
```

### Install & Run
```bash
npm install           # Install dependencies
npm run dev         # Start with auto-reload (port 3000)
npm start           # Production mode
```

---

## 🧪 Testing

### Using cURL
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"pass123",
    "fullName":"Test User"
  }'

# Get products
curl http://localhost:3000/api/products

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"pass123"
  }'
```

---

## 🌐 CORS Configuration

Frontend URL configured in `.env`:
```
CORS_ORIGIN=http://localhost:5173
```

---

## 📱 Frontend Integration

### Setup Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

### Get Auth Token
```typescript
const { data } = await supabase.auth.getSession();
const token = data.session?.access_token;
```

### API Request with Token
```typescript
const response = await fetch('http://localhost:3000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🚀 Deployment

Set environment variables on your hosting platform:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- CORS_ORIGIN (your frontend URL)
- NODE_ENV=production
- PORT=3000

---

## 📚 Documentation Files

- `database.sql` - Complete SQL schema (run in Supabase)
- `.env.example` - Environment variables template
- `README.md` - This file

---

**Happy coding! 🚀**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your environment variables

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

(To be documented as you build the API)

