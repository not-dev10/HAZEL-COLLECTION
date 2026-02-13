# 🧪 API Testing Guide - Backend Endpoints

**Base URL:** `https://hazel-collection-y168.onrender.com`

---

## 🔐 Authentication

### **Admin Login**
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "hazellabel@gmail.com",
  "password": "hazellabel@2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-id",
    "email": "hazellabel@gmail.com",
    "role": "admin"
  }
}
```

---

### **User Login (Example)**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📦 Public Endpoints (No Auth Required)

### **1. Get All Products**
```
GET /api/products
```

### **2. Get Single Product**
```
GET /api/products/{productId}
```

### **3. Get Health Status**
```
GET /api/health/ping
```

### **4. Search Products**
```
GET /api/products?search=bridal&category=wedding
```

---

## 👤 User Endpoints (Auth Required)

**Header:** `Authorization: Bearer {token}`

### **1. Get User Profile**
```
GET /api/customers/profile
Authorization: Bearer {USER_TOKEN}
```

### **2. Add to Wishlist**
```
POST /api/wishlist
Authorization: Bearer {USER_TOKEN}
Content-Type: application/json

{
  "productId": "product-id"
}
```

### **3. Get Wishlist**
```
GET /api/wishlist
Authorization: Bearer {USER_TOKEN}
```

### **4. Add to Cart**
```
POST /api/cart
Authorization: Bearer {USER_TOKEN}
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

### **5. Get Cart**
```
GET /api/cart
Authorization: Bearer {USER_TOKEN}
```

### **6. Create Order**
```
POST /api/orders
Authorization: Bearer {USER_TOKEN}
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-id",
      "quantity": 1,
      "price": 5999
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "zipCode": "400001",
    "country": "India"
  },
  "totalAmount": 5999
}
```

### **7. Get Orders**
```
GET /api/orders
Authorization: Bearer {USER_TOKEN}
```

### **8. Leave Review**
```
POST /api/reviews
Authorization: Bearer {USER_TOKEN}
Content-Type: application/json

{
  "productId": "product-id",
  "rating": 5,
  "comment": "Amazing quality!"
}
```

---

## 👨‍💼 Admin Endpoints (Admin Auth Required)

**Header:** `Authorization: Bearer {ADMIN_TOKEN}`

### **1. Get All Products (Admin View)**
```
GET /api/admin/products
Authorization: Bearer {ADMIN_TOKEN}
```

### **2. Create Product**
```
POST /api/admin/products
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "New Bridal Lehenga",
  "description": "Beautiful handcrafted lehenga",
  "category": "bridal",
  "price": 15999,
  "originalPrice": 19999,
  "quantity": 10,
  "images": ["image-url-1", "image-url-2"]
}
```

### **3. Update Product**
```
PUT /api/admin/products/{productId}
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 12999,
  "quantity": 20
}
```

### **4. Delete Product**
```
DELETE /api/admin/products/{productId}
Authorization: Bearer {ADMIN_TOKEN}
```

### **5. Get All Orders (Admin)**
```
GET /api/admin/orders
Authorization: Bearer {ADMIN_TOKEN}
```

### **6. Update Order Status**
```
PUT /api/admin/orders/{orderId}
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

{
  "status": "shipped"
}
```

### **7. Get Analytics**
```
GET /api/admin/analytics
Authorization: Bearer {ADMIN_TOKEN}
```

### **8. Get Customers**
```
GET /api/admin/customers
Authorization: Bearer {ADMIN_TOKEN}
```

### **9. Get System Health (Admin)**
```
GET /api/health
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 🧪 Testing with cURL

### **Admin Login:**
```bash
curl -X POST https://hazel-collection-y168.onrender.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hazellabel@gmail.com","password":"hazellabel@2026"}'
```

### **Get Products (Authenticated):**
```bash
curl -X GET https://hazel-collection-y168.onrender.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Get Admin Analytics:**
```bash
curl -X GET https://hazel-collection-y168.onrender.com/api/admin/analytics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 🧪 Testing with Postman

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Paste this file or use the endpoints listed above

2. **Set Variables:**
   - Create variable: `BASE_URL` = `https://hazel-collection-y168.onrender.com`
   - Create variable: `AUTH_TOKEN` = (paste token from login response)
   - Create variable: `ADMIN_TOKEN` = (paste admin token from login)

3. **Test Endpoints:**
   - Use `{{BASE_URL}}` in URL fields
   - Use `Bearer {{AUTH_TOKEN}}` in Authorization headers

---

## 🔄 Response Examples

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error message here",
  "error": "ERROR_CODE"
}
```

### **Unauthorized (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token",
  "error": "UNAUTHORIZED"
}
```

### **Forbidden (403):**
```json
{
  "success": false,
  "message": "Admin access required",
  "error": "FORBIDDEN"
}
```

---

## 📝 Test Scenarios

### **Scenario 1: Complete User Flow**
1. Login as user → Get token
2. Browse products (GET /api/products)
3. Add product to wishlist
4. Add product to cart
5. Create order
6. Leave review

### **Scenario 2: Admin Management**
1. Login as admin → Get token
2. Get all products
3. Create new product
4. Update product
5. Get orders
6. Update order status
7. View analytics

---

## ✅ Quick Test Commands

```bash
# Test backend is alive
curl https://hazel-collection-y168.onrender.com/api/health/ping

# Get products (no auth needed)
curl https://hazel-collection-y168.onrender.com/api/products

# Admin login
curl -X POST https://hazel-collection-y168.onrender.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hazellabel@gmail.com","password":"hazellabel@2026"}'
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired or invalid - login again |
| 403 Forbidden | Admin endpoint requires admin token |
| 404 Not Found | Endpoint doesn't exist or typo in URL |
| CORS Error | Backend CORS settings need update |
| 500 Server Error | Check backend logs on Render |

---

## 📞 Support

If endpoints fail:
1. Check Render logs: `https://dashboard.render.com`
2. Verify MongoDB connection
3. Check environment variables are set
4. Ensure frontend VITE_API_URL is correct

