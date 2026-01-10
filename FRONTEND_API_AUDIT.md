# Frontend API Audit - Complete List

## Overview
This document contains all expected API routes and calls across the entire frontend codebase. This is the complete contract between frontend and backend.

---

## 1. AUTHENTICATION ENDPOINTS

### POST /api/auth/signup
**Location:** `frontend/src/pages/Signup.tsx`
**Status:** Currently disabled (using localStorage)
**Purpose:** User registration

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "postalCode": "string",
    "createdAt": "string (ISO 8601)"
  },
  "token": "string (JWT)"
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 409 (email already exists)

---

### POST /api/auth/login
**Location:** `frontend/src/pages/Login.tsx`
**Status:** Currently disabled (using localStorage)
**Purpose:** User authentication

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "postalCode": "string",
    "createdAt": "string (ISO 8601)"
  },
  "token": "string (JWT)"
}
```

**HTTP Status:** 200 (success) | 401 (invalid credentials) | 404 (user not found)

---

## 2. PRODUCT ENDPOINTS

### GET /api/products
**Location:** `frontend/src/pages/Collection.tsx`, `frontend/src/pages/SearchProducts.tsx`
**Status:** Not implemented (using mock data)
**Purpose:** Get all products or filtered products

**Query Parameters:**
- `category?` - string (new-arrivals, ready-to-wear, unstitched, bridals, jewellery)
- `search?` - string (for search functionality)
- `sortBy?` - string (price-low, price-high, newest, rating, relevance)
- `priceMin?` - number
- `priceMax?` - number
- `limit?` - number (default: 12)
- `offset?` - number (default: 0)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number | string",
      "name": "string",
      "price": "number",
      "originalPrice": "number (optional)",
      "description": "string",
      "image": "string (URL)",
      "category": "string",
      "inStock": "boolean",
      "rating": "number (0-5)",
      "reviews": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 400 (bad query) | 404 (not found)

---

### GET /api/products/:id
**Location:** `frontend/src/pages/Product.tsx`
**Status:** Not implemented (using hardcoded productDatabase)
**Purpose:** Get detailed product information

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "number | string",
    "name": "string",
    "price": "number",
    "originalPrice": "number (optional)",
    "description": "string (long form)",
    "details": ["string", "string", ...],
    "images": ["string (URL)", "string (URL)", ...],
    "category": "string",
    "inStock": "boolean",
    "sku": "string (optional)",
    "stock": "number",
    "rating": "number (0-5)",
    "reviews": "number"
  }
}
```

**HTTP Status:** 200 (success) | 404 (product not found)

---

## 3. CART ENDPOINTS

**Location:** `frontend/src/pages/Cart.tsx`
**Status:** All local (using CartContext)
**Note:** Cart is managed entirely client-side via context. No backend calls expected for cart operations.

**Expected Cart Structure (from context):**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "image": "string (URL)"
    }
  ],
  "total": "number"
}
```

---

## 4. CHECKOUT ENDPOINTS

### POST /api/orders
**Location:** `frontend/src/pages/Checkout.tsx` (line 204 - commented "Simulate API call")
**Status:** Not implemented (form is fully functional locally)
**Purpose:** Create a new order

**Request Body:**
```json
{
  "items": [
    {
      "id": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string"
  },
  "billingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string"
  },
  "deliveryAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string",
    "sameAsBilling": "boolean"
  },
  "paymentMethod": "string (credit-card | debit-card | paypal | bank-transfer)",
  "total": "number"
}
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "string",
    "orderNumber": "string (e.g., ORD-2024-001)",
    "customerId": "string",
    "items": [
      {
        "id": "string",
        "name": "string",
        "quantity": "number",
        "price": "number"
      }
    ],
    "total": "number",
    "status": "pending",
    "estimatedDelivery": "string (ISO 8601)",
    "createdAt": "string (ISO 8601)"
  },
  "message": "Order placed successfully. Confirmation email sent."
}
```

**HTTP Status:** 201 (created) | 400 (validation error) | 402 (payment failed) | 500 (server error)

---

## 5. REVIEWS ENDPOINTS

### GET /api/reviews?productId=:id
**Location:** `frontend/src/components/catalog/ProductReviews.tsx`
**Status:** Not implemented
**Purpose:** Get reviews for a product

**Query Parameters:**
- `productId` - string (required)
- `limit?` - number (default: 10)
- `offset?` - number (default: 0)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "productId": "string",
      "customerId": "string",
      "customerName": "string",
      "rating": "number (1-5)",
      "title": "string",
      "comment": "string",
      "helpful": "number",
      "date": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 404 (product not found)

---

### POST /api/reviews
**Location:** Frontend (not yet implemented)
**Status:** Not implemented
**Purpose:** Submit a product review

**Request Body:**
```json
{
  "productId": "string",
  "customerId": "string",
  "rating": "number (1-5)",
  "title": "string",
  "comment": "string"
}
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "string",
    "productId": "string",
    "customerId": "string",
    "rating": "number",
    "title": "string",
    "comment": "string",
    "status": "pending",
    "date": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 201 (created) | 400 (validation error) | 401 (unauthorized)

