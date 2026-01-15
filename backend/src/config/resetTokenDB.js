/**
 * Password Reset Token Database Module
 * Stores password reset tokens in MongoDB with automatic expiration
 * Replaces in-memory Map storage for production use
 */

import { getDB } from './mongodb.js';

export class ResetTokenDB {
  /**
   * Initialize indexes for password reset tokens collection
   * Creates TTL index to automatically delete expired tokens
   */
  static async initializeIndexes() {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      // Create TTL index - documents automatically deleted after 30 minutes
      await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 1800 });
      
      // Create index on token for faster queries
      await collection.createIndex({ token: 1 });
      
      console.log('✅ Password reset token indexes initialized');
    } catch (error) {
      if (error.code !== 85) { // 85 = index already exists
        console.error('Error creating indexes:', error);
      }
    }
  }

  /**
   * Create a new password reset token
   * @param {string} token - Reset token
   * @param {string} jwtToken - JWT token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  static async create(token, jwtToken, userId, email) {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      await collection.insertOne({
        token,
        jwtToken,
        userId,
        email,
        createdAt: new Date(),
        used: false
      });
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw error;
    }
  }

  /**
   * Find a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object|null>}
   */
  static async findOne(token) {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      return await collection.findOne({ token });
    } catch (error) {
      console.error('Error finding reset token:', error);
      throw error;
    }
  }

  /**
   * Mark a token as used
   * @param {string} token - Reset token
   * @returns {Promise<void>}
   */
  static async markAsUsed(token) {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      await collection.updateOne(
        { token },
        { $set: { used: true, usedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error marking token as used:', error);
      throw error;
    }
  }

  /**
   * Delete a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<void>}
   */
  static async delete(token) {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      await collection.deleteOne({ token });
    } catch (error) {
      console.error('Error deleting reset token:', error);
      throw error;
    }
  }

  /**
   * Clean up all expired and used tokens
   * @returns {Promise<number>} - Number of tokens deleted
   */
  static async cleanupExpired() {
    try {
      const db = getDB();
      const collection = db.collection('passwordResetTokens');
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const result = await collection.deleteMany({
        $or: [
          { createdAt: { $lt: thirtyMinutesAgo } },
          { used: true }
        ]
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}

export default ResetTokenDB;
