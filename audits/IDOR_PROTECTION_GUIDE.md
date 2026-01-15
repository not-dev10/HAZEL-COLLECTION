# 🔒 IDOR Protection - Complete Guide

## What is IDOR?

**IDOR** = **Insecure Direct Object Reference**

It's a security vulnerability where users can access or modify data that belongs to OTHER users by simply changing an ID in the URL or request.

---

## 🚨 **The Problem (Without Protection)**

### Example Attack:

Imagine you're logged in as **User A** (ID: 123)

```javascript
// You view your order
GET /api/orders/456
// Returns YOUR order (order ID 456)

// Attacker changes the ID
GET /api/orders/457  // ← Someone else's order!
// Returns ANOTHER USER's order! 😱
```

### Without IDOR Protection:
```javascript
// ❌ VULNERABLE CODE
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  // No ownership check! Anyone can see any order!
  return res.json({ success: true, order });
};
```

**Result:** User A can see User B's orders, addresses, payment info, etc.

---

## ✅ **The Solution (With IDOR Protection)**

### Add Ownership Check:

```javascript
// ✅ SECURE CODE
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  
  // 🔒 IDOR PROTECTION: Check if order belongs to logged-in user
  if (order.userId.toString() !== req.user.id) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. This order doesn't belong to you." 
    });
  }
  
  // Only return if user owns this order
  return res.json({ success: true, order });
};
```

---

## 🎯 **How It Works**

### Step-by-Step:

1. **User logs in** → Gets JWT token with their ID
   ```javascript
   req.user.id = "123" // Logged-in user's ID
   ```

2. **User requests order** → `/api/orders/456`
   ```javascript
   req.params.id = "456" // Order ID from URL
   ```

3. **Fetch order from database**
   ```javascript
   order = { _id: "456", userId: "123", items: [...] }
   ```

4. **Check ownership**
   ```javascript
   if (order.userId.toString() !== req.user.id) {
     // order.userId = "123"
     // req.user.id = "123"
     // ✅ Match! User owns this order
   }
   ```

5. **Return order** (only if ownership check passes)

---

## 🔴 **Real-World Attack Example**

### Scenario: E-commerce Platform

**Attacker:** User ID = 999  
**Victim:** User ID = 123

### Attack Steps:

1. Attacker logs in normally
2. Attacker views their own order: `/api/orders/100`
3. Attacker notices the URL pattern
4. Attacker tries: `/api/orders/101`, `/api/orders/102`, `/api/orders/103`...
5. **Without IDOR protection:** Attacker sees ALL orders from ALL users!

### What Attacker Can Steal:
- ✅ Customer names and addresses
- ✅ Phone numbers and emails
- ✅ Order history and preferences
- ✅ Payment methods (last 4 digits)
- ✅ Delivery addresses

### Impact:
- **Privacy breach** - Customer data exposed
- **GDPR violation** - Massive fines
- **Reputation damage** - Loss of customer trust
- **Legal liability** - Lawsuits

---

## 🛡️ **Where to Apply IDOR Protection**

### Critical Endpoints:

1. **Orders**
   ```javascript
   GET /api/orders/:id
   PUT /api/orders/:id
   DELETE /api/orders/:id
   ```

2. **User Profile**
   ```javascript
   GET /api/user/:id
   PUT /api/user/:id
   DELETE /api/user/:id
   ```

3. **Cart**
   ```javascript
   GET /api/cart/:id
   PUT /api/cart/:id
   ```

4. **Wishlist**
   ```javascript
   GET /api/wishlist/:id
   DELETE /api/wishlist/:id
   ```

5. **Reviews**
   ```javascript
   PUT /api/reviews/:id
   DELETE /api/reviews/:id
   ```

6. **Addresses**
   ```javascript
   GET /api/addresses/:id
   PUT /api/addresses/:id
   DELETE /api/addresses/:id
   ```

---

## 💻 **Implementation Examples**

### Example 1: Order Controller

```javascript
// ❌ BEFORE (Vulnerable)
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ AFTER (Protected)
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    // 🔒 IDOR Protection
    if (order.userId.toString() !== req.user.id) {
      console.log(`⚠️ IDOR attempt: User ${req.user.id} tried to access order ${order._id} owned by ${order.userId}`);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }
    
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch order" 
    });
  }
};
```

### Example 2: Cart Controller

```javascript
export const updateCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    // 🔒 IDOR Protection
    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Update cart
    cart.items = req.body.items;
    await cart.save();
    
    return res.json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### Example 3: Review Controller

```javascript
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // 🔒 IDOR Protection - Only author or admin can delete
    const isOwner = review.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "You can only delete your own reviews" 
      });
    }
    
    await review.remove();
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

---

## 🧪 **Testing IDOR Protection**

