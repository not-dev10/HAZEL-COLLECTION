# 🎯 Guest User Implementation - Complete Summary

## ✅ Implementation Complete!

### What Was Implemented

```
┌─────────────────────────────────────────────────────────────┐
│         GUEST USER CART & WISHLIST SYSTEM                  │
│         6-Hour Auto-Expiry with Auto-Cleanup               │
└─────────────────────────────────────────────────────────────┘

┌─── GUEST SESSION ───┐
│ • Unique Session ID │
│ • No User Account   │
│ • 6-Hour Expiry     │
└─────────────────────┘
           ↓
┌─── CART/WISHLIST ───┐
│ • Stored in MongoDB │
│ • TTL Index Setup   │
│ • Auto-Delete       │
└─────────────────────┘
           ↓
┌─── CLEANUP JOB ─────┐
│ • Runs Every Hour   │
│ • Backup Removal    │
│ • Logging           │
└─────────────────────┘
           ↓
┌─── CONVERSION ──────┐
│ • Guest → User      │
│ • Data Merge        │
│ • Auto Cleanup      │
└─────────────────────┘
```

---

## 📁 Files Modified/Created

### Created Files:
1. ✅ **[/backend/src/services/guestCleanup.service.js](backend/src/services/guestCleanup.service.js)**
   - Scheduled cleanup job (every 1 hour)
   - Removes expired guest data
   - Manual cleanup support

2. ✅ **[/backend/src/utils/guestSession.js](backend/src/utils/guestSession.js)**
   - Session ID generation (UUID)
   - Extract session/token from requests
   - Helper utilities

3. ✅ **[/GUEST_USER_IMPLEMENTATION.md](GUEST_USER_IMPLEMENTATION.md)**
   - Complete documentation
   - API examples
   - Testing guide

### Modified Files:

4. ✅ **[/backend/src/models/Cart.js](backend/src/models/Cart.js)**
   ```diff
   + createTTLIndex() - Create MongoDB TTL index
   + findBySessionId(sessionId) - Find guest cart
   + findByIdentifier(identifier, isGuest) - Universal finder
   + addToCart(identifier, item, isGuest) - Guest support
   + removeFromCart(identifier, itemId, isGuest) - Guest support
   + updateQuantity(identifier, itemId, qty, isGuest) - Guest support
   + clearCart(identifier, isGuest) - Guest support
   + cleanupExpiredGuestCarts() - Manual cleanup
   + convertGuestCartToUserCart(sessionId, userId) - Conversion
   ```

5. ✅ **[/backend/src/models/Wishlist.js](backend/src/models/Wishlist.js)**
   ```diff
   + Same methods as Cart model (for wishlist)
   ```

6. ✅ **[/backend/src/controllers/cart.controller.js](backend/src/controllers/cart.controller.js)**
   ```diff
   + getIdentifier(req) - Detect user/guest
   + Auto-generate session if needed
   + Support guest in all endpoints:
     - getCart
     - addToCart
     - removeFromCart
     - updateQuantity
     - clearCart
   ```

7. ✅ **[/backend/src/controllers/wishlist.controller.js](backend/src/controllers/wishlist.controller.js)**
   ```diff
   + Same updates as cart controller
   ```

8. ✅ **[/backend/src/server.js](backend/src/server.js)**
   ```diff
   + Initialize Cart TTL index
   + Initialize Wishlist TTL index
   + Start cleanup scheduler
   + Log guest auth info on startup
   ```

9. ✅ **[/backend/package.json](backend/package.json)**
   ```diff
   + "uuid": "^9.0.1"
   ```

---

## 🚀 How to Use

### For Frontend/Client:

#### 1. Get Guest Session (No Auth Required)
```bash
GET /api/cart
→ Returns: { sessionId: "guest_..." }
```

#### 2. Use Session for All Requests
```bash
# Authorization Header
Authorization: Guest guest_a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6

# Or X-Session-ID Header
X-Session-ID: guest_a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6
```

