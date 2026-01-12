#!/usr/bin/env node

/**
 * Migration: Add role field to users
 * Sets role: 'user' for regular customers
 * Sets role: 'admin' for admin users
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';

async function migrateRoles() {
  try {
    console.log('\n🔄 MIGRATING USER ROLES\n');
    console.log('Database: MongoDB Atlas - didi_fashion\n');

    await connectDB();
    const db = getDB();
    const users = db.collection('users');

    // Step 1: Fix admin user
    console.log('1️⃣ Setting admin user role...');
    const adminResult = await users.updateOne(
      { email: 'admin@hezalthelabel.com' },
      { $set: { role: 'admin', isAdmin: true, type: 'admin' } }
    );
    console.log('   ✅ Updated:', adminResult.modifiedCount, 'admin(s)');

    // Step 2: Fix regular users (all non-admin users)
    console.log('\n2️⃣ Setting regular user roles and isGuest flag...');
    const userResult = await users.updateMany(
      { 
        email: { $ne: 'admin@hezalthelabel.com' },
        role: { $exists: false }  // Only update if role doesn't exist
      },
      { $set: { role: 'user', isGuest: false } }
    );
    console.log('   ✅ Updated:', userResult.modifiedCount, 'user(s)');

    // Step 3: Verify changes
    console.log('\n3️⃣ Verifying changes...');
    const allUsers = await users.find({}).toArray();
    
    console.log('   Total users:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`   - ${u.email}`);
      console.log(`     Role: ${u.role || '❌ MISSING'} | isGuest: ${u.isGuest !== undefined ? u.isGuest : '❌ MISSING'}`);
    });

    console.log('\n✅ Migration complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

migrateRoles();