### Test 1: Try to Access Another User's Order

```bash
# Login as User A
POST /api/auth/login
{ "email": "userA@example.com", "password": "..." }
# Returns: { "token": "TOKEN_A", "user": { "id": "123" } }

# Get User A's order (should work)
GET /api/orders/456
Authorization: Bearer TOKEN_A
# Returns: 200 OK - Order details

# Try to get User B's order (should fail)
GET /api/orders/789  # This order belongs to User B
Authorization: Bearer TOKEN_A
# Returns: 403 Forbidden - "Access denied"
```

### Test 2: Try to Modify Another User's Cart

```bash
# Login as User A
Authorization: Bearer TOKEN_A

# Try to update User B's cart
PUT /api/cart/999  # User B's cart
{ "items": [...] }

# Expected: 403 Forbidden
# Actual: 403 Forbidden ✅
```

---

## 🔍 **How to Find IDOR Vulnerabilities**

### Code Review Checklist:

Look for endpoints that:
1. ✅ Accept an ID parameter (`:id`, `:orderId`, etc.)
2. ✅ Fetch data from database using that ID
3. ❌ **Don't check** if the logged-in user owns that data

### Red Flags:

```javascript
// ❌ RED FLAG 1: No ownership check
const order = await Order.findById(req.params.id);
return res.json(order);

// ❌ RED FLAG 2: Using ID from URL without validation
const userId = req.params.userId;
const user = await User.findById(userId);
return res.json(user);

// ❌ RED FLAG 3: Trusting client-provided IDs
const { cartId } = req.body;
const cart = await Cart.findById(cartId);
cart.items = req.body.items;
await cart.save();
```

---

## ✅ **Best Practices**

### 1. Always Check Ownership

```javascript
if (resource.userId.toString() !== req.user.id) {
  return res.status(403).json({ message: "Access denied" });
}
```

### 2. Use User ID from Token (Not URL)

```javascript
// ❌ BAD: Trust ID from URL
const userId = req.params.userId;
const user = await User.findById(userId);

// ✅ GOOD: Use ID from authenticated token
const userId = req.user.id;
const user = await User.findById(userId);
```

### 3. Filter by User ID in Query

```javascript
// ❌ BAD: Fetch any order
const order = await Order.findById(orderId);

// ✅ GOOD: Fetch only user's orders
const order = await Order.findOne({ 
  _id: orderId, 
  userId: req.user.id 
});
```

### 4. Log IDOR Attempts

```javascript
if (order.userId.toString() !== req.user.id) {
  console.log(`⚠️ IDOR attempt detected!`);
  console.log(`User: ${req.user.id}`);
  console.log(`Tried to access: ${order._id}`);
  console.log(`Owner: ${order.userId}`);
  
  // Optional: Alert security team
  await SecurityLog.create({
    type: 'IDOR_ATTEMPT',
    userId: req.user.id,
    resourceId: order._id,
    timestamp: new Date()
  });
  
  return res.status(403).json({ message: "Access denied" });
}
```

---

## 🎯 **Quick Fix Template**

Use this template for all endpoints that access user data:

```javascript
export const getResource = async (req, res) => {
  try {
    // 1. Fetch resource
    const resource = await Resource.findById(req.params.id);
    
    // 2. Check if exists
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: "Resource not found" 
      });
    }
    
    // 3. 🔒 IDOR PROTECTION: Check ownership
    if (resource.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }
    
    // 4. Return resource
    return res.json({ success: true, resource });
    
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
```

---

## 📊 **Impact of IDOR Vulnerabilities**

### Real-World Examples:

1. **Facebook (2013)** - IDOR allowed viewing private photos
2. **Instagram (2019)** - IDOR exposed private account data
3. **Uber (2016)** - IDOR allowed trip history access
4. **Venmo (2018)** - IDOR exposed transaction history

### Potential Damage:
- 💰 **Financial Loss** - Fines up to $20M (GDPR)
- 📉 **Stock Price Drop** - Average 7.5% after breach
- 👥 **Customer Loss** - 65% stop using service
- ⚖️ **Legal Action** - Class action lawsuits
- 📰 **Reputation Damage** - Years to recover

---

## ✅ **Summary**

### What is IDOR?
A vulnerability where users can access data that doesn't belong to them by manipulating IDs.

### How to Fix?
Always check if `resource.userId === req.user.id` before returning data.

### Why Important?
Prevents unauthorized access to sensitive user data.

### Where to Apply?
Every endpoint that accepts an ID parameter and returns user-specific data.

---

**Remember:** If an endpoint accepts an ID, ALWAYS verify ownership! 🔒

---

**Last Updated:** January 15, 2026  
**Severity:** 🔴 CRITICAL  
**Priority:** Fix immediately
