import { getDB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export class Product {
  static async create({ name, description, price, originalPrice, category, image, images, stock, color, size, isNew, isSale, details, inStock, cloudinaryPublicId, collection, variants }) {
    const db = getDB();
    const products = db.collection("products");

    // Generate unified product ID (hex string)
    const productId = new ObjectId().toString();

    const result = await products.insertOne({
      // Unified ID for both MongoDB and Cloudinary
      productId,  // Unique identifier synced with Cloudinary folder
      
      // Basic info
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      collection: collection || category,
      
      // Images - Multiple images support
      image,  // Legacy image field for compatibility
      images: Array.isArray(images) ? images : (image ? [image] : []),  // Array of image URLs
      cloudinaryPublicId: cloudinaryPublicId || null,
      cloudinary: {
        folder: `didi-fashion/products/${productId}`,
        images: {
          main: null,
          alt1: null,
          alt2: null,
          alt3: null,
          thumbnail: null,
          swatch: null
        },
        uploadedAt: null,
        totalImages: 0,
        lastSync: null
      },
      
      // Product details
      stock: Number(stock || 0),
      color: Array.isArray(color) ? color : (color ? [color] : []),
      size: Array.isArray(size) ? size : (size ? [size] : []),
      
      // Variants with parameters/size/stock tracking
      variants: Array.isArray(variants) ? variants : [],
      
      isNew: isNew || false,
      isSale: isSale || false,
      details: details || [],
      inStock: inStock !== undefined ? inStock : true,
      rating: 0,
      reviews: [],
      sold: 0,
      
      // Custom product flag - for products with single color variant (no color selection needed)
      isCustomizable: false,
      
      // Metadata
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      _id: result.insertedId.toString(),
      productId,
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images,
      cloudinaryPublicId,
      stock,
      color,
      size,
      variants,
      isNew,
      isSale,
      details,
      inStock
    };
  }

  /**
   * Find product by unified productId
   */
  static async findByProductId(productId) {
    const db = getDB();
    const products = db.collection("products");
    
    const product = await products.findOne({ productId });
    
    if (!product) return null;
    
    return {
      id: product._id.toString(),
      ...product,
      stock: this.calculateTotalStock(product)
    };
  }

  /**
   * Update Cloudinary images reference in product
   */
  static async updateCloudinaryImages(productId, cloudinaryData) {
    const db = getDB();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          'cloudinary.images': cloudinaryData.images || {},
          'cloudinary.uploadedAt': new Date(),
          'cloudinary.totalImages': cloudinaryData.totalImages || 0,
          'cloudinary.lastSync': new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Sync product ID (rename/migrate)
   */
  static async syncProductId(oldProductId, newProductId) {
    const db = getDB();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { productId: oldProductId },
      {
        $set: {
          productId: newProductId,
          'cloudinary.folder': `didi-fashion/products/${newProductId}`,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async findAll(filters = {}) {
    const db = getDB();
    const products = db.collection("products");

    const query = {};
    
    // Normalize category filter - convert hyphens to spaces and handle case-insensitive search
    if (filters.category) {
      const normalizedCategory = filters.category
        .toLowerCase()
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Use regex for case-insensitive, space-flexible matching
      query.category = { $regex: `^${normalizedCategory}$`, $options: "i" };
    }
    
    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }
    if (filters.color) query.color = filters.color;

    const allProducts = await products.find(query).toArray();
    return allProducts.map(p => ({
      id: p._id.toString(),
      ...p,
      stock: this.calculateTotalStock(p)
    }));
  }

  /**
   * Calculate total stock from all variants
   */
  static calculateTotalStock(product) {
    if (!product.variants || product.variants.length === 0) {
      return product.stock || 0;
    }
    
    return product.variants.reduce((total, variant) => {
      const variantStock = variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
      return total + variantStock;
    }, 0);
  }

  static async findById(id) {
    const db = getDB();
    const products = db.collection("products");

    try {
      const product = await products.findOne({
        _id: new ObjectId(id)
      });

      if (!product) return null;

      return {
        id: product._id.toString(),
        ...product,
        stock: this.calculateTotalStock(product)
      };
    } catch (err) {
      return null;
    }
  }

  static async update(id, data) {
    const db = getDB();
    const products = db.collection("products");

    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      if (data.price) updateData.price = Number(data.price);
      if (data.originalPrice) updateData.originalPrice = Number(data.originalPrice);
      if (data.stock) updateData.stock = Number(data.stock);

      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      // MongoDB driver returns the updated document directly as the result
      if (!result || !result._id) {
        return null;
      }

      return {
        id: result._id.toString(),
        ...result
      };
    } catch (err) {
      return null;
    }
  }

  static async delete(id) {
    const db = getDB();
    const products = db.collection("products");

    try {
      const result = await products.deleteOne({
        _id: new ObjectId(id)
      });

      return result.deletedCount > 0;
    } catch (err) {
      return false;
    }
  }

  /**
   * Deduct stock from a specific variant
   */
  static async deductVariantStock(productId, variantId, size, quantity) {
    const db = getDB();
    const products = db.collection("products");

    try {
      const result = await products.findOneAndUpdate(
        { 
          _id: new ObjectId(productId),
          'variants.id': variantId,
          'variants.sizes.size': size
        },
        {
          $inc: {
            'variants.$[v].sizes.$[s].stock': -quantity
          }
        },
        {
          arrayFilters: [
            { 'v.id': variantId },
            { 's.size': size }
          ],
          returnDocument: 'after'
        }
      );

      return result.value ? {
        id: result.value._id.toString(),
        ...result.value,
        stock: this.calculateTotalStock(result.value)
      } : null;
    } catch (err) {
      console.error('Error deducting variant stock:', err);
      return null;
    }
  }
}
