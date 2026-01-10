import "dotenv/config.js";
import express from "express";
import cors from "cors";
import './config/cloudinary.js'; // Initialize Cloudinary on app startup
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
import imageUploadRoutes from "./routes/imageUpload.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();

// Dynamic CORS configuration - accepts any localhost port
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any localhost or 127.0.0.1 origin
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    
    if (isLocalhost) {
      console.log(`🌐 CORS: Allowing origin ${origin}`);
      return callback(null, true);
    }
    
    // Add production domains here if needed
    const allowedDomains = [
      // Add your production domains here
      // 'https://yourdomain.com',
      // 'https://www.yourdomain.com'
    ];
    
    if (allowedDomains.includes(origin)) {
      return callback(null, true);
    }
    
    console.log(`❌ CORS: Blocked origin ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Increase JSON payload limit for image uploads (base64 data)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products-attributes", productAttributesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/orders-management", orderManagementRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/upload", imageUploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/settings", settingsRoutes);

export default app;
