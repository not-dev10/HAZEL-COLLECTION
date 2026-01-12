# Customer Management System - Complete Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │  Account.tsx     │         │ Admin Customers  │                  │
│  │  (Profile Edit)  │         │      Panel       │                  │
│  └────────┬─────────┘         └────────┬─────────┘                  │
│           │                            │                             │
│           │ PUT /api/user/profile      │ GET /api/customers         │
│           │                            │ GET /api/customers/:id     │
│           │                            │ PUT /api/customers/:id     │
│           └────────────┬───────────────┘                             │
│                        │                                              │
│                   Authorization: Bearer <token>                       │
│                        │                                              │
└────────────────────────┼──────────────────────────────────────────────┘
                         │
                 ┌────────┴────────┐
                 │                 │
         ┌───────▼────────┐  ┌────▼─────────┐
         │    Express     │  │  JWT Auth    │
         │   Middleware   │  │  Validation  │
         └────────┬───────┘  └──────┬───────┘
                  │                 │
         ┌────────▼─────────────────▼────────┐
         │    Backend (Node.js/Express)      │
         └────────────────────────────────────┘
                  │
         ┌────────┴──────────────────────┐
         │                               │
    ┌────▼──────────┐         ┌─────────▼────┐
    │ User Model    │         │   Customer   │
    │ Methods       │         │  Controller  │
    ├───────────────┤         ├──────────────┤
    │ create()      │         │ getAllCustomers()
    │ findById()    │         │ getCustomerById()
    │ findByEmail() │         │ updateCustomer()
    │ updateProfile()          │ getCustomerStats()
    │ getAllCustomers()        │
    │ getCustomerStats()       │
    │ formatResponse()         │
    └────┬──────────┘         └──────┬───────┘
         │                            │
         └────────┬───────────────────┘
                  │
         ┌────────▼──────────────────┐
         │    MongoDB Database       │
         │  (users collection)       │
         ├───────────────────────────┤
         │ Registered Users:         │
         │  - isGuest: false         │
         │  - role: 'user'           │
         │  - Customer fields        │
         │                           │
         │ Guest Users:              │
         │  - isGuest: true          │
         │  - sessionId: '...'       │
         │  - 6hr expiry             │
         └───────────────────────────┘
```

---

## Data Model Relationships

```
┌─────────────────────────────────────┐
│         Users Collection             │
├─────────────────────────────────────┤
│                                      │
│  ┌──── Registered Users ────┐       │
│  │  (isGuest: false)         │       │
│  │  (role: 'user')           │       │
│  │                           │       │
│  │  ├─ Authentication        │       │
│  │  │   ├─ email             │       │
│  │  │   ├─ password (bcrypt) │       │
│  │  │   └─ role: 'user'      │       │
│  │  │                         │       │
│  │  ├─ Profile               │       │
│  │  │   ├─ fullName          │       │
│  │  │   ├─ phone             │       │
│  │  │   ├─ gender            │       │ ◄── CUSTOMER
│  │  │   ├─ address           │       │
│  │  │   ├─ city              │       │
│  │  │   └─ country           │       │
│  │  │                         │       │
│  │  ├─ Purchase History      │       │
│  │  │   ├─ totalOrders       │       │
│  │  │   ├─ totalSpent        │       │
│  │  │   └─ lastPurchaseDate  │       │
│  │  │                         │       │
│  │  └─ Status                │       │
│  │      ├─ loyalty: 'bronze' │       │
│  │      ├─ status: 'active'  │       │
│  │      └─ preferredCategory │       │
│  └──────────────────────────┘       │
│                                      │
│  ┌──── Guest Users ──────┐          │
│  │  (isGuest: true)       │          │
│  │                        │          │
│  │  ├─ sessionId         │          │
│  │  ├─ createdAt         │          │
│  │  ├─ expiresAt (+6hrs) │          │
│  │  └─ cartItems         │          │
│  └────────────────────────┘          │
│                                      │
└─────────────────────────────────────┘
```

---

## API Endpoint Hierarchy

```
┌─────────────────────────────────────────┐
│          API Endpoints                   │
├─────────────────────────────────────────┤
│                                          │
│  Authentication                          │
│  ├─ POST   /api/auth/signup             │
│  ├─ POST   /api/auth/login              │
│  └─ POST   /api/auth/admin-login        │
│                                          │
│  User Profile (Requires Auth)            │
│  ├─ GET    /api/user/profile ◄── NEW    │
│  ├─ PUT    /api/user/profile ◄── NEW    │
│  └─ GET    /api/user/stats   ◄── NEW    │
│                                          │
│  Customer Management (Admin)             │
│  ├─ GET    /api/customers               │
│  ├─ GET    /api/customers/:id           │
│  ├─ PUT    /api/customers/:id           │
│  └─ GET    /api/customers/stats         │
│                                          │
│  Shopping (Guest & Auth)                 │
│  ├─ GET    /api/cart                    │
│  ├─ POST   /api/cart                    │
│  ├─ PUT    /api/cart/:itemId            │
│  ├─ DELETE /api/cart/:itemId            │
│  ├─ GET    /api/wishlist                │
│  └─ POST   /api/wishlist                │
│                                          │
│  Orders & Checkout                       │
│  ├─ POST   /api/orders                  │
│  ├─ GET    /api/orders/:id              │
│  └─ GET    /api/orders (user orders)    │
│                                          │
└─────────────────────────────────────────┘
```

---

## Request Flow Diagram

### Profile Update Flow
```
User clicks "Save Changes"
    │
    ├─ Validate form data (client-side)
    │
    ├─ Get token from localStorage
    │
    ├─ Prepare payload:
    │  {
    │    fullName: "John Smith",
    │    phone: "+44-7922-...",
    │    gender: "Male",
    │    address: "...",
    │    city: "London",
    │    country: "United Kingdom"
    │  }
    │
    ├─ PUT /api/user/profile
    │  Headers:
    │    Authorization: Bearer <token>
    │    Content-Type: application/json
    │
    │  Backend Processing:
    │  ├─ requireAuth middleware
    │  │  └─ Verify JWT token
    │  │
    │  ├─ User.updateProfile(userId, updates)
    │  │  ├─ Filter allowed fields
    │  │  ├─ Update MongoDB document
    │  │  └─ Return modified count
    │  │
    │  ├─ Fetch updated user
    │  │
    │  └─ formatCustomerResponse(user)
    │     └─ Exclude password field
    │
    │  Response: 200 OK + user object
    │
    ├─ Frontend shows success message
    │
    ├─ Update UserContext with new data
    │
    └─ Re-render Account page with updated values
