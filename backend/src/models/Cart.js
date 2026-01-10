import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class Cart {
  // Create TTL index for automatic deletion of guest carts after 6 hours
  static async createTTLIndex() {
    const db = getDB();
    try {
      await db.collection('carts').createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
      console.log('✅ Cart TTL index created successfully');
    } catch (error) {
      console.error('❌ Error creating Cart TTL index:', error);
    }
  }

  static async create(userId, items, isGuest = false, sessionId = null) {
    const db = getDB();
    const cart = {
      userId: isGuest ? null : new ObjectId(userId),
      sessionId: isGuest ? sessionId : null,
      isGuest: isGuest,
      items: items || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For guest carts, set expiration to 6 hours from now
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      cart.expiresAt = expiresAt;
    }

    const result = await db.collection('carts').insertOne(cart);
    return { _id: result.insertedId, ...cart };
  }

  static async findByUserId(userId) {
    const db = getDB();
    const cart = await db
      .collection('carts')
      .findOne({ userId: new ObjectId(userId), isGuest: false });
    return cart;
  }

  static async findBySessionId(sessionId) {
    const db = getDB();
    const cart = await db
      .collection('carts')
      .findOne({ sessionId, isGuest: true });
    return cart;
  }

  static async findByIdentifier(identifier, isGuest = false) {
    return isGuest 
      ? await this.findBySessionId(identifier)
      : await this.findByUserId(identifier);
  }

  static async addToCart(identifier, item, isGuest = false) {
    const db = getDB();
    const cart = await this.findByIdentifier(identifier, isGuest);

    if (!cart) {
      // Create new cart if doesn't exist
      return await this.create(identifier, [item], isGuest, isGuest ? identifier : null);
    }

    // Update the query based on guest or authenticated user
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    // Check if item already exists
    const existingItem = cart.items.find((i) => i.id === item.id);

    const updateDoc = {
      updatedAt: new Date(),
    };

    // For guest carts, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    if (existingItem) {
      // Update quantity if item exists
      return await db
        .collection('carts')
        .findOneAndUpdate(
          { ...query, 'items.id': item.id },
          {
            $inc: { 'items.$.quantity': item.quantity },
            $set: updateDoc,
          },
          { returnDocument: 'after' }
        );
    } else {
      // Add new item to cart
      return await db
        .collection('carts')
        .findOneAndUpdate(
          query,
          {
            $push: { items: item },
            $set: updateDoc,
          },
          { returnDocument: 'after' }
        );
    }
  }

  static async removeFromCart(identifier, itemId, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const updateDoc = {
      updatedAt: new Date(),
    };

    // For guest carts, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    return await db
      .collection('carts')
      .findOneAndUpdate(
        query,
        {
          $pull: { items: { id: itemId } },
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async updateQuantity(identifier, itemId, quantity, isGuest = false) {
    const db = getDB();

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await this.removeFromCart(identifier, itemId, isGuest);
    }

    const query = isGuest 
      ? { sessionId: identifier, isGuest: true, 'items.id': itemId }
      : { userId: new ObjectId(identifier), isGuest: false, 'items.id': itemId };

    const updateDoc = {
      'items.$.quantity': quantity,
      updatedAt: new Date(),
    };

    // For guest carts, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    return await db
      .collection('carts')
      .findOneAndUpdate(
        query,
        {
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async clearCart(identifier, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const updateDoc = {
      items: [],
      updatedAt: new Date(),
    };

    // For guest carts, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    return await db
      .collection('carts')
      .findOneAndUpdate(
        query,
        {
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async deleteCart(identifier, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const result = await db
      .collection('carts')
      .deleteOne(query);
    return result;
  }

  // Cleanup expired guest carts (backup to MongoDB TTL)
  static async cleanupExpiredGuestCarts() {
    const db = getDB();
    const now = new Date();
    const result = await db
      .collection('carts')
      .deleteMany({
        isGuest: true,
        expiresAt: { $lt: now }
      });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired guest cart(s)`);
    }
    return result;
  }

  // Convert guest cart to user cart on login/signup
  static async convertGuestCartToUserCart(sessionId, userId) {
    const db = getDB();
    
    // Find guest cart
    const guestCart = await this.findBySessionId(sessionId);
    if (!guestCart || guestCart.items.length === 0) {
      return null;
    }

    // Check if user already has a cart
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      // Merge guest cart items with user cart
      for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(item => item.id === guestItem.id);
        if (existingItem) {
          // Update quantity
          await db.collection('carts').updateOne(
            { userId: new ObjectId(userId), 'items.id': guestItem.id },
            { $inc: { 'items.$.quantity': guestItem.quantity } }
          );
        } else {
          // Add new item
          await db.collection('carts').updateOne(
            { userId: new ObjectId(userId) },
            { $push: { items: guestItem } }
          );
        }
      }
      
      // Delete guest cart
      await this.deleteCart(sessionId, true);
      
      // Return updated user cart
      return await this.findByUserId(userId);
    } else {
      // Convert guest cart to user cart
      const result = await db.collection('carts').findOneAndUpdate(
        { sessionId, isGuest: true },
        {
          $set: {
            userId: new ObjectId(userId),
            sessionId: null,
            isGuest: false,
            updatedAt: new Date()
          },
          $unset: { expiresAt: "" }
        },
        { returnDocument: 'after' }
      );
      
      return result;
    }
  }
}
