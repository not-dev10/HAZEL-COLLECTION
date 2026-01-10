import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class Wishlist {
  // Create TTL index for automatic deletion of guest wishlists after 6 hours
  static async createTTLIndex() {
    const db = getDB();
    try {
      await db.collection('wishlists').createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );
      console.log('✅ Wishlist TTL index created successfully');
    } catch (error) {
      console.error('❌ Error creating Wishlist TTL index:', error);
    }
  }

  static async create(userId, items, isGuest = false, sessionId = null) {
    const db = getDB();
    const wishlist = {
      userId: isGuest ? null : new ObjectId(userId),
      sessionId: isGuest ? sessionId : null,
      isGuest: isGuest,
      items: items || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // For guest wishlists, set expiration to 6 hours from now
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      wishlist.expiresAt = expiresAt;
    }

    const result = await db.collection('wishlists').insertOne(wishlist);
    return { _id: result.insertedId, ...wishlist };
  }

  static async findByUserId(userId) {
    const db = getDB();
    return await db
      .collection('wishlists')
      .findOne({ userId: new ObjectId(userId), isGuest: false });
  }

  static async findBySessionId(sessionId) {
    const db = getDB();
    return await db
      .collection('wishlists')
      .findOne({ sessionId, isGuest: true });
  }

  static async findByIdentifier(identifier, isGuest = false) {
    return isGuest 
      ? await this.findBySessionId(identifier)
      : await this.findByUserId(identifier);
  }

  static async addToWishlist(identifier, item, isGuest = false) {
    const db = getDB();
    const wishlist = await this.findByIdentifier(identifier, isGuest);

    // Ensure item has addedAt timestamp
    if (!item.addedAt) {
      item.addedAt = new Date().getTime();
    }

    if (!wishlist) {
      // Create new wishlist if doesn't exist
      return await this.create(identifier, [item], isGuest, isGuest ? identifier : null);
    }

    // Update the query based on guest or authenticated user
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const updateDoc = { updatedAt: new Date() };

    // For guest wishlists, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    // Check if item already exists
    const exists = wishlist.items.find((i) => i.id === item.id);
    if (exists) {
      // No duplicates; simply return current wishlist
      return await db
        .collection('wishlists')
        .findOne(query);
    }

    // Add new item
    return await db
      .collection('wishlists')
      .findOneAndUpdate(
        query,
        {
          $push: { items: item },
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async removeFromWishlist(identifier, itemId, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const updateDoc = { updatedAt: new Date() };

    // For guest wishlists, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    return await db
      .collection('wishlists')
      .findOneAndUpdate(
        query,
        {
          $pull: { items: { id: itemId } },
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async clearWishlist(identifier, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    const updateDoc = {
      items: [],
      updatedAt: new Date(),
    };

    // For guest wishlists, extend expiration time
    if (isGuest) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      updateDoc.expiresAt = expiresAt;
    }

    return await db
      .collection('wishlists')
      .findOneAndUpdate(
        query,
        {
          $set: updateDoc,
        },
        { returnDocument: 'after' }
      );
  }

  static async deleteWishlist(identifier, isGuest = false) {
    const db = getDB();
    const query = isGuest 
      ? { sessionId: identifier, isGuest: true }
      : { userId: new ObjectId(identifier), isGuest: false };

    return await db
      .collection('wishlists')
      .deleteOne(query);
  }

  // Cleanup expired guest wishlists (backup to MongoDB TTL)
  static async cleanupExpiredGuestWishlists() {
    const db = getDB();
    const now = new Date();
    const result = await db
      .collection('wishlists')
      .deleteMany({
        isGuest: true,
        expiresAt: { $lt: now }
      });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired guest wishlist(s)`);
    }
    return result;
  }

  // Convert guest wishlist to user wishlist on login/signup
  static async convertGuestWishlistToUserWishlist(sessionId, userId) {
    const db = getDB();
    
    // Find guest wishlist
    const guestWishlist = await this.findBySessionId(sessionId);
    if (!guestWishlist || guestWishlist.items.length === 0) {
      return null;
    }

    // Check if user already has a wishlist
    const userWishlist = await this.findByUserId(userId);

    if (userWishlist) {
      // Merge guest wishlist items with user wishlist
      for (const guestItem of guestWishlist.items) {
        const existingItem = userWishlist.items.find(item => item.id === guestItem.id);
        if (!existingItem) {
          // Add new item only if it doesn't exist
          await db.collection('wishlists').updateOne(
            { userId: new ObjectId(userId) },
            { $push: { items: guestItem } }
          );
        }
      }
      
      // Delete guest wishlist
      await this.deleteWishlist(sessionId, true);
      
      // Return updated user wishlist
      return await this.findByUserId(userId);
    } else {
      // Convert guest wishlist to user wishlist
      const result = await db.collection('wishlists').findOneAndUpdate(
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
