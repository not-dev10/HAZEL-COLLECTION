# Code Changes Reference

## 1. User Model Updates
**File:** `backend/src/models/User.js`

### Key Addition: Customer Methods
```javascript
/**
 * Get all customers (non-guest users)
 * Filters: isGuest: false, role: 'user'
 */
static async getAllCustomers({ limit = 10, offset = 0, status = null, search = null } = {}) {
  const db = getDB();
  const users = db.collection("users");

  const filter = { isGuest: false, role: 'user' };
  
  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const total = await users.countDocuments(filter);
  const data = await users
    .find(filter)
    .skip(offset)
    .limit(limit)
    .toArray();

  return {
    data: data.map(user => this.formatCustomerResponse(user)),
    pagination: { total, limit, offset }
  };
}

/**
 * Update user profile fields
 */
static async updateProfile(userId, updates) {
  const db = getDB();
  const users = db.collection("users");

  const allowedFields = ['fullName', 'phone', 'gender', 'address', 'city', 'country', 'preferredCategory', 'status', 'loyalty'];
  const validUpdates = {};

  for (const field of allowedFields) {
    if (field in updates) {
      validUpdates[field] = updates[field];
    }
  }

  const result = await users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...validUpdates, updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

/**
 * Format response without sensitive data
 */
static formatCustomerResponse(user) {
  const { password, ...safeUser } = user;
  return {
    id: user._id?.toString(),
    ...safeUser,
    createdAt: user.createdAt?.toISOString?.(),
    lastLogin: user.lastLogin?.toISOString?.()
  };
}
```

---

## 2. Customer Controller Refactor
**File:** `backend/src/controllers/customer.controller.js`

### BEFORE (Using separate Customer class):
```javascript
import { Customer } from "../models/Customer.js";

export const getAllCustomers = async (req, res) => {
  const result = await Customer.getAllCustomers({...});
  res.json(result);
};

export const getCustomerById = async (req, res) => {
  const customer = await Customer.getCustomerById(customerId);
  res.json({ success: true, data: customer });
};
```

### AFTER (Using User model):
```javascript
import { User } from "../models/User.js";

export const getAllCustomers = async (req, res) => {
  const result = await User.getAllCustomers({...});
  res.json({ success: true, data: result.data, pagination: result.pagination });
};

export const getCustomerById = async (req, res) => {
  const user = await User.findById(customerId);
  res.json({ success: true, data: User.formatCustomerResponse(user) });
};
```

---

## 3. New User Routes
**File:** `backend/src/routes/user.routes.js` (NEW)

