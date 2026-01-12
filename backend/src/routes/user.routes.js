import express from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/user/profile
 * Get current user's profile information
 * Requires authentication
 */
router.get("/profile", requireAuth, async (req, res) => {
  try {
    console.log('👤 Profile request - User:', req.user);
    
    // JWT token has 'id' field (as string), convert to ObjectId
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: User.formatCustomerResponse(user)
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile information
 * Requires authentication
 * Allowed fields: fullName, phone, gender, address, city, country, preferredCategory, status
 */
router.put("/profile", requireAuth, async (req, res) => {
  try {
    console.log('📝 Update profile request - User:', req.user);
    console.log('📦 Update payload:', req.body);
    
    // JWT token has 'id' field (as string), convert to ObjectId
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    const updates = req.body;

    // Validate that user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update profile with allowed fields
    const updated = await User.updateProfile(userId, updates);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No changes made or invalid update"
      });
    }

    // Get updated user
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: User.formatCustomerResponse(updatedUser)
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/user/profile
 * Permanently delete user account from database
 * Requires authentication and password verification
 */
router.delete("/profile", requireAuth, async (req, res) => {
  try {
    console.log('🗑️ Delete account request - User:', req.user);
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password required for account deletion"
      });
    }

    // JWT token has 'id' field (as string)
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify password before deletion
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log('❌ Invalid password for account deletion:', req.user.email);
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Delete user from database
    const deleted = await User.deleteAccount(userId);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete account"
      });
    }

    console.log('✅ Account deleted successfully:', req.user.email);
    res.json({
      success: true,
      message: "Account permanently deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/user/stats
 * Get user's order and purchase statistics
 * Requires authentication
 */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: {
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0,
        loyaltyTier: user.loyalty || "bronze",
        lastPurchaseDate: user.lastPurchaseDate || null,
        preferredCategory: user.preferredCategory || "All"
      }
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
