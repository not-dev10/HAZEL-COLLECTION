# Guest User Cart & Wishlist Implementation

## Overview
The backend now supports guest users with temporary cart and wishlist storage. Guest data is cached for **6 hours** and automatically deleted after expiration using MongoDB TTL (Time-To-Live) indexes and a scheduled cleanup service.

## Features

### 1. **Guest Session Management**
- Automatic session ID generation for guest users
- Session IDs are unique UUIDs prefixed with `guest_`
- Guest sessions are independent of user accounts

### 2. **6-Hour Auto-Expiry**
- Guest carts and wishlists automatically expire after 6 hours
- MongoDB TTL index handles automatic deletion
- Scheduled cleanup job runs every hour as backup

### 3. **Data Conversion on Login/Signup**
- When a guest user creates an account, their cart/wishlist is converted to the user's account
- Items are merged if the user already has data
- Guest data is automatically cleaned up after conversion

## How It Works

### Authentication Methods

**For Guest Users:**
```
Header: Authorization: Guest <sessionId>
OR
Header: X-Session-ID: <sessionId>
```

**For Authenticated Users:**
```
Header: Authorization: Bearer <JWT_token>
```

### Request/Response Format

#### Getting Cart (No Auth - Creates Guest Session)
```bash
GET /api/cart

Response:
{
  "sessionId": "guest_a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6",
  "items": [],
  "message": "Guest cart created - use this sessionId for future requests"
}
```

#### Getting Cart (With Guest Session)
```bash
GET /api/cart
Authorization: Guest guest_a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6

Response:
{
  "_id": "ObjectId",
  "sessionId": "guest_...",
  "items": [...],
  "itemCount": 3,
  "total": 150.00,
  "expiresAt": "2026-01-09T16:30:45.000Z",
  "isGuest": true,
  "createdAt": "2026-01-09T10:30:45.000Z",
  "updatedAt": "2026-01-09T10:35:45.000Z"
}
```

#### Adding to Cart (Guest)
```bash
POST /api/cart/add
Authorization: Guest guest_a1b2c3d4-e5f6-7g8h-i9j0-k1l2m3n4o5p6
Content-Type: application/json

{
  "id": "product_123",
  "name": "Blue T-Shirt",
  "price": 29.99,
  "quantity": 2,
  "image": "url_to_image",
  "size": "M",
  "color": "blue"
}

Response:
{
  "message": "Item added to cart",
  "cart": {
    "_id": "ObjectId",
    "sessionId": "guest_...",
    "items": [...],
    "itemCount": 2,
    "total": 59.98,
    "expiresAt": "2026-01-09T16:35:45.000Z",  // Extended to 6 hours from now
    "isGuest": true,
    "updatedAt": "2026-01-09T10:35:45.000Z"
  }
}
```

#### Similar for Wishlist Operations
All wishlist endpoints work identically:
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/add` - Add item
- `DELETE /api/wishlist/remove/:itemId` - Remove item
- `DELETE /api/wishlist/clear` - Clear all items

## Database Schema Changes

### Cart Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId || null,        // null for guest
  sessionId: string || null,       // Only for guest
  isGuest: boolean,               // true for guest, false for user
  items: [
    {
      id: string,
      name: string,
      price: number,
      quantity: number,
      image: string,
      size: string,
      color: string
    }
  ],
  expiresAt: Date,                // 6 hours from now (guest only)
  createdAt: Date,
  updatedAt: Date
}
```

### Wishlist Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId || null,        // null for guest
  sessionId: string || null,       // Only for guest
  isGuest: boolean,               // true for guest, false for user
  items: [
    {
      id: string,
      name: string,
      price: number,
      image: string,
      addedAt: Date
    }
  ],
  expiresAt: Date,                // 6 hours from now (guest only)
  createdAt: Date,
  updatedAt: Date
}
```

### TTL Index
Both collections have TTL indexes on `expiresAt`:
```javascript
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.wishlists.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

## Cleanup Service

### Scheduled Cleanup Job
- **Interval**: Runs every 1 hour
- **Purpose**: Backup to MongoDB TTL for cleanup
- **Log Output**:
```
📋 Running guest data cleanup...
🧹 Cleaned up 5 expired guest cart(s)
🧹 Cleaned up 3 expired guest wishlist(s)
✅ Cleanup completed in 125ms - Deleted 8 expired guest item(s)
```

### Manual Cleanup
```javascript
import { manualCleanup } from './services/guestCleanup.service.js';
await manualCleanup();
```

## Conversion Process (Guest to User)

When a guest creates an account or logs in:

### Cart Conversion
```javascript
await Cart.convertGuestCartToUserCart(sessionId, userId);
```

**Process:**
1. Find guest cart by sessionId
2. Check if user already has a cart
3. If user has cart: Merge guest items (update quantities if duplicate)
4. If user has no cart: Convert guest cart to user cart
5. Delete guest cart
6. Return updated user cart

