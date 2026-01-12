#!/usr/bin/env node

/**
 * Simple Database Check - No External Dependencies
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';

async function checkDatabase() {
  try {
    console.log('\n📊 CHECKING CUSTOMER DATA IN DATABASE\n');

    await connectDB();
    const db = getDB();

    // Display connection info
    console.log('Connected to: MongoDB Atlas - didi_fashion database\n');

    // Check admin
    console.log('1️⃣ Admin user:');
    const admin = await db.collection('users').findOne({ 
      email: 'admin@hezalthelabel.com' 
    });
    
    if (admin) {
      console.log('   ✅ Found');
      console.log('   - Role:', admin.role);
      console.log('   - IsAdmin:', admin.isAdmin);
    } else {
      console.log('   ❌ Not found');
    }

    // Check all users
    console.log('\n2️⃣ All users in database:');
    const allUsers = await db.collection('users').find({}).toArray();
    console.log('   Total:', allUsers.length);
    
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (role: ${u.role}, guest: ${u.isGuest})`);
    });

    // Check customers
    console.log('\n3️⃣ Customers (role=user, isGuest=false):');
    const customers = await db.collection('users').find({ 
      isGuest: false, 
      role: 'user' 
    }).toArray();
    
    console.log('   Total:', customers.length);
    
    if (customers.length > 0) {
      customers.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.fullName} (${c.email})`);
      });
    }

    // Check guest users
    console.log('\n4️⃣ Guest users:');
    const guests = await db.collection('users').find({ 
      isGuest: true 
    }).toArray();
    
    console.log('   Total:', guests.length);

    console.log('\n✅ Done\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkDatabase();
