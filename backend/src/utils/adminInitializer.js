/**
 * Admin User Initialization Utility
 * Automatically creates admin user on first startup if not exists
 * Uses environment variables for credentials
 */

import bcrypt from 'bcryptjs';
import { getDB } from '../config/mongodb.js';

/**
 * Initialize admin user on first startup
 * Creates admin if none exists, skips if already exists (idempotent)
 */
export async function initializeAdminUser() {
  try {
    const db = getDB();
    const users = db.collection('users');

    // Check if any admin user exists
    const adminExists = await users.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin user already exists');
      return { created: false, message: 'Admin already exists' };
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate credentials are provided
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not configured in .env');
      console.warn('   Admin user will not be created automatically.');
      console.warn('   To create admin manually, run: node scripts/create-admin.js');
      return { created: false, message: 'Admin credentials not configured' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.error('❌ Invalid ADMIN_EMAIL format:', adminEmail);
      return { created: false, message: 'Invalid email format' };
    }

    // Validate password strength (at least 8 characters)
    if (adminPassword.length < 8) {
      console.warn('⚠️  ADMIN_PASSWORD should be at least 8 characters for security');
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user document
    const result = await users.insertOne({
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Administrator',
      phone: '',
      dateOfBirth: null,
      gender: '',
      address: '',
      city: '',
      country: 'United Kingdom',
      isGuest: false,
      totalOrders: 0,
      totalSpent: 0,
      preferredCategory: '',
      loyalty: 'bronze',
      role: 'admin',
      isAdmin: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    });

    if (result.insertedId) {
      console.log('\n🎉 Admin user created automatically on first startup!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Admin Email:', adminEmail);
      console.log('🔐 Admin Password: (set in ADMIN_PASSWORD env variable)');
      console.log('👤 User ID:', result.insertedId.toString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Change admin password after first login!');
      console.log('   Navigate to admin settings and update password.\n');

      return {
        created: true,
        message: 'Admin user created successfully',
        adminId: result.insertedId.toString(),
        adminEmail: adminEmail
      };
    } else {
      console.error('❌ Failed to create admin user');
      return { created: false, message: 'Failed to insert admin user' };
    }
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
    // Don't throw - allow app to continue even if admin creation fails
    return { created: false, message: error.message };
  }
}

/**
 * Validate admin initialization
 * Checks if admin user exists and is properly configured
 */
export async function validateAdminSetup() {
  try {
    const db = getDB();
    const users = db.collection('users');

    const admin = await users.findOne({ role: 'admin' });

    if (!admin) {
      return {
        valid: false,
        message: 'No admin user found in database'
      };
    }

    return {
      valid: true,
      message: 'Admin user is properly configured',
      adminEmail: admin.email,
      adminId: admin._id.toString()
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Error validating admin setup: ' + error.message
    };
  }
}
