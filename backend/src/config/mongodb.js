import { MongoClient, ServerApiVersion } from "mongodb";

let db = null;

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  maxPoolSize: 10,
  minPoolSize: 2,
  monitorCommands: false,
  retryWrites: true,
  // Add connection timeout for Render environment
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

export async function connectDB() {
  if (db) return db;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${maxRetries}...`);
      await client.connect();
      db = client.db("didi_fashion");
      console.log("✅ Connected to MongoDB Atlas");
      return db;
    } catch (error) {
      lastError = error;
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("❌ MongoDB connection failed after all retries");
  throw lastError;
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

export default { connectDB, getDB };
