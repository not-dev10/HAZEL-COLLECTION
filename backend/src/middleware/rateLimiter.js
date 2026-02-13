import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Comprehensive Rate Limiting Configuration
 * Protects all endpoints from abuse
 * 
 * ⚠️ DEVELOPMENT MODE: Rate limiting is DISABLED
 * Set RATE_LIMITER_ENABLED=true in .env to re-enable
 */

// 🔧 Rate Limiter Toggle - Set to false to disable all rate limiting
const RATE_LIMITER_ENABLED = process.env.RATE_LIMITER_ENABLED === 'true';

// No-op middleware for when rate limiting is disabled
const noOpLimiter = (req, res, next) => next();

// ============ AUTH ROUTES (Already Configured) ============
export const authLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ READ APIs (GET requests) ============
export const readLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health checks
    return req.path === '/api/health/ping';
  }
}) : noOpLimiter;

// ============ WRITE APIs (POST/PUT/DELETE) ============
export const writeLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 write operations per IP
  message: 'Too many write operations. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ ORDER/PAYMENT ROUTES (Critical) ============
export const orderLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 orders per IP per 10 minutes
  message: 'Too many order attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ REVIEW ROUTES ============
export const reviewLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: 'Too many review submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ CART/WISHLIST ROUTES ============
export const cartWishlistLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 operations per minute
  message: 'Too many cart operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ SEARCH ROUTES ============
export const searchLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ FILE UPLOAD ROUTES ============
export const uploadLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

// ============ ADMIN ROUTES (Strict) ============
export const adminLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 admin operations per 15 minutes
  message: 'Too many admin operations. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID + IP for admin routes (IPv6 safe)
    const ipKey = ipKeyGenerator(req);
    return `${req.user?.id || 'anonymous'}-${ipKey}`;
  }
}) : noOpLimiter;

// ============ GENERAL API LIMITER ============
export const generalLimiter = RATE_LIMITER_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}) : noOpLimiter;

/**
 * Apply appropriate rate limiter based on route type
 * @param {string} type - Route type (read, write, order, etc.)
 * @returns {Function} - Rate limiter middleware
 */
export function getRateLimiter(type) {
  const limiters = {
    auth: authLimiter,
    read: readLimiter,
    write: writeLimiter,
    order: orderLimiter,
    review: reviewLimiter,
    cart: cartWishlistLimiter,
    wishlist: cartWishlistLimiter,
    search: searchLimiter,
    upload: uploadLimiter,
    admin: adminLimiter,
    general: generalLimiter
  };
  
  return limiters[type] || generalLimiter;
}
// 📊 Log rate limiting status on startup
if (typeof window === 'undefined') {
  // Only log in Node.js environment
  if (RATE_LIMITER_ENABLED) {
    console.log('✅ Rate limiting: ENABLED');
  } else {
    console.log('⚠️  Rate limiting: DISABLED (Set RATE_LIMITER_ENABLED=true in .env to enable)');
  }
}