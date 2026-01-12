#!/usr/bin/env node

/**
 * Fix Admin User - Add Missing Fields
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';
import { ObjectId } from 'mongodb';

async function fixAdminUser() {
  try {
    console.log('\n🔧 FIXING ADMIN USER FIELDS\n');
    console.log('Database: MongoDB Atlas - didi_fashion\n');

    await connectDB();
    const db = getDB();
    const users = db.collection('users');

    // Find admin user
    console.log('1️⃣ Finding admin user...');
    const admin = await users.findOne({ email: 'admin@hezalthelabel.com' });
    
    if (!admin) {
      console.error('❌ Admin not found!');
      return;
    }
    
    console.log('✅ Admin found:', admin._id);

    // Update admin with missing fields
    console.log('\n2️⃣ Updating admin fields...');
    const result = await users.updateOne(
      { _id: admin._id },
      {
        $set: {
          role: 'admin',
          isAdmin: true,
          type: 'admin'
        }
      }
    );

    console.log('✅ Updated:', result.modifiedCount, 'document(s)');

    // Verify update
    console.log('\n3️⃣ Verifying update...');
    const updated = await users.findOne({ email: 'admin@hezalthelabel.com' });
    console.log('   - Role:', updated.role);
    console.log('   - IsAdmin:', updated.isAdmin);
    console.log('   - Type:', updated.type);

    console.log('\n✅ Done - Admin user fixed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

fixAdminUser();
