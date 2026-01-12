# Customers Section - Quick Start Guide

## What Was Updated

The admin panel **Customers section** now features:
- ✅ **Real-time API integration** - Fetches live customer data
- ✅ **No mock data** - All data comes from the backend database
- ✅ **British Pounds (£)** - All monetary values display in GBP
- ✅ **Comprehensive details** - Full customer information display
- ✅ **Search & Filter** - Real-time search and status filtering
- ✅ **Loading states** - Visual feedback while loading
- ✅ **Error handling** - User-friendly error messages

---

## Getting Started

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```
The server will start on port 5000 (or next available port)

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on port 5173

### Step 3: Login as Admin
1. Go to http://localhost:5173/admin
2. Enter admin credentials
3. Ensure you receive a valid admin token

### Step 4: Navigate to Customers
1. Click on "Customers" tab in the admin sidebar
2. Or go to http://localhost:5173/admin?tab=customers

### Step 5: (Optional) Seed Test Data
Call this endpoint to populate sample customers:
```bash
POST http://localhost:5000/api/customers/seed
```

---

## Features Overview

### 1. Customer List
**Table Columns:**
- Name
- Email
- Phone
- City
- Total Orders
- Total Spent (£)
- Loyalty Tier (Bronze/Silver/Gold/Platinum)
- Status (Active/Inactive)
- Last Purchase
- Actions (View Details)

### 2. Quick Stats
- **Total Customers** - Overall customer count
- **Active Customers** - Currently active accounts
- **Total Revenue** - Sum of all spending (£)
- **Average Order Value** - Mean order value (£)

### 3. Search & Filter
**Search by:**
- Customer name
- Email address

**Filter by:**
- All Customers
- Active Customers
- Inactive Customers

**Real-time updates:**
- Search results update automatically (debounced)
- Filter instantly switches between tabs

### 4. Customer Details Modal
Click the **View Details** button (👁️) to see comprehensive information:

**Personal Information**
- Full Name
- Email
- Phone
- Loyalty Status

**Address Information**
- Street Address
- City
- Country

**Account Information**
- Account Created Date
- Last Login Date
- Account Status (Active/Inactive)
- Preferred Product Category

**Purchase History**
- Total Orders
- Total Spent (£)
- Join Date
- Last Purchase Date

**Actions**
- Send Message
- View Orders

---

## API Endpoints

### Authentication
Required for all customer endpoints. Add this header:
```
Authorization: Bearer {adminToken}
```

### Get All Customers
```
GET /api/customers
Query Parameters:
  - search: string (optional) - search by name or email
  - status: string (optional) - filter by active/inactive
  - limit: number (optional) - results per page
  - offset: number (optional) - pagination offset

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 4,
    "limit": 100,
    "offset": 0,
    "pages": 1
  }
}
```

### Get Customer Stats
```
GET /api/customers/stats

Response:
{
  "success": true,
  "data": {
    "totalCustomers": 4,
    "activeCustomers": 3,
    "totalRevenue": 2439.69,
    "averageOrderValue": 123.45
  }
}
```

### Get Single Customer
```
GET /api/customers/:customerId

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    ...
  }
}
```

### Update Customer
```
PUT /api/customers/:customerId
Content-Type: application/json

Body:
{
  "name": "New Name",
  "phone": "+44-...",
  "address": "...",
  "city": "...",
  "country": "...",
  "status": "active",
  "preferredCategory": "Dresses",
  "loyalty": "gold"
}

Response:
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {...}
}
```

### Seed Sample Data
```
POST /api/customers/seed

Response:
{
  "success": true,
  "message": "4 sample customers created",
  "count": 4
}
```

---

## Troubleshooting

### No Customers Showing?
1. ✅ Check backend is running: `http://localhost:5000/api/products` should work
2. ✅ Verify admin token in localStorage: Open DevTools → Application → localStorage
3. ✅ Seed sample data: `POST http://localhost:5000/api/customers/seed`
4. ✅ Check console for errors: Open DevTools → Console tab

### "Admin authentication required" error?
- Make sure you're logged in as admin
- Admin token should be saved in localStorage
- Re-login if token expired

### "Unauthorized" error?
- Ensure you have admin role
- Check that the Authorization header is properly formatted
- Token might be invalid or expired

### API Connection Failed?
- Verify backend is running on http://localhost:5000
- Check CORS configuration in backend/src/app.js
- Ensure frontend URL is in CORS whitelist

---

## Development Notes

### Files Modified
```
Frontend:
  frontend/src/admin/pages/Customers.tsx

Backend:
  backend/src/models/Customer.js (NEW)
  backend/src/controllers/customer.controller.js (NEW)
  backend/src/routes/customer.routes.js (NEW)
  backend/src/app.js
  backend/src/server.js
```

### Database Collection
All customer data is stored in MongoDB collection: `customers`

### Example Customer Document
```javascript
{
  "_id": ObjectId("..."),
  "email": "sarah@example.com",
  "name": "Sarah Johnson",
  "fullName": "Sarah Johnson",
  "phone": "+44-7911-123456",
  "address": "42 Oxford Street",
  "city": "London",
  "country": "United Kingdom",
  "totalOrders": 5,
  "totalSpent": 349.95,
  "status": "active",
  "loyalty": "gold",
  "preferredCategory": "Dresses",
  "createdAt": ISODate("2023-06-15T00:00:00Z"),
  "lastPurchaseDate": ISODate("2024-01-05T00:00:00Z"),
  "lastLogin": ISODate("2024-01-11T00:00:00Z")
}
```

---

## Next Steps

1. **Test the feature** - Navigate to Customers section and verify data loads
2. **Create more customers** - Add real customer data to your database
3. **Customize fields** - Modify customer details as needed
4. **Add notifications** - Integrate email/SMS for customer messages
5. **Export data** - Add CSV/PDF export functionality
6. **Advanced analytics** - Add customer charts and insights

---

## Summary

✅ **Backend API** - Ready to serve customer data
✅ **Frontend Integration** - Real-time customer display
✅ **Currency** - Using British Pounds (£)
✅ **Search & Filter** - Working with debounce
✅ **Error Handling** - Comprehensive error messages
✅ **Authentication** - Admin-only access
✅ **Test Data** - Sample data seeding available

**Status**: Ready for use! 🚀
