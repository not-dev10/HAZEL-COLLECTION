#!/usr/bin/env node

/**
 * Comprehensive Customer Data Loading Debug Script
 * Tests the entire flow from login to customer fetch
 */

import 'dotenv/config.js';
import { connectDB, getDB } from './src/config/mongodb.js';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:5000';

async function debugCustomerLoad() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     CUSTOMER DATA LOADING - COMPREHENSIVE DEBUG            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Connect to database
    console.log('1️⃣ CONNECTING TO DATABASE...');
    await connectDB();
    const db = getDB();
    console.log('✅ Connected\n');

    // Step 2: Check admin user
    console.log('2️⃣ CHECKING ADMIN USER...');
    const admin = await db.collection('users').findOne({ 
      email: 'admin@hezalthelabel.com' 
    });
    
    if (!admin) {
      console.error('❌ Admin not found! Creating admin user...');
      const result = await db.collection('users').insertOne({
        email: 'admin@hezalthelabel.com',
        password: 'hashed_password_placeholder',
        fullName: 'Admin',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date(),
        status: 'active'
      });
      console.log('✅ Admin created with ID:', result.insertedId.toString());
    } else {
      console.log('✅ Admin found');
      console.log('   - ID:', admin._id);
      console.log('   - Role:', admin.role);
      console.log('   - IsAdmin:', admin.isAdmin);
    }
    console.log();

    // Step 3: Check customer data
    console.log('3️⃣ CHECKING CUSTOMER DATA IN DATABASE...');
    const allUsers = await db.collection('users').find({}).toArray();
    console.log('   Total users in database:', allUsers.length);
    
    const customers = await db.collection('users').find({ 
      isGuest: false, 
      role: 'user' 
    }).toArray();
    
    console.log('   Regular customers (role=user, isGuest=false):', customers.length);
    
    if (customers.length === 0) {
      console.log('   ⚠️  No customers found! Creating sample customer...');
      const sampleCustomer = await db.collection('users').insertOne({
        email: 'customer@example.com',
        password: 'hashed',
        fullName: 'Test Customer',
        phone: '123-456-7890',
        address: '123 Main St',
        city: 'London',
        country: 'United Kingdom',
        isGuest: false,
        role: 'user',
        status: 'active',
        totalOrders: 5,
        totalSpent: 250.00,
        loyalty: 'gold',
        createdAt: new Date(),
        lastLogin: new Date()
      });
      console.log('   ✅ Sample customer created');
    } else {
      console.log('   ✅ Customers exist');
      const sample = customers[0];
      console.log('   Sample customer:');
      console.log('     - Name:', sample.fullName);
      console.log('     - Email:', sample.email);
      console.log('     - Role:', sample.role);
      console.log('     - Status:', sample.status);
    }
    console.log();

    // Step 4: Test User.getAllCustomers method
    console.log('4️⃣ TESTING User.getAllCustomers() METHOD...');
    try {
      const { User } = await import('./src/models/User.js');
      const result = await User.getAllCustomers({ limit: 10, offset: 0 });
      console.log('✅ Method executed successfully');
      console.log('   - Returned data items:', result.data.length);
      console.log('   - Total in DB:', result.pagination.total);
      
      if (result.data.length > 0) {
        const sample = result.data[0];
        console.log('   Sample formatted customer:');
        console.log('     - ID:', sample.id);
        console.log('     - Name:', sample.name);
        console.log('     - Email:', sample.email);
        console.log('     - Status:', sample.status);
      }
    } catch (error) {
      console.error('❌ Error calling User.getAllCustomers():', error.message);
    }
    console.log();

    // Step 5: Test admin login
    console.log('5️⃣ TESTING ADMIN LOGIN...');
    try {
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@hezalthelabel.com',
          password: 'Admin@123456'
        })
      });

      console.log('   Response status:', loginResponse.status);
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.data?.token) {
        console.log('✅ Login successful');
        console.log('   - Token:', loginData.data.token.substring(0, 30) + '...');
        console.log('   - User role:', loginData.data.user?.role);
        
        // Step 6: Test /api/customers endpoint
        console.log('\n6️⃣ TESTING /api/customers ENDPOINT...');
        const token = loginData.data.token;
        
        const customersResponse = await fetch(`${API_URL}/api/customers?limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('   Response status:', customersResponse.status);
        const customersData = await customersResponse.json();
        
        if (customersResponse.ok) {
          console.log('✅ /api/customers endpoint working');
          console.log('   - Success:', customersData.success);
          console.log('   - Data items:', customersData.data?.length || 0);
          console.log('   - Total:', customersData.pagination?.total || 0);
          
          if (customersData.data?.length > 0) {
            const sample = customersData.data[0];
            console.log('   Sample customer from API:');
            console.log('     - ID:', sample.id);
            console.log('     - Name:', sample.name);
            console.log('     - Email:', sample.email);
            console.log('     - Status:', sample.status);
          }
        } else {
          console.error('❌ /api/customers endpoint failed');
          console.log('   Response:', customersData);
        }
      } else {
        console.error('❌ Login failed');
        console.log('   Response:', loginData);
      }
    } catch (error) {
      console.error('❌ Error during login test:', error.message);
      console.log('   Note: Backend server may not be running');
    }

    console.log('\n✅ DEBUG COMPLETE\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  }
}

debugCustomerLoad();
