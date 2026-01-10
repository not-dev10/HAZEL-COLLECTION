import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb.js';

export class Order {
  static async create(orderData) {
    const db = getDB();
    const order = {
      userId: new ObjectId(orderData.userId),
      items: orderData.items,
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
    return { _id: result.insertedId, ...order };
  }

  static async findById(orderId) {
    const db = getDB();
    return await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
  }

  static async findByUserId(userId) {
    const db = getDB();
    return await db
      .collection('orders')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async updateStatus(orderId, status) {
    const db = getDB();
    return await db
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
  }

  static async getAllOrders() {
    const db = getDB();
    return await db
      .collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async deleteOrder(orderId) {
    const db = getDB();
    return await db.collection('orders').deleteOne({ _id: new ObjectId(orderId) });
  }
}