---

## 6. ADMIN PANEL ENDPOINTS

### Dashboard

#### GET /api/admin/dashboard
**Location:** `frontend/src/admin/pages/Dashboard.tsx`
**Status:** Not implemented
**Purpose:** Get dashboard statistics

**Authentication:** Required (admin token)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": "number",
      "totalOrders": "number",
      "totalProducts": "number",
      "totalCustomers": "number"
    },
    "revenueData": [
      {
        "month": "string",
        "revenue": "number",
        "orders": "number"
      }
    ],
    "categoryData": [
      {
        "name": "string",
        "value": "number"
      }
    ]
  }
}
```

---

### Products Management

#### GET /api/admin/products
**Location:** `frontend/src/admin/pages/Products.tsx`
**Status:** Not implemented (using local state)
**Purpose:** Get all products for admin

**Authentication:** Required (admin token)

**Query Parameters:**
- `search?` - string (search by name or SKU)
- `status?` - string (active | inactive)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "price": "number",
      "stock": "number",
      "category": "string",
      "status": "active | inactive",
      "lastUpdated": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 403 (forbidden)

---

#### POST /api/admin/products
**Location:** `frontend/src/admin/pages/Products.tsx` (addProduct handler)
**Status:** Not implemented
**Purpose:** Create a new product

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "name": "string",
  "sku": "string",
  "price": "number",
  "stock": "number",
  "category": "string",
  "description": "string",
  "images": ["string (URL)", ...],
  "status": "active | inactive"
}
```

