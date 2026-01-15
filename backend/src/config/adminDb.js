import { MongoClient, ServerApiVersion } from "mongodb";

let adminDb = null;
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  tls: true,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
});

export async function connectAdminDB() {
  if (adminDb) return adminDb;

  try {
    await client.connect();
    adminDb = client.db("admin");
    console.log("✅ Connected to Admin Database");
    return adminDb;
  } catch (error) {
    console.error("❌ Admin DB connection failed:", error);
    throw error;
  }
}

export function getAdminDB() {
  if (!adminDb) {
    throw new Error("Admin database not connected. Call connectAdminDB() first.");
  }
  return adminDb;
}

export default { connectAdminDB, getAdminDB };
