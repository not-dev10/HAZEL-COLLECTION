import express from "express";
import { signup, login, adminLogin } from "../controllers/auth.controller.js";
import { User } from "../models/User.js";

const router = express.Router();

// Test endpoint (no Supabase needed)
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Auth API is running" });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);

export default router;
