/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * Sanitize string to prevent XSS
 * Removes dangerous HTML/JavaScript characters
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize object recursively
 * Removes dangerous values from all object properties
 */
export function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip keys with suspicious names
      if (isInvalidKey(key)) {
        continue;
      }
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

/**
 * Check if a key name is suspicious
 */
function isInvalidKey(key) {
  const suspiciousPatterns = [
    '__proto__',
    'constructor',
    'prototype',
    'eval',
    'onclick',
    'onerror',
    'onload',
    'onmouse'
  ];

  return suspiciousPatterns.some(pattern => 
    key.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove script tags and event handlers
 */
export function removeScriptTags(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Express middleware to sanitize request body
 * Prevents XSS attacks by escaping user input
 * Skips sensitive fields like password and image data
 */
export function sanitizeBodyMiddleware(req, res, next) {
  if (!req.body) {
    return next();
  }

  // Fields to skip sanitization (password, images, files)
  const skipFields = ['password', 'image', 'imageUrl', 'profileImage', 'profileImageUrl', 'data'];

  // Sanitize all body fields except skipped ones
  const sanitizedBody = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (skipFields.includes(key)) {
      // Don't sanitize password or image fields
      sanitizedBody[key] = value;
    } else if (typeof value === 'string') {
      sanitizedBody[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitizedBody[key] = sanitizeObject(value);
    } else {
      sanitizedBody[key] = value;
    }
  }

  req.body = sanitizedBody;
  next();
}
