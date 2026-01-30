import express from "express";
import { signup, login, adminLogin, forgotPassword, resetPassword, requestSignupOTP, verifySignupOTP } from "../controllers/auth.controller.js";
import { User } from "../models/User.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Test endpoint (no Supabase needed)
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Auth API is running" });
});

// 🔒 RATE LIMITED ROUTES - Prevent brute force attacks (5 attempts per 15 min)
// Registration with OTP verification
router.post("/register/request-otp", authLimiter, requestSignupOTP);
router.post("/register/verify-otp", authLimiter, verifySignupOTP);

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/admin-login", authLimiter, adminLogin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 * Used by frontend to silently refresh expired tokens
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    // Verify refresh token
    const jwt = await import("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new access token (15 minutes)
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token"
    });
  }
});

export default router;
