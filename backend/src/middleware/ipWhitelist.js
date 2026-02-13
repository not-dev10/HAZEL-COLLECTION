/**
 * IP Whitelist Middleware for Admin Routes
 * Only allows admin access from trusted IP addresses
 */

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  // Check various headers for real IP (in case of proxy/load balancer)
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  );
};

/**
 * Normalize IP address (handle IPv6 mapped IPv4)
 */
const normalizeIp = (ip) => {
  if (!ip) return null;
  
  // Convert IPv6 mapped IPv4 to IPv4
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  return ip;
};

/**
 * Check if IP is localhost
 */
const isLocalhost = (ip) => {
  const normalizedIp = normalizeIp(ip);
  return (
    normalizedIp === '127.0.0.1' ||
    normalizedIp === 'localhost' ||
    normalizedIp === '::1' ||
    normalizedIp?.startsWith('192.168.') || // Local network
    normalizedIp?.startsWith('10.') ||      // Local network
    normalizedIp?.startsWith('172.')        // Local network
  );
};

/**
 * IP Whitelist Middleware
 * Configure allowed IPs in .env: ADMIN_ALLOWED_IPS=1.2.3.4,5.6.7.8
 * For universal access: ADMIN_ALLOWED_IPS=0.0.0.0 (allows all IPs)
 */
export const ipWhitelistMiddleware = (req, res, next) => {
  const clientIp = getClientIp(req);
  const normalizedIp = normalizeIp(clientIp);

  // Get whitelist from environment variable
  const whitelistRaw = process.env.ADMIN_ALLOWED_IPS?.trim() || '';
  const whitelist = whitelistRaw.length > 0 ? whitelistRaw.split(',').map(ip => ip.trim()).filter(ip => ip) : [];

  // ✅ UNIVERSAL ALLOW - If '0.0.0.0' is in whitelist (allow all IPs)
  if (whitelist.includes('0.0.0.0')) {
    console.log(`✅ Admin access: UNIVERSAL MODE (0.0.0.0) - allowing all IPs | IP: ${normalizedIp}`);
    return next();
  }

  // ✅ WILDCARD ALLOW - If '*' is in whitelist
  if (whitelist.includes('*')) {
    console.log(`✅ Admin access: WILDCARD (*) - allowing all IPs | IP: ${normalizedIp}`);
    return next();
  }

  // In development, allow localhost if no whitelist configured
  if ((process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && whitelist.length === 0) {
    if (isLocalhost(clientIp)) {
      console.log(`✅ Admin access allowed from localhost: ${normalizedIp}`);
      return next();
    }
  }

  // If no whitelist configured in production - DENY
  if (whitelist.length === 0 && process.env.NODE_ENV === 'production') {
    console.log(`❌ Admin access denied: No IP whitelist configured in production`);
    return res.status(403).json({
      success: false,
      message: "Admin access denied. IP whitelist not configured.",
      code: "IP_WHITELIST_NOT_CONFIGURED"
    });
  }

  // Check if IP is in whitelist
  if (whitelist.includes(normalizedIp) || isLocalhost(clientIp)) {
    console.log(`✅ Admin access allowed from whitelisted IP: ${normalizedIp}`);
    return next();
  }

  // IP not in whitelist - DENY
  console.log(`❌ Admin access DENIED from IP: ${normalizedIp}`);
  console.log(`   Configured whitelist: ${whitelist.length > 0 ? whitelist.join(', ') : 'EMPTY'}`);

  return res.status(403).json({
    success: false,
    message: "Admin access denied. Your IP address is not authorized.",
    code: "IP_NOT_WHITELISTED",
    clientIp: normalizedIp
  });
};

/**
 * Middleware to log all admin access attempts
 */
export const logAdminAccess = (req, res, next) => {
  const clientIp = getClientIp(req);
  const normalizedIp = normalizeIp(clientIp);
  const user = req.user?.email || 'Anonymous';
  const path = req.path;
  const method = req.method;

  console.log(`🔐 Admin access: ${method} ${path} | User: ${user} | IP: ${normalizedIp}`);
  
  next();
};

export default {
  ipWhitelistMiddleware,
  logAdminAccess,
  getClientIp,
  normalizeIp
};
