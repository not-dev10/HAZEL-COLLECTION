import { getDB } from '../config/mongodb.js';
import { ObjectId } from 'mongodb';

export class OTP {
  static async create(email, orderNumber) {
    const db = getDB();
    
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const otpData = {
      code,
      email,
      orderNumber,
      createdAt: new Date(),
      expiresAt,
      isUsed: false,
    };

    const result = await db.collection('otps').insertOne(otpData);
    
    return {
      _id: result.insertedId,
      ...otpData,
    };
  }

  static async findValid(email, orderNumber, code) {
    const db = getDB();
    
    const otp = await db.collection('otps').findOne({
      email,
      orderNumber,
      code,
      expiresAt: { $gt: new Date() },
      isUsed: false,
    });

    return otp;
  }

  static async markAsUsed(otpId) {
    const db = getDB();
    
    return await db.collection('otps').updateOne(
      { _id: new ObjectId(otpId) },
      { $set: { isUsed: true } }
    );
  }

  static async cleanupExpired() {
    const db = getDB();
    
    return await db.collection('otps').deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}
