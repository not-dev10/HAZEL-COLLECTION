import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class Order {
  // Helper method to normalize order data with virtual orderNumber
  static normalizeOrder(order) {
    if (!order) return null;
    if (!order.orderNumber) {
      order.orderNumber = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
    }
    return order;
  }
  static async create(orderData) {
    const db = getDB();
    
    const order = {
      userId: new ObjectId(orderData.userId),
      items: orderData.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
        // Variant information
        variantId: item.variantId || null,
        color: item.color || null,
        size: item.size || null
      })),
      personalInfo: {
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        email: orderData.email,
        phone: orderData.phone,
      },
      billingAddress: {
        street: orderData.billingStreet,
        city: orderData.billingCity,
        state: orderData.billingState,
        zip: orderData.billingZip,
        country: orderData.billingCountry,
      },
      deliveryAddress: {
        street: orderData.deliveryStreet,
        city: orderData.deliveryCity,
        state: orderData.deliveryState,
        zip: orderData.deliveryZip,
        country: orderData.deliveryCountry,
        sameAsDelivery: orderData.sameAsDelivery,
      },
      paymentMethod: orderData.paymentMethod,
      totals: {
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        grandTotal: orderData.grandTotal,
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(order);
    const createdOrder = { _id: result.insertedId, ...order };
    
    // Add virtual orderNumber property
    return this.normalizeOrder(createdOrder);
  }

  static async findById(orderId) {
    const db = getDB();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    return this.normalizeOrder(order);
  }

  static async findOne(filter) {
    const db = getDB();
    const order = await db.collection('orders').findOne(filter);
    return this.normalizeOrder(order);
  }

  static async findByUserId(userId) {
    const db = getDB();
    const orders = await db
      .collection('orders')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    return orders.map(order => this.normalizeOrder(order));
  }

  static async updateStatus(orderId, status) {
    const db = getDB();
    const result = await db
      .collection('orders')
      .findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );
    return this.normalizeOrder(result.value);
  }

  static async getAllOrders() {
    const db = getDB();
    const orders = await db
      .collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return orders.map(order => this.normalizeOrder(order));
  }

  static async deleteOrder(orderId) {
    const db = getDB();
    return await db.collection('orders').deleteOne({ _id: new ObjectId(orderId) });
  }
}
