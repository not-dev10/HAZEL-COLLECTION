import "dotenv/config.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcryptjs";

async function resetAdmin() {
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

    // Delete existing admin
    const deleteResult = await users.deleteOne({ email });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing user(s)`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      fullName: "Admin",
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
    console.error("Error:", err);
    process.exit(1);
  }
}

resetAdmin();
