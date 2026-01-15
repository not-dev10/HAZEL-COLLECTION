import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force and credential stuffing attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per 15 minutes
  message: "Too many login attempts. Please try again later.",
  standardHeaders: false,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for specific IPs if needed (e.g., localhost in development)
    return false;
  }
});

/**
 * Rate limiter for general API endpoints
 * Prevents abuse and DOS attacks
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: "Too many requests from this IP. Please try again later.",
  standardHeaders: false,
  legacyHeaders: false
});

/**
 * Rate limiter for cart/wishlist operations
 * Prevents rapid spamming of add/remove operations
 */
export const cartWishlistLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 operations per IP per minute
  message: "Too many cart operations. Please slow down.",
  standardHeaders: false,
  legacyHeaders: false
});
