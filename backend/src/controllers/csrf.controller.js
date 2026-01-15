/**
 * CSRF Token Controller
 * Generates CSRF tokens for client-side form submissions
 */
import csrf from "csurf";

/**
 * GET /api/csrf-token
 * Generate a CSRF token for the client
 * Client must include this token in X-CSRF-Token header for POST/PUT/DELETE requests
 */
export const getCsrfToken = (req, res) => {
  try {
    const token = req.csrfToken?.();
    
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate CSRF token"
      });
    }

    return res.status(200).json({
      success: true,
      message: "CSRF token generated",
      token,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate CSRF token"
    });
  }
};

/**
 * Middleware to generate CSRF token
 * Can be used to set token in response for client to use
 */
export const generateCsrfToken = (req, res, next) => {
  try {
    const token = req.csrfToken?.();
    if (token) {
      res.set('X-CSRF-Token', token);
    }
  } catch (error) {
    // CSRF token generation failed, but don't block the request
  }
  next();
};
