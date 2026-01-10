# Admin API Testing Guide

## Postman Collection Import Instructions

1. **Open Postman**
2. **Click "Import"** (top left)
3. **Upload** `Postman-Admin-APIs-Collection.json`
4. **Select a workspace** where you want to import

## Setting Up Variables

Before testing, you need to set these collection variables:

### 1. **Get Admin JWT Token**
```bash
# Run this in backend terminal first to create test admin:
node -e "
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('admin123', salt);
console.log('Use this password hash for admin user:');
console.log(hashedPassword);
"
```

Then create admin in MongoDB with role: "admin"

### 2. **Login to Get Token**
In Postman, before testing admin endpoints, go to your existing login endpoint:
```
POST /api/auth/login
{
  "email": "admin@hezalthelabel.com",
  "password": "admin123"
}
```

Copy the JWT token from response and set it as `{{admin_token}}` variable.

### 3. **Get Product ID**
From existing products in your database, copy any product's `_id` or `productId` field and set as `{{productId}}` variable.

### 4. **Get Order ID**
From existing orders in your database, copy any order's `_id` field and set as `{{orderId}}` variable.

## Testing Sequence

### Phase 1: Settings API (No Auth Required)
1. **Get Settings** - Should return 200 or 404 (if no settings yet)
2. **Update Store Info** - Requires admin token, should return 200
3. **Update Social Media** - Requires admin token, should return 200
4. **Update Payment Methods** - Requires admin token, should return 200

### Phase 2: Product Attributes API (Requires Admin Token)
1. **Create Variant** - POST, should return 201 with variant data
2. **Update Product Images** - PUT, should return 200 with updated images
3. **Update Product Sizes** - PUT, should return 200 with sizes array
4. **Update Product Colors** - PUT, should return 200 with colors array
5. **Update Stock** - PUT, should return 200 with updated quantity
6. **Update SEO** - PUT, should return 200 with SEO metadata

### Phase 3: Order Management API (Requires Admin Token)
1. **Get All Orders** - GET with filters, should return 200 with orders array
2. **Update Order Status** - PUT, should return 200 with updated status
3. **Update Tracking Info** - PUT, should return 200 with tracking details
4. **Generate Invoice** - POST, should return 200 with invoice number
5. **Add Order Note** - POST, should return 200 with note added
6. **Cancel Order** - POST, should return 200 with cancellation details
7. **Process Refund** - POST, should return 200 with refund processed
8. **Get Order Stats** - GET, should return 200 with analytics data

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## Troubleshooting

**401 Unauthorized**: Admin token is invalid or expired. Get a new one.

**403 Forbidden**: User is not admin. Check role in database.

**404 Not Found**: Resource doesn't exist. Check IDs are correct.

**400 Bad Request**: Missing required fields. Check request body.

**500 Server Error**: Check backend console for detailed error message.

## Backend Server Check

Make sure backend is running:
```bash
cd backend
npm install
npm start
# Should print: "Server running on port 8000" or similar
```

## Database Check

Verify collections exist:
```bash
# In MongoDB Compass or mongo shell:
use didi_db
db.getCollectionNames()
# Should include: users, products, orders, settings, etc.
```

## Important Notes

- All admin endpoints require `Authorization: Bearer {JWT_TOKEN}` header
- Token expires after some time - get a new one if requests start failing with 401
- Settings are stored as single document with _id: "store-config"
- Order status values: pending, confirmed, processing, shipped, delivered, cancelled
- Product images use Cloudinary path format: `didi-fashion/products/{productId}/{imagetype}.jpg`

