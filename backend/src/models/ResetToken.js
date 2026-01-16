import { getDB } from '../config/mongodb.js';
import crypto from 'crypto';

/**
 * ResetToken Model
 * Manages password reset tokens with expiration
 */
export class ResetToken {
  /**
   * Create a new reset token
   * @param {string} token - The reset token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {Promise<Object>} Created token record
   */
  static async create(token, userId, email) {
    try {
      const db = getDB();
      const collection = db.collection('resetTokens');

      // Hash the token for storage (security best practice)
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Set expiration to 30 minutes from now
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      const result = await collection.insertOne({
        token: hashedToken,
        userId,
        email,
        createdAt: new Date(),
        expiresAt,
        used: false
      });

      console.log('✅ Reset token created');
      return result;
    } catch (error) {
      console.error('❌ Error creating reset token:', error);
      throw error;
    }
  }

  /**
   * Find and validate reset token
   * @param {string} token - The reset token to validate
   * @returns {Promise<Object|null>} Token record if valid, null otherwise
   */
  static async findByToken(token) {
    try {
      const db = getDB();
      const collection = db.collection('resetTokens');

      // Hash the token to match stored value
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const record = await collection.findOne({
        token: hashedToken,
        used: false,
        expiresAt: { $gt: new Date() } // Not expired
      });

      if (!record) {
        console.warn('⚠️ Reset token not found or expired');
        return null;
      }

      console.log('✅ Reset token validated');
      return record;
    } catch (error) {
      console.error('❌ Error finding reset token:', error);
      throw error;
    }
  }

  /**
   * Mark token as used and delete it
   * @param {string} token - The reset token to delete
   * @returns {Promise<Object>} Delete result
   */
  static async deleteByToken(token) {
    try {
      const db = getDB();
      const collection = db.collection('resetTokens');

      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const result = await collection.deleteOne({
        token: hashedToken
      });

      console.log('✅ Reset token deleted');
      return result;
    } catch (error) {
      console.error('❌ Error deleting reset token:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens (can be run periodically)
   * @returns {Promise<Object>} Delete result
   */
  static async deleteExpiredTokens() {
    try {
      const db = getDB();
      const collection = db.collection('resetTokens');

      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log('✅ Expired reset tokens cleaned up:', result.deletedCount);
      return result;
    } catch (error) {
      console.error('❌ Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Create TTL index for automatic expiration
   * Documents will be automatically deleted 30 minutes after creation
   */
  static async createTTLIndex() {
    try {
      const db = getDB();
      const collection = db.collection('resetTokens');

      await collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 } // Delete when expiresAt time is reached
      );

      console.log('✅ TTL index created for resetTokens collection');
    } catch (error) {
      console.error('❌ Error creating TTL index:', error);
      // Index might already exist, which is fine
    }
  }
}
