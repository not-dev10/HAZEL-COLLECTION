#!/usr/bin/env node

/**
 * Check Existing Admin Collection
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';

async function checkAdminCollection() {
  try {
    console.log('\n📊 CHECKING EXISTING ADMIN COLLECTION\n');

    await connectDB();
    const db = getDB();

    // List all collections
    console.log('1️⃣ Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(c => {
      console.log('   -', c.name);
    });

    // Check admin collection
    console.log('\n2️⃣ Admin collection data:');
    const admins = await db.collection('admins').find({}).toArray();
    console.log('   Total admins:', admins.length);
    
    if (admins.length > 0) {
      admins.forEach((admin, i) => {
        console.log(`\n   Admin ${i + 1}:`);
        console.log('   - ID:', admin._id);
        console.log('   - Email:', admin.email);
        console.log('   - Name:', admin.name || admin.fullName);
        console.log('   - Role:', admin.role);
        console.log('   - Status:', admin.status);
        console.log('   - Created:', admin.createdAt);
      });
    } else {
      console.log('   ❌ No admins found in admin collection');
    }

    // Check users collection for comparison
    console.log('\n3️⃣ Users collection (for comparison):');
    const users = await db.collection('users').find({}).toArray();
    console.log('   Total users:', users.length);
    
    const adminsInUsers = users.filter(u => u.role === 'admin' || u.isAdmin);
    console.log('   Admins in users collection:', adminsInUsers.length);
    
    if (adminsInUsers.length > 0) {
      adminsInUsers.forEach(admin => {
        console.log('   -', admin.email, '(role:', admin.role, ')');
      });
    }

    console.log('\n✅ Done\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkAdminCollection();