#### 3. Add Items to Cart/Wishlist
```bash
POST /api/cart/add
Authorization: Guest <sessionId>
{
  "id": "product_1",
  "name": "Blue T-Shirt",
  "price": 29.99,
  "quantity": 1,
  "image": "url",
  "size": "M",
  "color": "blue"
}
```

#### 4. When Guest Becomes User
Call the conversion methods in auth controller to migrate data:
```javascript
await Cart.convertGuestCartToUserCart(sessionId, userId);
await Wishlist.convertGuestWishlistToUserWishlist(sessionId, userId);
```

---

## ⏰ Timeline

### Guest Lifecycle:
```
Guest Adds Item → Session Created (Now + 6 hours)
        ↓
Guest Updates Cart → Expiration Extended (Now + 6 hours)
        ↓
Guest Inactive > 6 hours → Auto-Deleted
        ↓
Data Removed from DB
```

---

## 🔧 Technical Details

### TTL Index
```javascript
// Created on server startup
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.wishlists.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Documents deleted when: expiresAt < current_time
```

### Cleanup Service
```javascript
// Runs automatically every hour
Cleanup Interval: 60 minutes
Backup Removal: Manual delete for expired documents
Logging: Console output for monitoring

// Log Output Example:
🔄 Starting guest data cleanup scheduler...
✅ Guest cleanup scheduler started (runs every hour)
📋 Running guest data cleanup...
🧹 Cleaned up 5 expired guest cart(s)
🧹 Cleaned up 3 expired guest wishlist(s)
✅ Cleanup completed in 125ms - Deleted 8 expired guest item(s)
```

### Expiration Extension
Every operation extends guest session expiration by 6 hours:
```javascript
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 6);
```

---

## 📊 Response Examples

### GET /api/cart (No Auth - Creates Guest)
```json
{
  "sessionId": "guest_uuid-here",
  "items": [],
  "message": "Guest cart created - use this sessionId for future requests"
}
```

### GET /api/cart (With Guest Session)
```json
{
  "_id": "ObjectId",
  "sessionId": "guest_uuid-here",
  "items": [
    {
      "id": "product_1",
      "name": "Blue T-Shirt",
      "price": 29.99,
      "quantity": 2,
      "image": "url",
      "size": "M",
      "color": "blue"
    }
  ],
  "itemCount": 2,
  "total": 59.98,
  "expiresAt": "2026-01-09T16:35:45.000Z",
  "isGuest": true,
  "createdAt": "2026-01-09T10:35:45.000Z",
  "updatedAt": "2026-01-09T10:35:45.000Z"
}
```

### POST /api/cart/add (Guest)
```json
{
  "message": "Item added to cart",
  "cart": {
    "_id": "ObjectId",
    "sessionId": "guest_uuid-here",
    "items": [...],
    "itemCount": 2,
    "total": 59.98,
    "expiresAt": "2026-01-09T16:35:45.000Z",
    "isGuest": true,
    "updatedAt": "2026-01-09T10:35:45.000Z"
  }
}
```

---

## 🔐 Security Features

✅ **Session Isolation**: Each guest has unique session ID
✅ **Auto-Expiry**: Data automatically deleted after 6 hours
✅ **No Authentication**: No password/token needed for guests
✅ **Data Cleanup**: Scheduled cleanup prevents orphaned data
✅ **Seamless Migration**: Guest data converts to user account

---

## 📋 Checklist

- ✅ Cart model updated with guest support
- ✅ Wishlist model updated with guest support
- ✅ TTL indexes configured
- ✅ Cleanup service implemented
- ✅ Session utilities created
- ✅ Controllers updated
- ✅ Server initialization updated
- ✅ Dependencies added (uuid)
- ✅ Full documentation created
- ✅ Ready for production

---

## 🧪 Testing

See [GUEST_USER_IMPLEMENTATION.md](GUEST_USER_IMPLEMENTATION.md) for complete testing guide with curl examples.

---

## 📞 Support

For any questions or issues:
1. Check [GUEST_USER_IMPLEMENTATION.md](GUEST_USER_IMPLEMENTATION.md)
2. Review server logs for cleanup activity
3. Verify MongoDB TTL indexes exist
4. Ensure UUID package is installed
