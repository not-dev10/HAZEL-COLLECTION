import 'dotenv/config.js';
import bcryptjs from 'bcryptjs';
import { connectDB, getDB } from '../src/config/mongodb.js';

async function createAdminUser() {
  try {
    await connectDB();
    const db = getDB();
    const users = db.collection('users');
    
    // Admin user details
    const adminEmail = 'admin@hezalthelabel.com';
    const adminPassword = 'Admin@123456';
    
    // Check if admin already exists
    const existingAdmin = await users.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      return;
    }
    
    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);
    
    // Create admin user
    const result = await users.insertOne({
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Admin',
      role: 'admin',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });
    
    if (result.insertedId) {
      console.log('✅ Admin user created successfully!');
      console.log('Admin Details:');
      console.log('  Email:', adminEmail);
      console.log('  Password:', adminPassword);
      console.log('  User ID:', result.insertedId);
      console.log('  Role:', 'admin');
      console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
      console.log('   You can change the password after first login.');
    } else {
      console.error('❌ Failed to create admin user');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run script
createAdminUser().then(() => {
  console.log('\n✅ Setup complete');
  process.exit(0);
});
