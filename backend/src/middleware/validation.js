import { z } from 'zod';

/**
 * Zod Validation Schemas for API Endpoints
 * Ensures data integrity and prevents injection attacks
 */

// ============ AUTH SCHEMAS ============

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  newPassword: z.string().min(8).max(128)
});

// ============ ORDER SCHEMAS ============

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().length(24), // MongoDB ObjectId
    quantity: z.number().int().min(1).max(100),
    price: z.number().positive(),
    name: z.string().min(1).max(200)
  })).min(1).max(50),
  
  personalInfo: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/)
  }),
  
  deliveryAddress: z.object({
    line1: z.string().min(5).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{5,10}$/),
    country: z.string().min(2).max(100)
  }),
  
  billingAddress: z.object({
    line1: z.string().min(5).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{5,10}$/),
    country: z.string().min(2).max(100)
  }).optional(),
  
  paymentMethod: z.enum(['cod', 'online', 'card']),
  
  totals: z.object({
    subtotal: z.number().positive(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().positive()
  })
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
});

// ============ PRODUCT SCHEMAS ============

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  category: z.string().min(2).max(100),
  subcategory: z.string().min(2).max(100).optional(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1).max(10),
  attributes: z.object({
    size: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    material: z.string().optional()
  }).optional()
});

export const updateProductSchema = createProductSchema.partial();

// ============ REVIEW SCHEMAS ============

export const createReviewSchema = z.object({
  productId: z.string().length(24),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200),
  comment: z.string().min(10).max(2000)
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

// ============ CART SCHEMAS ============

export const addToCartSchema = z.object({
  productId: z.string().length(24),
  quantity: z.number().int().min(1).max(100),
  price: z.number().positive(),
  name: z.string().min(1).max(200),
  image: z.string().url().optional(),
  attributes: z.object({
    size: z.string().optional(),
    color: z.string().optional()
  }).optional()
});

export const updateCartQuantitySchema = z.object({
  itemId: z.string().length(24),
  quantity: z.number().int().min(1).max(100)
});

// ============ WISHLIST SCHEMAS ============

export const addToWishlistSchema = z.object({
  productId: z.string().length(24),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  image: z.string().url().optional()
});

// ============ USER SCHEMAS ============

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  addresses: z.array(z.object({
    line1: z.string().min(5).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{5,10}$/),
    country: z.string().min(2).max(100),
    isDefault: z.boolean().optional()
  })).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

// ============ VALIDATION MIDDLEWARE ============

/**
 * Validation middleware factory
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} - Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

/**
 * Validate query parameters
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} - Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional()
});
