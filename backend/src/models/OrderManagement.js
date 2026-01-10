import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class OrderManagement {
  /**
   * Get all orders with filtering and pagination
   */
  static async getAllOrders(filters = {}, page = 1, limit = 20) {
    const db = getDB();
    const skip = (page - 1) * limit;

    const query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = new ObjectId(filters.userId);
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('orders').countDocuments(query);

    return {
      orders: orders.map(o => ({
        _id: o._id.toString(),
        ...o,
        _id: o._id.toString() // Override to ensure it's a string
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Update order status with timestamp
   */
  static async updateOrderStatus(orderId, status) {
    const db = getDB();

    console.log('📦 OrderManagement.updateOrderStatus called:', { orderId, status });

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(orderId)) {
      console.error('❌ Invalid ObjectId format:', orderId);
      throw new Error('Invalid order ID format');
    }

    // First check if order exists
    const existingOrder = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    console.log('🔍 Existing order:', existingOrder ? 'Found' : 'Not found');
    
    if (!existingOrder) {
      console.error('❌ Order not found in database:', orderId);
      return null;
    }

    // Build update object - only push to statusHistory if it's an array
    const updateObj = {
      $set: {
        status,
        updatedAt: new Date()
      }
    };

    // Initialize statusHistory if it doesn't exist
    if (existingOrder.statusHistory) {
      updateObj.$push = {
        statusHistory: {
          status,
          timestamp: new Date()
        }
      };
    } else {
      updateObj.$set.statusHistory = [{
        status,
        timestamp: new Date()
      }];
    }

    const updateResult = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      updateObj
    );

    console.log('✅ Update result:', updateResult.modifiedCount > 0 ? 'Success' : 'Failed', { modifiedCount: updateResult.modifiedCount });

    // Fetch and return the updated order
    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    return updatedOrder ? { id: updatedOrder._id.toString(), ...updatedOrder } : null;
  }

  /**
   * Add tracking information
   */
  static async updateTrackingInfo(orderId, trackingData) {
    const db = getDB();

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          'tracking.trackingNumber': trackingData.trackingNumber,
          'tracking.carrier': trackingData.carrier,
          'tracking.trackingUrl': trackingData.trackingUrl,
          'tracking.estimatedDelivery': trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery) : null,
          'tracking.lastUpdate': new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? { id: result._id.toString(), ...result } : null;
  }

  /**
   * Generate invoice for order
   */
  static async generateInvoice(orderId) {
    const db = getDB();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) return null;

    const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}-${new Date(order.createdAt).getTime()}`;

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          'invoice.invoiceNumber': invoiceNumber,
          'invoice.generatedAt': new Date(),
          'invoice.status': 'generated'
        }
      },
      { returnDocument: 'after' }
    );

    return {
      id: result._id.toString(),
      invoiceNumber,
      ...result
    };
  }

  /**
   * Add note to order
   */
  static async addOrderNote(orderId, note, noteType = 'general') {
    const db = getDB();

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $push: {
          notes: {
            content: note,
            type: noteType, // general, admin, customer
            createdAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result ? { id: result._id.toString(), ...result } : null;
  }

  /**
   * Cancel order with reason
   */
  static async cancelOrder(orderId, reason) {
    const db = getDB();

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: 'cancelled',
          'cancellation.reason': reason,
          'cancellation.cancelledAt': new Date(),
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'cancelled',
            timestamp: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );

    return result ? { id: result._id.toString(), ...result } : null;
  }

  /**
   * Process refund
   */
  static async processRefund(orderId, refundData) {
    const db = getDB();

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          'refund.amount': Number(refundData.amount),
          'refund.reason': refundData.reason,
          'refund.processedAt': new Date(),
          'refund.transactionId': refundData.transactionId || null,
          'refund.status': 'processed',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? { id: result._id.toString(), ...result } : null;
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(startDate, endDate) {
    const db = getDB();

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const total = await db.collection('orders').countDocuments(query);
    
    const statusCounts = await db.collection('orders').aggregate([
      { $match: query },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const revenueData = await db.collection('orders').aggregate([
      { $match: query },
      { $group: {
          _id: null,
          totalRevenue: { $sum: '$totals.grandTotal' },
          averageOrder: { $avg: '$totals.grandTotal' }
        }
      }
    ]).toArray();

    return {
      dateRange: { startDate, endDate },
      totalOrders: total,
      statuses: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      revenue: revenueData[0] || { totalRevenue: 0, averageOrder: 0 }
    };
  }

  /**
   * Update delivery address for pending orders
   */
  static async updateDeliveryAddress(orderId, newAddress) {
    const db = getDB();

    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) return null;
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new Error('Can only update address for pending or confirmed orders');
    }

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          'deliveryAddress.street': newAddress.street,
          'deliveryAddress.city': newAddress.city,
          'deliveryAddress.state': newAddress.state,
          'deliveryAddress.zip': newAddress.zip,
          'deliveryAddress.country': newAddress.country,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result ? { id: result._id.toString(), ...result } : null;
  }

  /**
   * Bulk update order status
   */
  static async bulkUpdateStatus(orderIds, status) {
    const db = getDB();

    const objectIds = orderIds.map(id => new ObjectId(id));

    const result = await db.collection('orders').updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          status,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date()
          }
        }
      }
    );

    return {
      modified: result.modifiedCount,
      matched: result.matchedCount
    };
  }

  /**
   * Delete order
   */
  static async deleteOrder(orderId) {
    const db = getDB();

    const result = await db.collection('orders').deleteOne(
      { _id: new ObjectId(orderId) }
    );

    return result.deletedCount > 0;
  }
}