### Wishlist Conversion
```javascript
await Wishlist.convertGuestWishlistToUserWishlist(sessionId, userId);
```

**Process:**
1. Find guest wishlist by sessionId
2. Check if user already has a wishlist
3. If user has wishlist: Merge guest items (no duplicates)
4. If user has no wishlist: Convert guest wishlist to user wishlist
5. Delete guest wishlist
6. Return updated user wishlist

## Implementation Files

### Models
- **[Cart.js](backend/src/models/Cart.js)**
  - `createTTLIndex()` - Create TTL index
  - `findBySessionId(sessionId)` - Find guest cart
  - `findByIdentifier(identifier, isGuest)` - Find cart for user or guest
  - `addToCart(identifier, item, isGuest)` - Add item
  - `removeFromCart(identifier, itemId, isGuest)` - Remove item
  - `updateQuantity(identifier, itemId, quantity, isGuest)` - Update quantity
  - `clearCart(identifier, isGuest)` - Clear cart
  - `cleanupExpiredGuestCarts()` - Delete expired guest carts
  - `convertGuestCartToUserCart(sessionId, userId)` - Convert guest to user

- **[Wishlist.js](backend/src/models/Wishlist.js)**
  - Same methods as Cart but for wishlists

### Controllers
- **[cart.controller.js](backend/src/controllers/cart.controller.js)**
  - Updated all endpoints to support guest sessions
  - Uses helper function `getIdentifier()` to detect user/guest
  - Auto-generates session ID if needed

- **[wishlist.controller.js](backend/src/controllers/wishlist.controller.js)**
  - Updated all endpoints to support guest sessions
  - Same pattern as cart controller

### Services
- **[guestCleanup.service.js](backend/src/services/guestCleanup.service.js)**
  - `startGuestCleanupScheduler()` - Start 1-hour cleanup scheduler
  - `stopGuestCleanupScheduler()` - Stop scheduler
  - `manualCleanup()` - Trigger cleanup manually

### Utilities
- **[guestSession.js](backend/src/utils/guestSession.js)**
  - `generateSessionId()` - Generate unique UUID
  - `getSessionIdFromRequest(req)` - Extract session ID
  - `getTokenFromRequest(req)` - Extract JWT token
  - `isGuestSession(req)` - Check if request is from guest

### Server
- **[server.js](backend/src/server.js)**
  - Initialize TTL indexes on startup
  - Start cleanup scheduler
  - Log guest authentication info

## Testing Guide

### 1. Create Guest Session
```bash
curl -X GET http://localhost:5000/api/cart
```

Save the `sessionId` from response.

### 2. Add Item to Guest Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Guest <sessionId>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "product_1",
    "name": "T-Shirt",
    "price": 29.99,
    "quantity": 1,
    "image": "url",
    "size": "M",
    "color": "blue"
  }'
```

### 3. Get Guest Cart
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Guest <sessionId>"
```

### 4. Update Quantity
```bash
curl -X PUT http://localhost:5000/api/cart/update/product_1 \
  -H "Authorization: Guest <sessionId>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### 5. Remove Item
```bash
curl -X DELETE http://localhost:5000/api/cart/remove/product_1 \
  -H "Authorization: Guest <sessionId>"
```

## Environment Variables
No new environment variables required. All guest data handling is automatic.

## Performance Considerations

1. **TTL Index**: MongoDB automatically deletes expired documents
2. **Cleanup Job**: Runs every hour to catch any missed deletions
3. **Expiration Extended**: Each operation extends guest expiration by 6 hours
4. **Session IDs**: No centralized storage, stateless session management

## Future Enhancements

1. **Guest to User Migration Endpoint**
   ```
   POST /api/auth/convert-guest
   Body: { sessionId, userId }
   ```

2. **Cart/Wishlist Persistence**
   - Add API to convert guest data when user signs up

3. **Guest Analytics**
   - Track abandoned carts
   - Analyze guest browsing patterns

4. **Extended Session TTL**
   - Allow users to configure guest session duration
   - Different TTL for different user tiers

## Troubleshooting

### Session ID Not Found
- Make sure to use the exact session ID returned by first request
- Check header format: `Authorization: Guest <sessionId>`

### Data Expired Unexpectedly
- Check server logs for cleanup job
- Verify MongoDB TTL index exists
- Ensure server time is synchronized

### Cart/Wishlist Not Converting
- Verify guest session ID is correct
- Check user is created first
- Review conversion logs in server output

## API Compatibility

All existing authenticated endpoints remain unchanged:
```bash
Authorization: Bearer <JWT_token>
```

New guest endpoints use:
```bash
Authorization: Guest <sessionId>
X-Session-ID: <sessionId>  # Alternative
```
