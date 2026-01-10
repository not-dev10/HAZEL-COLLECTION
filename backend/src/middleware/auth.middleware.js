import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth check - Header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');
  
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log('❌ Auth failed: No token provided');
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth success:', req.user.email || req.user.id);
    next();
  } catch (error) {
    console.log('❌ Auth failed: Invalid token -', error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * Centralized Admin Authorization Middleware
 * Checks if user has admin role/type
 * Must be used AFTER requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
  const user = req.user;
  
  if (!user || (user.role !== 'admin' && user.type !== 'admin')) {
    console.log('❌ Unauthorized admin access attempt:', {
      hasUser: !!user,
      role: user?.role,
      type: user?.type
    });
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  
  console.log('✅ Admin authorization check passed for user:', user.email);
  next();
};
