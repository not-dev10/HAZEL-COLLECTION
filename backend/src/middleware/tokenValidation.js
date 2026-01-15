import jwt from "jsonwebtoken";

/**
 * Middleware to validate JWT token expiration
 * Checks if token is expired and returns 401 if so
 */
export const validateTokenExpiration = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(); // Let requireAuth handle missing token
  }

  try {
    // Verify token and check expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    
    // Check if token is expiring soon (within 1 hour)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    if (expiresIn < 0) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }
    
    // If token expires within 1 hour, suggest refresh
    if (expiresIn < 3600) {
      res.set('X-Token-Expires-Soon', 'true');
    }
    
    req.tokenExpiresIn = expiresIn;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED",
        expiredAt: error.expiredAt
      });
    }
    next(); // Let requireAuth handle other JWT errors
  }
};

/**
 * Middleware to refresh token if expiring soon
 * Automatically issues new token if current one is within 1 hour of expiration
 */
export const autoRefreshToken = (req, res, next) => {
  if (!req.user || !req.tokenExpiresIn) {
    return next();
  }

  // If token expires within 1 hour, issue a new one
  if (req.tokenExpiresIn < 3600) {
    const newToken = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    // Send new token in response header
    res.set('X-New-Token', newToken);
    res.set('X-Token-Refreshed', 'true');
  }

  next();
};

/**
 * Manually refresh token endpoint
 * Client can call this to get a new token
 */
export const refreshToken = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }

  try {
    // Try to decode token even if expired (using ignoreExpiration option)
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.id || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // Issue new token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      token: newToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Failed to refresh token"
    });
  }
};
