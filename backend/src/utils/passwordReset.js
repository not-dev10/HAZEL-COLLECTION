/**
 * Password Reset Utility
 * Handles password reset tokens and verification
 * Now uses MongoDB for persistent storage instead of in-memory Map
 */
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ResetTokenDB from "../config/resetTokenDB.js";

class PasswordResetManager {
  constructor() {
    this.maxTokenAge = 1800000; // 30 minutes
    console.log('✅ Password reset tokens using MongoDB persistent storage');
  }

  /**
   * Generate a password reset token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {Promise<string>} - Reset token
   */
  async generateResetToken(userId, email) {
    try {
      // Create a secure random token
      const randomToken = crypto.randomBytes(32).toString('hex');
      
      // Create JWT token with short expiration
      const jwtToken = jwt.sign(
        { userId, email, type: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: "30m", algorithm: "HS256" } // 30 minutes
      );

      // Store in MongoDB
      await ResetTokenDB.create(randomToken, jwtToken, userId, email);

      return randomToken;
    } catch (error) {
      console.error('Error generating reset token:', error);
      throw error;
    }
  }

  /**
   * Verify and validate a reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object|null>} - Token data if valid, null otherwise
   */
  async verifyResetToken(token) {
    try {
      // Find token in MongoDB
      const tokenData = await ResetTokenDB.findOne(token);

      if (!tokenData) {
        return null;
      }

      // Check if already used
      if (tokenData.used) {
        return null;
      }

      // Verify JWT
      try {
        jwt.verify(tokenData.jwtToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        return tokenData;
      } catch (error) {
        return null;
      }
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error;
    }
  }

  /**
   * Mark token as used
   * @param {string} token - Reset token
   * @returns {Promise<void>}
   */
  async markTokenAsUsed(token) {
    try {
      await ResetTokenDB.markAsUsed(token);
      
      // Delete after marking as used (optional cleanup)
      setTimeout(async () => {
        try {
          await ResetTokenDB.delete(token);
        } catch (error) {
          console.error('Error deleting used token:', error);
        }
      }, 300000); // Delete after 5 minutes
    } catch (error) {
      console.error('Error marking token as used:', error);
      throw error;
    }
  }

  /**
   * Cleanup expired tokens (called periodically)
   * @returns {Promise<number>} - Number of tokens deleted
   */
  async cleanupExpiredTokens() {
    try {
      return await ResetTokenDB.cleanupExpired();
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}

export const passwordResetManager = new PasswordResetManager();

// Cleanup expired tokens every 30 minutes
setInterval(async () => {
  try {
    const deleted = await passwordResetManager.cleanupExpiredTokens();
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} expired password reset tokens`);
    }
  } catch (error) {
    console.error('Error in token cleanup scheduler:', error);
  }
}, 1800000);
