#!/usr/bin/env node

/**
 * Final Setup: Clean Admin & Migrate Roles
 * Simple approach - all in didi_fashion database
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';

async function finalSetup() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         FINAL SETUP: Clean Admin & Migrate Roles           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await connectDB();
    const db = getDB();
    const users = db.collection('users');

    // Step 1: Remove test admin accounts
    console.log('1️⃣ Cleaning up test admin accounts...');
    const deleteResult = await users.deleteMany({
      $or: [
        { email: 'test-admin@hezalthelabel.com' },
        { email: 'admin.test+1767960713059@example.com' },
        { email: /admin\.test/ }  // Any email starting with admin.test
      ]
    });
    console.log('   ✅ Deleted:', deleteResult.deletedCount, 'test admin(s)');

    // Step 2: Set admin role
    console.log('\n2️⃣ Setting main admin user...');
    const adminUpdate = await users.updateOne(
      { email: 'admin@hezalthelabel.com' },
      { 
        $set: { 
          role: 'admin', 
          isAdmin: true,
          status: 'active'
        } 
      }
    );
    console.log('   ✅ Admin updated:', adminUpdate.modifiedCount ? 'YES' : 'NO');

    // Step 3: Fix all regular users
    console.log('\n3️⃣ Setting roles for all regular users...');
    const usersUpdate = await users.updateMany(
      { 
        email: { $ne: 'admin@hezalthelabel.com' }
      },
      { 
        $set: { 
          role: 'user', 
          isGuest: false 
        } 
      }
    );
    console.log('   ✅ Regular users updated:', usersUpdate.modifiedCount);

    // Step 4: Display final state
    console.log('\n4️⃣ Final Database State:');
    const allUsers = await users.find({}).toArray();
    
    console.log('\n   📋 All Users:');
    allUsers.forEach(u => {
      const type = u.role === 'admin' ? '👑' : '👤';
      console.log(`   ${type} ${u.email}`);
      console.log(`      Role: ${u.role}, isGuest: ${u.isGuest}`);
    });

    // Step 5: Verification
    console.log('\n5️⃣ Verification:');
    const adminCount = await users.countDocuments({ role: 'admin' });
    const customerCount = await users.countDocuments({ role: 'user', isGuest: false });
    
    console.log('   ✅ Admin users:', adminCount);
    console.log('   ✅ Customer users:', customerCount);
    console.log('   ✅ Total users:', allUsers.length);

    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('Your admin panel should now work with:');
    console.log('   Email: admin@hezalthelabel.com');
    console.log('   Password: Admin@123456\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

finalSetup();
