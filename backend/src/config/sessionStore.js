import session from 'express-session';
import MongoStore from 'connect-mongo';

/**
 * MongoDB Session Store Configuration
 * Persists sessions in MongoDB for production-grade session management
 */

// Validate required environment variables
if (!process.env.SESSION_SECRET && !process.env.JWT_SECRET) {
  throw new Error('❌ SESSION_SECRET or JWT_SECRET must be set in environment variables');
}

if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('❌ ENCRYPTION_KEY must be set in environment variables for production');
}

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 2 * 60 * 60, // 2 hours (matches session timeout)
    autoRemove: 'native', // Auto-remove expired sessions
    touchAfter: 24 * 3600, // Lazy session update (update only once per 24h)
    ...(process.env.ENCRYPTION_KEY && {
      crypto: {
        secret: process.env.ENCRYPTION_KEY
      }
    })
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'sessionId', // Custom session cookie name
  rolling: true, // Reset expiration on every response
};

/**
 * Initialize session middleware
 */
export const sessionMiddleware = session(sessionConfig);

/**
 * Session cleanup utility
 * Call this periodically to remove expired sessions
 */
export async function cleanupExpiredSessions() {
  try {
    const store = sessionConfig.store;
    if (store && typeof store.clear === 'function') {
      await store.clear();
      console.log('✅ Expired sessions cleaned up');
    }
  } catch (error) {
    console.error('❌ Session cleanup error:', error);
  }
}

// Run cleanup every hour
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}
