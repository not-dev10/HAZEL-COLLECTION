import { MongoClient, ServerApiVersion } from "mongodb";

let db = null;

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  // Disable SSL verification for development (not recommended for production)
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  maxPoolSize: 10,
  minPoolSize: 2,
  monitorCommands: false,
  retryWrites: true,
});

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db("didi_fashion");
    console.log("✅ Connected to MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

export default { connectDB, getDB };
