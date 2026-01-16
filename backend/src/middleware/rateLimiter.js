import rateLimit from 'express-rate-limit';

/**
 * Comprehensive Rate Limiting Configuration
 * Protects all endpoints from abuse
 */

// ============ AUTH ROUTES (Already Configured) ============
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ READ APIs (GET requests) ============
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health checks
    return req.path === '/api/health/ping';
  }
});

// ============ WRITE APIs (POST/PUT/DELETE) ============
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 write operations per IP
  message: 'Too many write operations. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ ORDER/PAYMENT ROUTES (Critical) ============
export const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 orders per IP per 10 minutes
  message: 'Too many order attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ REVIEW ROUTES ============
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: 'Too many review submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ CART/WISHLIST ROUTES ============
export const cartWishlistLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 operations per minute
  message: 'Too many cart operations. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ SEARCH ROUTES ============
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ FILE UPLOAD ROUTES ============
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ ADMIN ROUTES (Strict) ============
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 admin operations per 15 minutes
  message: 'Too many admin operations. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID + IP for admin routes
    return `${req.user?.id || 'anonymous'}-${req.ip}`;
  }
});

// ============ GENERAL API LIMITER ============
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

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