**Expected Response:**
```json
{
  "success": true,
  "product": {
    "id": "string",
    "name": "string",
    "sku": "string",
    "price": "number",
    "stock": "number",
    "category": "string",
    "status": "active",
    "createdAt": "string (ISO 8601)",
    "lastUpdated": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 201 (created) | 400 (validation error) | 401 (unauthorized) | 409 (duplicate SKU)

---

#### PUT /api/admin/products/:id
**Location:** `frontend/src/admin/pages/Products.tsx` (editProduct handler)
**Status:** Not implemented
**Purpose:** Update product details

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "name": "string (optional)",
  "sku": "string (optional)",
  "price": "number (optional)",
  "stock": "number (optional)",
  "category": "string (optional)",
  "description": "string (optional)",
  "images": ["string (URL)", ...] (optional),
  "status": "active | inactive (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "product": {
    "id": "string",
    "name": "string",
    "sku": "string",
    "price": "number",
    "stock": "number",
    "category": "string",
    "status": "string",
    "lastUpdated": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized) | 404 (not found)

---

#### DELETE /api/admin/products/:id
**Location:** `frontend/src/admin/pages/Products.tsx` (deleteProduct handler)
**Status:** Not implemented
**Purpose:** Delete a product

**Authentication:** Required (admin token)

**Expected Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 404 (not found)

---

### Orders Management

#### GET /api/admin/orders
**Location:** `frontend/src/admin/pages/Orders.tsx`
**Status:** Not implemented (using local state)
**Purpose:** Get all orders for admin

**Authentication:** Required (admin token)

**Query Parameters:**
- `status?` - string (pending | processing | shipped | delivered | cancelled)
- `search?` - string (search by order number, customer name, email)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "orderNumber": "string",
      "customer": "string",
      "email": "string",
      "total": "number",
      "items": "number",
      "status": "pending | processing | shipped | delivered | cancelled",
      "date": "string (ISO 8601)",
      "estimatedDelivery": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 403 (forbidden)

---

#### PUT /api/admin/orders/:id
**Location:** `frontend/src/admin/pages/Orders.tsx` (updateOrderStatus handler)
**Status:** Not implemented
**Purpose:** Update order status

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "status": "pending | processing | shipped | delivered | cancelled"
}
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "string",
    "orderNumber": "string",
    "status": "string",
    "lastUpdated": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized) | 404 (not found)

---

#### DELETE /api/admin/orders/:id
**Location:** `frontend/src/admin/pages/Orders.tsx` (deleteOrder handler)
**Status:** Not implemented
**Purpose:** Delete an order

**Authentication:** Required (admin token)

**Expected Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 404 (not found)

---

### Customers Management

#### GET /api/admin/customers
**Location:** `frontend/src/admin/pages/Customers.tsx`
**Status:** Not implemented (using local state)
**Purpose:** Get all customers for admin

**Authentication:** Required (admin token)

**Query Parameters:**
- `status?` - string (active | inactive)
- `search?` - string (search by name or email)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "totalOrders": "number",
      "totalSpent": "number",
      "status": "active | inactive",
      "joinDate": "string (ISO 8601)",
      "lastPurchase": "string (ISO 8601)"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 403 (forbidden)

---

### Inventory Management

#### GET /api/admin/inventory
**Location:** `frontend/src/admin/pages/Inventory.tsx`
**Status:** Not implemented (using local state)
**Purpose:** Get inventory items

**Authentication:** Required (admin token)

**Query Parameters:**
- `status?` - string (in-stock | low-stock | out-of-stock)
- `search?` - string (search by product name or SKU)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "productName": "string",
      "sku": "string",
      "currentStock": "number",
      "reorderLevel": "number",
      "maxStock": "number",
      "warehouseLocation": "string",
      "lastRestocked": "string (ISO 8601)",
      "status": "in-stock | low-stock | out-of-stock"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 403 (forbidden)

---

#### PUT /api/admin/inventory/:id
**Location:** `frontend/src/admin/pages/Inventory.tsx` (updateStock handler)
**Status:** Not implemented
**Purpose:** Update stock level

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "currentStock": "number",
  "reorderLevel": "number (optional)",
  "maxStock": "number (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "inventory": {
    "id": "string",
    "currentStock": "number",
    "status": "in-stock | low-stock | out-of-stock",
    "lastRestocked": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized) | 404 (not found)

---

### Analytics & Reports

#### GET /api/admin/analytics
**Location:** `frontend/src/admin/pages/Analytics.tsx`
**Status:** Not implemented
**Purpose:** Get analytics data

**Authentication:** Required (admin token)

**Query Parameters:**
- `dateRange?` - string (30days | 90days | 1year)
- `groupBy?` - string (daily | weekly | monthly)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "salesData": [
      {
        "date": "string",
        "sales": "number",
        "revenue": "number"
      }
    ],
    "conversionData": [
      {
        "week": "string",
        "visitors": "number",
        "conversion": "number"
      }
    ],
    "topProducts": [
      {
        "name": "string",
        "sales": "number",
        "revenue": "number"
      }
    ]
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 403 (forbidden)

---

### Settings

#### GET /api/admin/settings
**Location:** `frontend/src/admin/pages/Settings.tsx`
**Status:** Not implemented
**Purpose:** Get admin settings

**Authentication:** Required (admin token)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "storeName": "string",
    "storeEmail": "string",
    "supportEmail": "string",
    "phone": "string",
    "currency": "string",
    "emailNotifications": "boolean",
    "orderAlerts": "boolean",
    "lowStockAlerts": "boolean",
    "reviewNotifications": "boolean",
    "marketingEmails": "boolean",
    "twoFactorAuth": "boolean"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized)

---

#### PUT /api/admin/settings
**Location:** `frontend/src/admin/pages/Settings.tsx`
**Status:** Not implemented
**Purpose:** Update admin settings

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "storeName": "string (optional)",
  "storeEmail": "string (optional)",
  "supportEmail": "string (optional)",
  "phone": "string (optional)",
  "emailNotifications": "boolean (optional)",
  "orderAlerts": "boolean (optional)",
  "lowStockAlerts": "boolean (optional)",
  "reviewNotifications": "boolean (optional)",
  "marketingEmails": "boolean (optional)",
  "twoFactorAuth": "boolean (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "storeName": "string",
    "storeEmail": "string",
    ...
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized)

---

### Support & Reviews Management

#### GET /api/admin/reviews
**Location:** `frontend/src/admin/pages/SupportReviews.tsx`
**Status:** Not implemented
**Purpose:** Get all reviews for moderation

**Authentication:** Required (admin token)

**Query Parameters:**
- `status?` - string (pending | approved | rejected)
- `search?` - string (search by product name or customer)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "productId": "string",
      "productName": "string",
      "customerId": "string",
      "customerName": "string",
      "rating": "number",
      "title": "string",
      "comment": "string",
      "status": "pending | approved | rejected",
      "date": "string (ISO 8601)",
      "helpful": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized)

---

#### PUT /api/admin/reviews/:id
**Location:** `frontend/src/admin/pages/SupportReviews.tsx` (approveReview handler)
**Status:** Not implemented
**Purpose:** Approve or reject a review

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "status": "approved | rejected"
}
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "string",
    "status": "string",
    "updatedAt": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 404 (not found)

---

#### GET /api/admin/support
**Location:** `frontend/src/admin/pages/SupportReviews.tsx`
**Status:** Not implemented
**Purpose:** Get support tickets

**Authentication:** Required (admin token)

**Query Parameters:**
- `status?` - string (open | in-progress | resolved | closed)
- `priority?` - string (low | medium | high)
- `search?` - string (search by ticket ID or customer)
- `limit?` - number
- `offset?` - number

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "ticketId": "string",
      "customerId": "string",
      "customerName": "string",
      "category": "billing | shipping | product | general | return",
      "subject": "string",
      "message": "string",
      "status": "open | in-progress | resolved | closed",
      "priority": "low | medium | high",
      "dateCreated": "string (ISO 8601)",
      "lastUpdated": "string (ISO 8601)",
      "responses": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized)

---

#### POST /api/admin/support/:id/response
**Location:** `frontend/src/admin/pages/SupportReviews.tsx` (replyToSupport handler)
**Status:** Not implemented
**Purpose:** Reply to a support ticket

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "message": "string"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": {
    "id": "string",
    "ticketId": "string",
    "message": "string",
    "createdBy": "admin",
    "createdAt": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 201 (created) | 400 (validation error) | 401 (unauthorized) | 404 (not found)

---

#### PUT /api/admin/support/:id
**Location:** `frontend/src/admin/pages/SupportReviews.tsx` (updateTicketStatus handler)
**Status:** Not implemented
**Purpose:** Update support ticket status

**Authentication:** Required (admin token)

**Request Body:**
```json
{
  "status": "open | in-progress | resolved | closed",
  "priority": "low | medium | high (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "string",
    "ticketId": "string",
    "status": "string",
    "priority": "string",
    "lastUpdated": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized) | 404 (not found)

