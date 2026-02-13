import { Product } from "../models/Product.js";
import { 
  createProductWithCloudinary, 
  updateProductWithCloudinary,
  generateProductImageVariants 
} from "../utils/cloudinarySync.js";

/**
 * GET /api/products
 * Get all products with optional filters
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const products = await Product.findAll({ category, search });

    // Enhance products with Cloudinary image variants
    const enhancedProducts = products.map(product => ({
      ...product,
      imageVariants: product.cloudinaryPublicId 
        ? generateProductImageVariants(product.cloudinaryPublicId)
        : null
    }));

    return res.status(200).json({
      success: true,
      count: enhancedProducts.length,
      products: enhancedProducts
    });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};

/**
 * GET /api/products/categories
 * Get all unique product categories for navigation
 */
export const getCategories = async (req, res) => {
  try {
    const products = await Product.findAll();
    
    // Extract unique categories from products
    const categoriesSet = new Set();
    products.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    
    const categories = Array.from(categoriesSet).sort();

    return res.status(200).json({
      success: true,
      categories: categories,
      count: categories.length
    });
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      categories: []
    });
  }
};

/**
 * GET /api/products/:id
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching product:', id);
    const product = await Product.findById(id);
    console.log('Product found:', !!product);

    if (!product) {
      console.log('Product not found:', id);
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Enhance product with Cloudinary image variants
    const enhancedProduct = {
      ...product,
      imageVariants: product.cloudinaryPublicId 
        ? generateProductImageVariants(product.cloudinaryPublicId)
        : null
    };

    return res.status(200).json({
      success: true,
      product: enhancedProduct
    });
  } catch (err) {
    console.error("Get product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    });
  }
};

/**
 * POST /api/products
 * Create new product with Cloudinary integration
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, image, images, stock, color, size, isNew, isSale, details, inStock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category"
      });
    }

    // Use enhanced Cloudinary creation
    const product = await createProductWithCloudinary({
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images: Array.isArray(images) ? images : (image ? [image] : []),
      stock: stock || 0,
      color,
      size,
      isNew,
      isSale,
      details,
      inStock
    });

    // Add image variants to response
    const enhancedProduct = {
      ...product,
      imageVariants: product.cloudinaryPublicId 
        ? generateProductImageVariants(product.cloudinaryPublicId)
        : null
    };

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: enhancedProduct
    });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
};

/**
 * PUT /api/products/:id
 * Update product with Cloudinary integration
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.createdAt;
    delete updateData._id;

    // Use enhanced Cloudinary update
    const product = await updateProductWithCloudinary(id, updateData);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Add image variants to response
    const enhancedProduct = {
      ...product,
      imageVariants: product.cloudinaryPublicId 
        ? generateProductImageVariants(product.cloudinaryPublicId)
        : null
    };

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: enhancedProduct
    });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
};

/**
 * DELETE /api/products/:id
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
};
