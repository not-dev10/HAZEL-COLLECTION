import { getDB } from "../config/mongodb.js";
import bcrypt from "bcryptjs";

export class User {
  static async create({ email, password, fullName, phone }) {
    const db = getDB();
    const users = db.collection("users");

    // Check if user exists
    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      fullName,
      phone,
      createdAt: new Date()
    });

    return {
      id: result.insertedId.toString(),
      email,
      fullName,
      phone
    };
  }

  static async findByEmail(email) {
    const db = getDB();
    const users = db.collection("users");
    return await users.findOne({ email });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