```javascript
import express from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * PUT /api/user/profile
 * Update authenticated user's profile
 */
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.userId;
    const updates = req.body;

    const updated = await User.updateProfile(userId, updates);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No changes made or invalid update"
      });
    }

    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: User.formatCustomerResponse(updatedUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 */
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: User.formatCustomerResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

---

## 4. App Configuration Update
**File:** `backend/src/app.js`

### BEFORE:
```javascript
import customerRoutes from "./routes/customer.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
// ... other routes
app.use("/api/customers", customerRoutes);
```

### AFTER:
```javascript
import customerRoutes from "./routes/customer.routes.js";
import userRoutes from "./routes/user.routes.js";  // NEW

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);                  // NEW
app.use("/api/products", productRoutes);
// ... other routes
app.use("/api/customers", customerRoutes);
```

---

## 5. Account Page Integration
**File:** `frontend/src/pages/Account.tsx`

### BEFORE (Local state only):
```javascript
const handleSaveChanges = () => {
  updateProfile({
    firstName: formData.firstName,
    lastName: formData.lastName,
    // ... other fields
  });
  setIsEditing(false);
};
```

### AFTER (API integration):
```javascript
const [isSaving, setIsSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

const handleSaveChanges = async () => {
  try {
    setIsSaving(true);
    setSaveMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setSaveMessage({ 
        type: 'error', 
        text: 'Authentication token not found. Please log in again.' 
      });
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const updatePayload = {
      fullName,
      phone: formData.phone,
      gender: formData.gender,
      address: `${formData.billingStreet}, ${formData.billingCity}`,
      city: formData.billingCity,
      country: formData.billingCountry,
    };

    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    updateProfile(data.data);
    setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsEditing(false);

    setTimeout(() => setSaveMessage(null), 3000);
  } catch (error) {
    setSaveMessage({
      type: 'error',
      text: error instanceof Error ? error.message : 'Failed to save profile. Please try again.',
    });
  } finally {
    setIsSaving(false);
  }
};
```

### UI Update for Messages:
```javascript
{/* Action Buttons */}
{isEditing && (
  <div className="space-y-4 mt-8 pt-8 border-t border-border">
    {saveMessage && (
      <div
        className={`p-4 rounded-lg ${
          saveMessage.type === 'success'
            ? 'bg-green-50 text-green-900 border border-green-200'
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}
      >
        {saveMessage.text}
      </div>
    )}
    <div className="flex gap-4">
      <Button
        onClick={handleSaveChanges}
        className="gap-2"
        disabled={isSaving}
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
      <Button
        onClick={() => setIsEditing(false)}
        variant="outline"
        className="gap-2"
        disabled={isSaving}
      >
        <X size={16} />
        Cancel
      </Button>
    </div>
  </div>
)}
```

---

## 6. Database Schema (User Document)

### Initial Creation (User.create())
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$...",  // bcrypt hash
  fullName: "John Smith",
  phone: "+44-7911-123456",
  
  // Customer Fields
  gender: '',
  address: '',
  city: '',
  country: 'United Kingdom',
  preferredCategory: '',
  
  // Status Tracking
  isGuest: false,
  role: 'user',
  status: 'active',
  loyalty: 'bronze',
  
  // Order Stats
  totalOrders: 0,
  totalSpent: 0,
  lastPurchaseDate: null,
  
  // Timestamps
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  lastLogin: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:35:00Z")
}
```

### After Profile Edit
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$...",  // unchanged
  fullName: "John Smith",
  phone: "+44-7922-654321",  // UPDATED
  
  // Customer Fields - UPDATED
  gender: 'Male',            // was ''
  address: "123 Oxford Street, London",  // was ''
  city: 'London',            // was ''
  country: 'United Kingdom',
  
  // ... rest unchanged
  updatedAt: ISODate("2024-01-15T10:35:00Z")
}
```

---

## 7. API Request/Response Examples

### Update Profile Request
```http
PUT /api/user/profile HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "John Smith",
  "phone": "+44-7922-654321",
  "gender": "Male",
  "address": "123 Oxford Street, London",
  "city": "London",
  "country": "United Kingdom"
}
```

### Update Profile Response (Success)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Smith",
    "phone": "+44-7922-654321",
    "gender": "Male",
    "address": "123 Oxford Street, London",
    "city": "London",
    "country": "United Kingdom",
    "totalOrders": 0,
    "totalSpent": 0,
    "loyalty": "bronze",
    "status": "active",
    "isGuest": false,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Customers Request
```http
GET /api/customers?limit=10&offset=0&status=active HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Customers Response
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "fullName": "John Smith",
      "phone": "+44-7922-654321",
      "city": "London",
      "loyalty": "bronze",
      "totalOrders": 0,
      "totalSpent": 0,
      "status": "active",
      "lastPurchaseDate": null
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

## 8. Frontend State Updates

### UserContext Integration
```javascript
// Account.tsx calls:
updateProfile(data.data)

// This updates UserContext with:
{
  ...previousUser,
  fullName: "John Smith",
  phone: "+44-7922-654321",
  gender: "Male",
  address: "123 Oxford Street, London",
  city: "London",
  country: "United Kingdom"
}
```

---

## Summary of Changes

| Component | Change Type | Files | Impact |
|-----------|------------|-------|--------|
| User Model | Enhancement | User.js | +6 methods, customer fields |
| Customer Controller | Refactor | customer.controller.js | Remove Customer dependency |
| User Routes | New | user.routes.js | Profile edit API |
| App Config | Update | app.js | Register user routes |
| Account Page | Enhancement | Account.tsx | API integration, loading states |
| Database | Schema | MongoDB | isGuest field, customer data |

**Total Lines Added:** ~400+
**Total Files Modified:** 5
**Total New Files:** 1
**Breaking Changes:** None (backward compatible)

---