---

## 7. WISHLIST ENDPOINTS

**Location:** `frontend/src/context/WishlistContext.tsx`
**Status:** All local (using WishlistContext)
**Note:** Wishlist is managed entirely client-side via context. No backend calls expected for wishlist operations.

**Expected Wishlist Structure (from context):**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "image": "string (URL)"
    }
  ]
}
```

---

## 8. USER PROFILE ENDPOINTS

### GET /api/user/profile
**Location:** `frontend/src/context/UserContext.tsx` (line 30 comment)
**Status:** Not implemented (comment suggests future implementation)
**Purpose:** Fetch user profile with auth token

**Authentication:** Required (JWT token in Authorization header)

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "postalCode": "string",
    "createdAt": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 401 (unauthorized) | 404 (user not found)

---

### PUT /api/user/profile
**Location:** `frontend/src/pages/Account.tsx` (expected)
**Status:** Not implemented
**Purpose:** Update user profile

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "country": "string (optional)",
  "postalCode": "string (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "postalCode": "string",
    "updatedAt": "string (ISO 8601)"
  }
}
```

**HTTP Status:** 200 (success) | 400 (validation error) | 401 (unauthorized)

---

## SUMMARY TABLE

| Endpoint | Method | Location | Status | Priority |
|----------|--------|----------|--------|----------|
| `/api/auth/signup` | POST | Signup.tsx | ⚠️ Disabled | High |
| `/api/auth/login` | POST | Login.tsx | ⚠️ Disabled | High |
| `/api/products` | GET | Collection.tsx, SearchProducts.tsx | ❌ Mock | High |
| `/api/products/:id` | GET | Product.tsx | ❌ Mock | High |
| `/api/orders` | POST | Checkout.tsx | ❌ Not implemented | High |
| `/api/reviews` | GET | ProductReviews.tsx | ❌ Not implemented | Medium |
| `/api/reviews` | POST | ProductReviews.tsx | ❌ Not implemented | Medium |
| `/api/user/profile` | GET | UserContext.tsx | ❌ Not implemented | Medium |
| `/api/user/profile` | PUT | Account.tsx | ❌ Not implemented | Medium |
| `/api/admin/dashboard` | GET | Dashboard.tsx | ❌ Not implemented | High |
| `/api/admin/products` | GET | Products.tsx | ❌ Not implemented | High |
| `/api/admin/products` | POST | Products.tsx | ❌ Not implemented | High |
| `/api/admin/products/:id` | PUT | Products.tsx | ❌ Not implemented | High |
| `/api/admin/products/:id` | DELETE | Products.tsx | ❌ Not implemented | High |
| `/api/admin/orders` | GET | Orders.tsx | ❌ Not implemented | High |
| `/api/admin/orders/:id` | PUT | Orders.tsx | ❌ Not implemented | High |
| `/api/admin/orders/:id` | DELETE | Orders.tsx | ❌ Not implemented | High |
| `/api/admin/customers` | GET | Customers.tsx | ❌ Not implemented | High |
| `/api/admin/inventory` | GET | Inventory.tsx | ❌ Not implemented | High |
| `/api/admin/inventory/:id` | PUT | Inventory.tsx | ❌ Not implemented | High |
| `/api/admin/analytics` | GET | Analytics.tsx | ❌ Not implemented | High |
| `/api/admin/settings` | GET | Settings.tsx | ❌ Not implemented | Medium |
| `/api/admin/settings` | PUT | Settings.tsx | ❌ Not implemented | Medium |
| `/api/admin/reviews` | GET | SupportReviews.tsx | ❌ Not implemented | Medium |
| `/api/admin/reviews/:id` | PUT | SupportReviews.tsx | ❌ Not implemented | Medium |
| `/api/admin/support` | GET | SupportReviews.tsx | ❌ Not implemented | Medium |
| `/api/admin/support/:id/response` | POST | SupportReviews.tsx | ❌ Not implemented | Medium |
| `/api/admin/support/:id` | PUT | SupportReviews.tsx | ❌ Not implemented | Medium |