```

### Customer List Flow
```
Admin clicks "Customers" tab
    │
    ├─ GET /api/customers?limit=10&offset=0
    │
    │  Backend Processing:
    │  ├─ requireAuth + requireAdmin middleware
    │  │
    │  ├─ User.getAllCustomers()
    │  │  ├─ Filter: { isGuest: false, role: 'user' }
    │  │  ├─ Skip/Limit for pagination
    │  │  ├─ Search (if provided)
    │  │  └─ Return formatted list
    │  │
    │  └─ Include pagination metadata
    │
    │  Response: 200 OK + customer array
    │
    ├─ Frontend displays:
    │  ├─ Statistics cards (total, active, revenue, avg)
    │  ├─ Search/filter bar
    │  ├─ Customer table with:
    │  │  ├─ Name, Email, Phone
    │  │  ├─ City, Loyalty Tier
    │  │  ├─ Total Orders, Total Spent (£)
    │  │  └─ Last Purchase Date
    │  └─ Pagination controls
    │
    └─ User can click row to see details
       └─ Shows full customer information
```

---

## State Management Flow

```
┌──────────────────────────────────┐
│      UserContext (Global)         │
├──────────────────────────────────┤
│  {                                │
│    user: {                        │
│      id: "...",                   │
│      email: "...",                │
│      fullName: "John Smith",      │
│      phone: "+44-7922-...",       │
│      gender: "Male",              │
│      city: "London",              │
│      ...                          │
│    },                             │
│    token: "eyJhbGci...",         │
│    isLoggedIn: true,              │
│    logout(),                      │
│    login(credentials),            │
│    updateProfile(newData)         │
│  }                                │
└──────────┬───────────────────────┘
           │
           ├─ Account.tsx
           │  └─ Uses user.fullName, gender, etc.
           │  └─ Calls updateProfile() on save
           │
           ├─ Admin/Customers.tsx
           │  └─ Displays customer list
           │  └─ Uses auth token for API calls
           │
           └─ Other Pages
              └─ Access authenticated data
```

---

## Authentication & Authorization

```
┌─────────────────────────────────────────────────────┐
│            JWT Token Structure                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Header.Payload.Signature                           │
│                                                      │
│  Payload contains:                                  │
│  {                                                  │
│    "id": "507f1f77bcf86cd799439011",               │
│    "email": "user@example.com",                     │
│    "role": "user" | "admin",                        │
│    "iat": 1704067800,                               │
│    "exp": 1704672600  (7 days)                      │
│  }                                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
                    │
                    │ Stored in localStorage
                    ▼
          ┌─────────────────────────┐
          │  Browser localStorage   │
          │  Key: authToken         │
          │  Value: JWT token       │
          └────────────┬────────────┘
                       │
         Sent with every API request
         Authorization: Bearer <token>
                       │
                       ▼
          ┌─────────────────────────┐
          │   requireAuth Middleware│
          │   (backend)             │
          ├─────────────────────────┤
          │ ✓ Extract token         │
          │ ✓ Verify signature      │
          │ ✓ Check expiry          │
          │ ✓ Attach user to req    │
          │ ✓ Allow/Block request   │
          └────────────┬────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
    Valid Token              Invalid/Missing
    Allow Access            Return 401 Error
