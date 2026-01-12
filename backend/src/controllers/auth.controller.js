import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, gender } = req.body;

    if (!email || !password || !fullName || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, password, fullName, dateOfBirth, gender"
      });
    }

    // Create user in MongoDB
    const user = await User.create({ email, password, fullName, phone, dateOfBirth, gender });

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
      token
    });
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Signup failed"
    });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ User found:", email);

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ Password verified");

    // Issue JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✓ Token issued");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Login failed"
    });
  }
};

/**
 * POST /api/auth/admin-login
 */
export const adminLogin = async (req, res) => {
  try {
    console.log("🔐 Admin login attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ User found:", email);

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ Password verified");

    // Issue JWT for admin
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: 'admin', type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✓ Token issued");

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName
      },
      token
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Login failed"
    });
  }
};