#!/usr/bin/env node

/**
 * Setup Admin User in Admin Database
 */

import 'dotenv/config.js';
import { connectAdminDB, getAdminDB } from './src/config/adminDb.js';
import bcryptjs from 'bcryptjs';

async function setupAdmin() {
  try {
    console.log('\n🔧 SETTING UP ADMIN USER\n');

    await connectAdminDB();
    const db = getAdminDB();
    const admins = db.collection('admins');

    // Check if admin already exists
    console.log('1️⃣ Checking existing admins...');
    const existing = await admins.find({}).toArray();
    console.log('   Found:', existing.length, 'admin(s)');
    
    if (existing.length > 0) {
      existing.forEach(a => {
        console.log(`   - ${a.email} (${a.fullName})`);
      });
    }

    // Create/update main admin
    console.log('\n2️⃣ Setting up admin@hezalthelabel.com...');
    const adminEmail = 'admin@hezalthelabel.com';
    const adminPassword = 'Admin@123456';
    
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    const result = await admins.updateOne(
      { email: adminEmail },
      {
        $set: {
          email: adminEmail,
          password: hashedPassword,
          fullName: 'Admin',
          phone: '',
          role: 'admin',
          status: 'active',
          updatedAt: new Date()
        }
      },
      { upsert: true }  // Create if doesn't exist
    );

    if (result.upsertedId) {
      console.log('   ✅ Created new admin');
    } else if (result.modifiedCount > 0) {
      console.log('   ✅ Updated existing admin');
    } else {
      console.log('   ℹ️  Admin already up to date');
    }

    // Verify
    console.log('\n3️⃣ Verifying admin setup...');
    const admin = await admins.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('   ✅ Admin found:');
      console.log('   - ID:', admin._id);
      console.log('   - Email:', admin.email);
      console.log('   - Name:', admin.fullName);
      console.log('   - Role:', admin.role);
      console.log('   - Status:', admin.status);
    } else {
      console.log('   ❌ Admin not found after setup!');
    }

    console.log('\n✅ Admin setup complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