**Legend:**
- ✅ Implemented & Working
- ⚠️ Disabled (exists but not used)
- ❌ Not Implemented (using mock/local data)

---

## NOTES FOR BACKEND IMPLEMENTATION

1. **Authentication**: All admin endpoints require JWT token validation
2. **Token Storage**: Frontend stores JWT in sessionStorage (can be changed to httpOnly cookie)
3. **Base URL**: Frontend expects backend at `http://localhost:3000` (configured in environment)
4. **CORS**: Backend must allow requests from `http://localhost:5173` (Vite dev server)
5. **Pagination**: Use limit/offset pattern for all list endpoints
6. **Search**: Support case-insensitive search on key fields
7. **Error Handling**: Return consistent error response format with `success: false` and `error: { message: string }`
8. **Timestamps**: Use ISO 8601 format for all date fields
9. **Validation**: Validate all request data on backend side
10. **Database**: Use Supabase PostgreSQL with existing schema in `database.sql`

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Core E-Commerce)
1. `/api/auth/signup` & `/api/auth/login`
2. `/api/products` & `/api/products/:id`
3. `/api/orders` (POST only)
4. `/api/user/profile` (GET)

### Phase 2 (Admin Essentials)
1. `/api/admin/dashboard`
2. `/api/admin/products` (full CRUD)
3. `/api/admin/orders` (GET & PUT)
4. `/api/admin/customers` (GET)
5. `/api/admin/inventory` (GET & PUT)

### Phase 3 (Enhancements)
1. `/api/reviews` (GET & POST)
2. `/api/admin/analytics`
3. `/api/admin/settings`
4. `/api/admin/support` & `/api/admin/reviews`
5. `/api/user/profile` (PUT)

