import { getDB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export class Customer {
  /**
   * Get all customers with pagination and filtering
   */
  static async getAllCustomers({ limit = 10, offset = 0, status = null, search = null } = {}) {
    const db = getDB();
    const customers = db.collection("customers");

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count
    const total = await customers.countDocuments(filter);

    // Get paginated results
    const results = await customers
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return {
      data: results.map(customer => ({
        id: customer._id.toString(),
        name: customer.name || customer.fullName || '',
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || 'United Kingdom',
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0,
        status: customer.status || 'active',
        joinDate: customer.createdAt ? customer.createdAt.toISOString().split('T')[0] : '',
        lastPurchase: customer.lastPurchaseDate ? customer.lastPurchaseDate.toISOString().split('T')[0] : '',
        accountCreated: customer.createdAt ? customer.createdAt.toISOString().split('T')[0] : '',
        lastLogin: customer.lastLogin ? customer.lastLogin.toISOString().split('T')[0] : '',
        preferredCategory: customer.preferredCategory || 'All',
        loyalty: customer.loyalty || 'bronze'
      })),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single customer details
   */
  static async getCustomerById(customerId) {
    const db = getDB();
    const customers = db.collection("customers");

    const customer = await customers.findOne({ _id: new ObjectId(customerId) });

    if (!customer) {
      return null;
    }

    return {
      id: customer._id.toString(),
      name: customer.name || customer.fullName || '',
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || 'United Kingdom',
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      status: customer.status || 'active',
      joinDate: customer.createdAt ? customer.createdAt.toISOString().split('T')[0] : '',
      lastPurchase: customer.lastPurchaseDate ? customer.lastPurchaseDate.toISOString().split('T')[0] : '',
      accountCreated: customer.createdAt ? customer.createdAt.toISOString().split('T')[0] : '',
      lastLogin: customer.lastLogin ? customer.lastLogin.toISOString().split('T')[0] : '',
      preferredCategory: customer.preferredCategory || 'All',
      loyalty: customer.loyalty || 'bronze'
    };
  }

  /**
   * Create or update customer from user signup
   */
  static async createFromUser(userId, { email, fullName, phone }) {
    const db = getDB();
    const customers = db.collection("customers");

    // Check if customer exists
    const existing = await customers.findOne({ email });

    if (existing) {
      return {
        id: existing._id.toString(),
        email: existing.email,
        name: existing.name || existing.fullName || ''
      };
    }

    // Create new customer
    const result = await customers.insertOne({
      userId: new ObjectId(userId),
      email,
      name: fullName,
      fullName,
      phone,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      loyalty: 'bronze',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return {
      id: result.insertedId.toString(),
      email,
      name: fullName
    };
  }

  /**
   * Update customer order stats
   */
  static async updateOrderStats(customerId, orderAmount) {
    const db = getDB();
    const customers = db.collection("customers");

    const result = await customers.updateOne(
      { _id: new ObjectId(customerId) },
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
   * Update customer info
   */
  static async updateCustomer(customerId, updates) {
    const db = getDB();
    const customers = db.collection("customers");

    const result = await customers.updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
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
    const customers = db.collection("customers");

    const stats = await customers.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          totalRevenue: { $sum: "$totalSpent" },
          averageOrderValue: { $avg: { $divide: ["$totalSpent", "$totalOrders"] } }
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
}
