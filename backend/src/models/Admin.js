import { getAdminDB } from "../config/adminDb.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export class Admin {
  static async create({ email, password, fullName, phone = "" }) {
    const db = getAdminDB();
    const admins = db.collection("admins");

    // Check if admin exists
    const existing = await admins.findOne({ email });
    if (existing) {
      throw new Error("Admin email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await admins.insertOne({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    });

    return {
      id: result.insertedId.toString(),
      email,
      fullName
    };
  }

  static async findByEmail(email) {
    const db = getAdminDB();
    const admins = db.collection("admins");
    return await admins.findOne({ email });
  }

  static async findById(adminId) {
    const db = getAdminDB();
    const admins = db.collection("admins");
    return await admins.findOne({ _id: new ObjectId(adminId) });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(adminId) {
    const db = getAdminDB();
    const admins = db.collection("admins");
    
    await admins.updateOne(
      { _id: new ObjectId(adminId) },
      { $set: { lastLogin: new Date() } }
    );
  }

  static formatAdminResponse(admin) {
    if (!admin) return null;
    
    return {
      id: admin._id.toString(),
      email: admin.email,
      fullName: admin.fullName,
      phone: admin.phone || '',
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt
    };
  }
}
