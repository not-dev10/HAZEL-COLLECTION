import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';

// ⚡ COST OPTIMIZATION: Extended cleanup interval from 1 hour to 6 hours
// This reduces unnecessary database write operations. TTL indexes in MongoDB
// will automatically expire data, so cleanup is just a safety measure.
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

let cleanupInterval = null;

export const startGuestCleanupScheduler = () => {
  console.log('🔄 Starting guest data cleanup scheduler...');
  
  // Run cleanup immediately on startup
  runCleanup();
  
  // Then run periodically every hour
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL);
  
  console.log('✅ Guest cleanup scheduler started (runs every hour)');
};

export const stopGuestCleanupScheduler = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('⏹️ Guest cleanup scheduler stopped');
  }
};

const runCleanup = async () => {
  console.log('\n📋 Running guest data cleanup...');
  const startTime = Date.now();
  
  try {
    // Clean up expired guest carts
    const cartResult = await Cart.cleanupExpiredGuestCarts();
    
    // Clean up expired guest wishlists
    const wishlistResult = await Wishlist.cleanupExpiredGuestWishlists();
    
    const totalDeleted = (cartResult.deletedCount || 0) + (wishlistResult.deletedCount || 0);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Cleanup completed in ${duration}ms - Deleted ${totalDeleted} expired guest item(s)\n`);
  } catch (error) {
    console.error('❌ Error during guest data cleanup:', error);
  }
};

// Manual cleanup function (can be called from admin endpoints)
export const manualCleanup = async () => {
  console.log('🧹 Manual cleanup triggered...');
  await runCleanup();
};
