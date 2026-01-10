import "dotenv/config.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    const db = client.db("didi_fashion");
    const users = db.collection("users");

    const email = "admin@hezalthelabel.com";
    const password = "Admin@123456";
    const fullName = "Admin";

    // Check if admin exists
    const existing = await users.findOne({ email });
    if (existing) {
      console.log("✓ Admin user already exists");
      await client.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      fullName,
      phone: "",
      createdAt: new Date()
    });

    console.log("✓ Admin user created successfully");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  ID: ${result.insertedId}`);
    
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
