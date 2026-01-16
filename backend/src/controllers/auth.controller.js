import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { validatePassword } from "../utils/passwordValidator.js";

/**
 * POST /api/auth/signup
 * Create account after OTP verification
 */
export const signup = async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, gender, tempToken } = req.body;

    // Verify tempToken (from OTP verification)
    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Email verification required. Please verify your email first."
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded.verified || decoded.purpose !== 'signup' || decoded.email !== email) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired verification. Please verify your email again."
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    if (!email || !password || !fullName || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, password, fullName, dateOfBirth, gender"
      });
    }

    // 🔒 Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors
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

    // Send welcome email
    try {
      const { mailService } = await import('../utils/mailService.js');
      await mailService.sendWelcomeEmail(email, fullName || 'User');
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.warn('⚠️ Welcome email failed (non-critical):', emailError.message);
      // Don't fail signup if email fails
    }

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
    console.log("🔐 Login attempt");
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
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ User found");

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password");
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
    console.log("🔐 Admin login attempt");
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
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ User found");

    // Verify password
    const validPassword = await User.verifyPassword(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log("✓ Password verified");

    // Check if user is actually an admin
    if (user.role !== 'admin' && user.type !== 'admin') {
      console.log("❌ User is not an admin");
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    console.log("✓ Admin role verified");

    // Issue JWT for admin
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'admin', type: 'admin' },
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
        fullName: user.fullName,
        role: user.role
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

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent"
      });
    }

    // Generate reset token and save to database
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const hashedToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    
    // Store reset token in database (implement resetTokenDB)
    const { ResetToken } = await import('../models/ResetToken.js');
    await ResetToken.create(resetToken, user._id.toString(), email);

    // Send password reset email
    const { mailService } = await import('../utils/mailService.js');
    const emailSent = await mailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.fullName || 'User'
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully"
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: err.message
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required"
      });
    }

    // 🔒 Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors
      });
    }

    // Verify reset token
    const { ResetToken } = await import('../models/ResetToken.js');
    const resetTokenRecord = await ResetToken.findByToken(token);

    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Find user and update password
    const user = await User.findById(resetTokenRecord.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete reset token
    await ResetToken.deleteByToken(token);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: err.message
    });
  }
};

/**
 * POST /api/auth/register/request-otp
 * Request OTP for email verification during signup
 */
export const requestSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if email already registered
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Generate and save OTP
    const { OTP } = await import('../models/OTP.js');
    const otpRecord = await OTP.create(email, `signup-${email}`);

    // Send OTP via email
    const { mailService } = await import('../utils/mailService.js');
    const emailSent = await mailService.sendOTPEmail(email, otpRecord.code, 'Account Registration');

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Valid for 10 minutes.",
      otpId: otpRecord._id
    });
  } catch (error) {
    console.error("Error requesting signup OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request OTP",
      error: error.message
    });
  }
};

/**
 * POST /api/auth/register/verify-otp
 * Verify OTP and get temporary registration token
 */
export const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Verify OTP
    const { OTP } = await import('../models/OTP.js');
    const otpRecord = await OTP.findValid(email, `signup-${email}`, otp);

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new code."
      });
    }

    // Mark OTP as used
    await OTP.markAsUsed(otpRecord._id);

    // Generate temporary registration token (valid for 30 minutes)
    const tempToken = jwt.sign(
      { email, verified: true, purpose: 'signup' },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now create your account.",
      tempToken,
      email
    });
  } catch (error) {
    console.error("Error verifying signup OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message
    });
  }
};