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

export default router;
