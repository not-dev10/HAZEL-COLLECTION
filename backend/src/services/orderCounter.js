/**
 * Order Counter Service
 * Generates sequential order numbers
 */

import { getDB } from '../config/mongodb.js';

export class OrderCounter {
  /**
   * Get next order number in sequence
   * Returns format: ORD-2026-00001, ORD-2026-00002, etc.
   */
  static async getNextOrderNumber() {
    try {
      const db = getDB();
      const year = new Date().getFullYear();
      const counterKey = `order-${year}`;

      // Atomically increment counter
      const result = await db.collection('counters').findOneAndUpdate(
        { _id: counterKey },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: 'after' }
      );

      const sequence = result.value.sequence;
      const paddedSequence = String(sequence).padStart(5, '0');
      const orderNumber = `ORD-${year}-${paddedSequence}`;

      console.log(`📊 Generated order number: ${orderNumber}`);
      return orderNumber;
    } catch (error) {
      console.error('❌ Error generating order number:', error);
      // Fallback to timestamp-based number
      return `ORD-${Date.now()}`;
    }
  }

  /**
   * Get the current sequence number for year
   */
  static async getCurrentSequence() {
    try {
      const db = getDB();
      const year = new Date().getFullYear();
      const counterKey = `order-${year}`;

      const counter = await db.collection('counters').findOne({ _id: counterKey });
      return counter?.sequence || 0;
    } catch (error) {
      console.error('❌ Error getting current sequence:', error);
      return 0;
    }
  }

  /**
   * Reset counter for new year (optional, can be called on January 1st)
   */
  static async resetYearlyCounter() {
    try {
      const db = getDB();
      const year = new Date().getFullYear();
      const counterKey = `order-${year}`;

      await db.collection('counters').updateOne(
        { _id: counterKey },
        { $set: { sequence: 0 } },
        { upsert: true }
      );

      console.log(`🔄 Counter reset for year ${year}`);
      return true;
    } catch (error) {
      console.error('❌ Error resetting counter:', error);
      return false;
    }
  }
}
