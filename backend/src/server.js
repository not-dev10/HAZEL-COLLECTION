import "dotenv/config.js";
import app from "./app.js";
import { connectDB } from "./config/mongodb.js";
import { Cart } from "./models/Cart.js";
import { Wishlist } from "./models/Wishlist.js";
import Review from "./models/Review.js";
import { startGuestCleanupScheduler } from "./services/guestCleanup.service.js";
import { initializePort, logServerStartup } from "./utils/portDetection.js";

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize TTL indexes for guest data auto-deletion
    console.log('\n🔧 Initializing TTL indexes...');
    await Cart.createTTLIndex();
    await Wishlist.createTTLIndex();
    await Review.createTTLIndex();
    
    // Start guest data cleanup scheduler
    startGuestCleanupScheduler();
    
    // Find available port dynamically
    const PORT = await initializePort();
    
    app.listen(PORT, () => {
      // Log server startup information
      logServerStartup(PORT);
      
      // Show available endpoints
      console.log(`📋 Available endpoints:`);
      console.log(`   GET  /api/products`);
      console.log(`   GET  /api/products/:id`);
      console.log(`   POST /api/products`);
      console.log(`   PUT  /api/products/:id`);
      console.log(`   DELETE /api/products/:id`);
      console.log(`   POST /api/auth/signup`);
      console.log(`   POST /api/auth/admin-login`);
      console.log(`   GET  /api/cart`);
      console.log(`   POST /api/cart/add`);
      console.log(`   GET  /api/wishlist`);
      console.log(`   POST /api/wishlist/add`);
      console.log(`   DELETE /api/wishlist/remove/:itemId`);
      console.log(`   DELETE /api/wishlist/clear`);
      console.log(`   GET  /api/orders`);
      console.log(`   POST /api/orders`);
      console.log(`   GET  /api/customers (admin)`);
      console.log(`   GET  /api/customers/stats (admin)`);
      console.log(`   POST /api/customers/seed (test data)`);
      console.log(`\n🌐 CORS: Accepts all localhost origins`);
      console.log(`\n👤 Guest Authentication:`);
      console.log(`   - Send: Authorization: Guest <sessionId>`);
      console.log(`   - Or: X-Session-ID: <sessionId>`);
      console.log(`   - Guest data auto-expires after 6 hours`);
      console.log(`   - Cleanup job runs every 1 hour\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
