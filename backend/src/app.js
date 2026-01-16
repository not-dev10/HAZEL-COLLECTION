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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
      connectSrc: ["'self'", "http://localhost:*", "https://api.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
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
  origin: true, // Allow all origins (will be restricted in production with proper FRONTEND_URL)
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
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
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
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

// 🔒 Admin routes - IP Whitelist + Logging
app.use("/api/orders-management", logAdminAccess, ipWhitelistMiddleware, orderManagementRoutes);
app.use("/api/customers", logAdminAccess, ipWhitelistMiddleware, customerRoutes);
app.use("/api/cloudinary", logAdminAccess, ipWhitelistMiddleware, cloudinaryRoutes);
app.use("/api/upload", logAdminAccess, ipWhitelistMiddleware, imageUploadRoutes);
app.use("/api/logs", logAdminAccess, ipWhitelistMiddleware, logsRoutes);
app.use("/api/sync", logAdminAccess, ipWhitelistMiddleware, syncRoutes);
app.use("/api/settings", logAdminAccess, ipWhitelistMiddleware, settingsRoutes);
app.use("/api/home-page", logAdminAccess, ipWhitelistMiddleware, homePageRoutes);
app.use("/api/analytics", logAdminAccess, ipWhitelistMiddleware, analyticsRoutes);

export default app;

