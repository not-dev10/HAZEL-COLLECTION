import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import fileUpload from 'express-fileupload';
import './config/cloudinary.js'; // Initialize Cloudinary on app startup
import { sessionTimeoutMiddleware, tokenRotationMiddleware } from "./middleware/sessionManagement.js";
import { ipWhitelistMiddleware, logAdminAccess } from "./middleware/ipWhitelist.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import productAttributesRoutes from "./routes/productAttributes.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import orderManagementRoutes from "./routes/orderManagement.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cloudinaryRoutes from "./routes/cloudinary.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import homePageRoutes from "./routes/homePage.routes.js";
import imageUploadRoutes from "./routes/imageUpload.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import healthRoutes from "./routes/health.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import csrfRoutes from "./routes/csrf.routes.js";

const app = express();

// 🔒 HTTPS REDIRECT - Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if request is already HTTPS
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// 🔒 SECURITY HEADERS - Prevents XSS, Clickjacking, and other attacks
// Build CSP directives dynamically based on environment
const getCspDirectives = () => {
  const directives = {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
    connectSrc: ["'self'", "https://api.cloudinary.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  };
  
  // Add localhost for development only
  if (process.env.NODE_ENV === 'development') {
    directives.connectSrc.push("http://localhost:*");
  }
  
  // Add frontend URL(s) for production (supports comma-separated values)
  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(',').forEach(url => {
      const trimmed = url.trim();
      if (trimmed && /^https?:\/\//.test(trimmed)) {
        directives.connectSrc.push(trimmed);
      }
    });
  }
  
  return directives;
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: getCspDirectives(),
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' }
}));


// 🔒 SECURE CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Allowed origins - always include localhost in development
    const allowedOrigins = process.env.NODE_ENV === 'development' ? [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
    ] : [
      'https://hazel-collection.onrender.com',
      'https://hazel-collection-gtme.vercel.app',
    ];
    
    // Add production frontend URL if configured
    if (process.env.FRONTEND_URL && process.env.NODE_ENV !== 'development') {
      process.env.FRONTEND_URL.split(',').forEach(url => {
        allowedOrigins.push(url.trim());
      });
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against whitelist (fail closed)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS rejected origin: ${origin}`);
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-CSRF-Token'],
  exposedHeaders: ['X-New-Token', 'X-Token-Rotated'], // For token rotation
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// 🔒 Session Management - Auto-logout after 2 hours of inactivity
app.use(sessionTimeoutMiddleware);
app.use(tokenRotationMiddleware);

// Increase JSON payload limit for image uploads (base64 data)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔒 INPUT SANITIZATION - Prevent XSS and NoSQL injection
app.use(xss()); // Sanitize user input from XSS
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// File upload middleware
import { tmpdir } from 'os';
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tmpdir(), // Use OS-independent temp directory
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}));

// Public routes (no IP restriction)
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products-attributes", productAttributesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/csrf", csrfRoutes); // CSRF token endpoint
app.use("/api/home-page", homePageRoutes); // GET is public, PUT is admin-protected by requireAdmin middleware

// 🔒 Admin routes - IP Whitelist + Logging
// Handle CORS preflight requests for admin routes BEFORE IP whitelist
app.options("/api/orders-management/*", cors(corsOptions));
app.options("/api/customers/*", cors(corsOptions));
app.options("/api/cloudinary/*", cors(corsOptions));
app.options("/api/upload/*", cors(corsOptions));
app.options("/api/logs/*", cors(corsOptions));
app.options("/api/sync/*", cors(corsOptions));
app.options("/api/settings/*", cors(corsOptions));
app.options("/api/analytics/*", cors(corsOptions));

app.use("/api/orders-management", logAdminAccess, ipWhitelistMiddleware, orderManagementRoutes);
app.use("/api/customers", logAdminAccess, ipWhitelistMiddleware, customerRoutes);
app.use("/api/cloudinary", logAdminAccess, ipWhitelistMiddleware, cloudinaryRoutes);
app.use("/api/upload", logAdminAccess, ipWhitelistMiddleware, imageUploadRoutes);
app.use("/api/logs", logAdminAccess, ipWhitelistMiddleware, logsRoutes);
app.use("/api/sync", logAdminAccess, ipWhitelistMiddleware, syncRoutes);
app.use("/api/settings", logAdminAccess, ipWhitelistMiddleware, settingsRoutes);
app.use("/api/analytics", logAdminAccess, ipWhitelistMiddleware, analyticsRoutes);

// ❌ 404 HANDLER - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: "Not Found"
  });
});

// 🚨 GLOBAL ERROR HANDLER - Must be last middleware
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler:', err);

  // Log error details for debugging
  console.error('Error Stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Body:', req.body);

  // Default error status and message
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Don't leak sensitive error details in production
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? (statusCode === 500 ? 'Internal Server Error' : message)
      : message,
    ...(process.env.NODE_ENV !== 'production' && {
      error: err.name,
      stack: err.stack
    })
  };

  res.status(statusCode).json(errorResponse);
});

export default app;

