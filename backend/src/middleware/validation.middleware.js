/**
 * Input Validation Middleware
 * Comprehensive validation for all API endpoints
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Order Creation Validation
 */
export const validateOrderCreation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('firstName')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Invalid phone number'),
  body('billingStreet')
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage('Billing street is required'),
  body('billingCity')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Billing city is required'),
  body('billingState')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Billing state is required'),
  body('billingZip')
    .trim()
    .notEmpty()
    .isLength({ max: 20 })
    .withMessage('Billing ZIP is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  body('tax')
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number'),
  body('grandTotal')
    .isFloat({ min: 0 })
    .withMessage('Grand total must be a positive number'),
  handleValidationErrors
];

/**
 * User Profile Update Validation
 */
export const validateUserProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Invalid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address too long'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City too long'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country too long'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender'),
  handleValidationErrors
];

/**
 * Product Creation/Update Validation
 */
export const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 255 })
    .withMessage('Product name must be 3-255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Category is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  handleValidationErrors
];

/**
 * Review Creation Validation
 */
export const validateReview = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment too long'),
  handleValidationErrors
];

/**
 * Wishlist Item Validation
 */
export const validateWishlistItem = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  handleValidationErrors
];

/**
 * Cart Item Validation
 */
export const validateCartItem = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  handleValidationErrors
];

/**
 * Password Change Validation
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
  handleValidationErrors
];

/**
 * Pagination Validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * Search Validation
 */
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query must be 1-255 characters'),
  handleValidationErrors
];

/**
 * ID Parameter Validation
 */
export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];
