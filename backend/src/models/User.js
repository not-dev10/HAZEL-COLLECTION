import { getDB } from "../config/mongodb.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export class User {
  static async create({ email, password, fullName, phone, dateOfBirth, gender }) {
    const db = getDB();
    const users = db.collection("users");

    // Check if user exists
    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with customer fields
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      fullName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || '',
      address: '',
      city: '',
      country: 'United Kingdom',
      isGuest: false,
      totalOrders: 0,
      totalSpent: 0,
      preferredCategory: '',
      loyalty: 'bronze',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return {
      id: result.insertedId.toString(),
      email,
      fullName,
      phone,
      dateOfBirth,
      gender
    };
  }

  static async findByEmail(email) {
    const db = getDB();
    const users = db.collection("users");
    return await users.findOne({ email });
  }

  static async findById(userId) {
    const db = getDB();
    const users = db.collection("users");
    return await users.findOne({ _id: new ObjectId(userId) });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all customers (non-guest users)
   */
  static async getAllCustomers({ limit = 10, offset = 0, status = null, search = null } = {}) {
    const db = getDB();
    const users = db.collection("users");

    // Build filter
    const filter = { isGuest: false, role: 'user' };
    
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count
    const total = await users.countDocuments(filter);

    // Get paginated results
    const results = await users
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return {
      data: results.map(user => this.formatCustomerResponse(user)),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    const db = getDB();
    const users = db.collection("users");

    const allowedUpdates = ['fullName', 'phone', 'gender', 'address', 'city', 'country', 'preferredCategory', 'status', 'loyalty'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...filteredUpdates,
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Delete user account permanently from database
   */
  static async deleteAccount(userId) {
    const db = getDB();
    const users = db.collection("users");

    const result = await users.deleteOne(
      { _id: new ObjectId(userId) }
    );

    return result.deletedCount > 0;
  }

  /**
   * Update order stats
   */
  static async updateOrderStats(userId, orderAmount) {
    const db = getDB();
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          totalOrders: 1,
          totalSpent: orderAmount
        },
        $set: {
          lastPurchaseDate: new Date(),
          lastLogin: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats() {
    const db = getDB();
    const users = db.collection("users");

    const stats = await users.aggregate([
      { $match: { isGuest: false, role: 'user' } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          totalRevenue: { $sum: "$totalSpent" },
          averageOrderValue: { $avg: { $divide: ["$totalSpent", { $max: ["$totalOrders", 1] }] } }
        }
      }
    ]).toArray();

    return stats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };
  }

  /**
   * Format customer response
   */
  static formatCustomerResponse(user) {
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      name: user.fullName || '',
      email: user.email,
      phone: user.phone || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || 'United Kingdom',
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      status: user.status || 'active',
      joinDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : '',
      lastPurchase: user.lastPurchaseDate ? user.lastPurchaseDate.toISOString().split('T')[0] : '',
      accountCreated: user.createdAt ? user.createdAt.toISOString().split('T')[0] : '',
      lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '',
      preferredCategory: user.preferredCategory || '',
      loyalty: user.loyalty || 'bronze'
    };
  }
}