```

---

## Gender Field Journey

```
Account.tsx Form
    │
    ├─ <Select> component
    │  ├─ Options: Male, Female, Other
    │  └─ formData.gender = value
    │
    ├─ handleSaveChanges()
    │  └─ Includes gender in payload
    │
    ├─ PUT /api/user/profile
    │  └─ { gender: "Male", ... }
    │
    ├─ Backend: User.updateProfile()
    │  ├─ Check 'gender' in allowedFields
    │  └─ Update document: { $set: { gender: "Male" } }
    │
    ├─ MongoDB persists
    │  └─ users[_id].gender = "Male"
    │
    ├─ Response: formatCustomerResponse()
    │  └─ Return { gender: "Male", ... }
    │
    ├─ Frontend: updateProfile() in UserContext
    │  └─ user.gender = "Male"
    │
    ├─ Account page re-renders
    │  └─ Display shows:
    │     "Gender: Male"
    │
    └─ Persist to database complete
       └─ Survives refresh, logout/login
```

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│            Security Architecture             │
├─────────────────────────────────────────────┤
│                                              │
│  Layer 1: Transport Security                │
│  ├─ CORS whitelist (localhost only)         │
│  ├─ Content-Type validation                 │
│  └─ HTTPS ready (use in production)         │
│                                              │
│  Layer 2: Authentication                    │
│  ├─ Bcryptjs password hashing (10 rounds)   │
│  ├─ JWT token generation                    │
│  ├─ Token expiry (7 days)                   │
│  └─ Token verification on every request     │
│                                              │
│  Layer 3: Authorization                     │
│  ├─ requireAuth middleware                  │
│  │  └─ Validates token presence/validity    │
│  │                                           │
│  ├─ requireAdmin middleware                 │
│  │  └─ Checks role === 'admin'              │
│  │                                           │
│  └─ Field-level validation                  │
│     └─ Only allowed fields updated          │
│                                              │
│  Layer 4: Data Protection                   │
│  ├─ Password never in API responses         │
│  ├─ Sensitive fields excluded               │
│  ├─ ObjectId validation                     │
│  └─ MongoDB injection prevention            │
│                                              │
│  Layer 5: Application Logic                 │
│  ├─ isGuest flag separation                 │
│  ├─ Role-based access control               │
│  ├─ Data filtering by status                │
│  └─ Pagination to prevent large transfers   │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Potential Error Points
    │
    ├─ Authentication Errors (401)
    │  ├─ Missing Authorization header
    │  ├─ Invalid token format
    │  ├─ Expired token (> 7 days)
    │  └─ Token signature mismatch
    │     └─ Frontend: Show "Please log in again"
    │
    ├─ Authorization Errors (403)
    │  ├─ User not admin (accessing /api/customers)
    │  └─ Frontend: Show "Access denied"
    │
    ├─ Validation Errors (400)
    │  ├─ Missing required fields
    │  ├─ Invalid data format
    │  └─ Frontend: Show "Invalid input"
    │
    ├─ Not Found Errors (404)
    │  ├─ User doesn't exist
    │  ├─ Customer not found
    │  └─ Frontend: Show "Record not found"
    │
    └─ Server Errors (500)
       ├─ Database connection failure
       ├─ Unexpected exceptions
       └─ Frontend: Show "Server error, try again"

All errors are logged to console for debugging
Response format: { success: false, message: "..." }
```

---

## Performance Characteristics

```
┌────────────────────────────────────────────┐
│         Performance Metrics                 │
├────────────────────────────────────────────┤
│                                             │
│  Database Queries                          │
│  ├─ GET /user/profile: 1 query             │
│  ├─ PUT /user/profile: 1 query + 1 update │
│  ├─ GET /customers: 1 count + 1 find      │
│  └─ Indexes: email (unique), role, status │
│                                             │
│  Pagination                                │
│  ├─ Default: 10 items per page            │
│  ├─ Min: 1, Max: 100                      │
│  └─ Offset-based (skip/limit)             │
│                                             │
│  Search                                    │
│  ├─ Regex pattern matching                │
│  ├─ Fields: fullName, email               │
│  ├─ Case-insensitive                      │
│  └─ No advanced text search yet           │
│                                             │
│  Caching                                   │
│  ├─ No server-side caching                │
│  ├─ Browser cache: Auth token only        │
│  └─ Real-time data (no staleness)         │
│                                             │
│  Network Payload                           │
│  ├─ User profile: ~500 bytes              │
│  ├─ Customer list (10x): ~5KB             │
│  ├─ No compression configured             │
│  └─ Ready for gzip in production          │
│                                             │
└────────────────────────────────────────────┘
```

---

## Deployment Checklist

```
Before Production:
  [ ] Change hardcoded localhost URLs
  [ ] Set up environment variables
  [ ] Enable HTTPS/TLS
  [ ] Configure production CORS origins
  [ ] Set up database backups
  [ ] Enable request logging
  [ ] Set up error monitoring
  [ ] Configure rate limiting
  [ ] Enable compression (gzip)
  [ ] Set up caching headers
  [ ] Verify JWT secret is secure
  [ ] Test all endpoints
  [ ] Load test profile updates
  [ ] Verify pagination works at scale
  [ ] Test error scenarios
  [ ] Document API for team
```

---

**System Status:** ✅ Complete and Functional  
**Last Updated:** This Session  
**Version:** 1.0  
**Environment:** Development (localhost)  
**Ready for:** Testing & QA  
