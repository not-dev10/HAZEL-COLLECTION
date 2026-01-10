import { getDB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export class ProductAttributes {
  /**
   * Create product variant - uses productId reference
   * Variants stored under product document
   */
  static async createVariant(productId, variant) {
    const db = getDB();
    const products = db.collection("products");

    const newVariant = {
      variantId: new ObjectId().toString(),
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      originalPrice: variant.originalPrice || null,
      stock: variant.stock,
      cloudinaryImagePath: variant.cloudinaryImagePath || null, // e.g., didi-fashion/products/{productId}/variants/{variantId}
      images: variant.images || [], // Array of image URLs
      isActive: true,
      createdAt: new Date()
    };

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $push: { variants: newVariant },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    return newVariant;
  }

  /**
   * Update variant by variantId within a product
   */
  static async updateVariant(productId, variantId, updates) {
    const db = getDB();
    const products = db.collection("products");

    const updateSet = {
      updatedAt: new Date()
    };

    // Only include provided fields
    if (updates.sku) updateSet["variants.$.sku"] = updates.sku;
    if (updates.size) updateSet["variants.$.size"] = updates.size;
    if (updates.color) updateSet["variants.$.color"] = updates.color;
    if (updates.price !== undefined) updateSet["variants.$.price"] = Number(updates.price);
    if (updates.originalPrice !== undefined) updateSet["variants.$.originalPrice"] = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.stock !== undefined) updateSet["variants.$.stock"] = Number(updates.stock);
    if (updates.images) updateSet["variants.$.images"] = updates.images;
    if (updates.cloudinaryImagePath) updateSet["variants.$.cloudinaryImagePath"] = updates.cloudinaryImagePath;

    const result = await products.findOneAndUpdate(
      { productId, "variants.variantId": variantId },
      { $set: updateSet },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return result.variants.find(v => v.variantId === variantId);
  }

  /**
   * Delete variant from product
   */
  static async deleteVariant(productId, variantId) {
    const db = getDB();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $pull: { variants: { variantId } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Update product images - synced with Cloudinary folder structure
   * Folder: didi-fashion/products/{productId}/
   * Images: main, alt1, alt2, alt3, thumbnail, swatch
   */
  static async updateProductImages(productId, images) {
    const db = getDB();
    const products = db.collection("products");

    const imageUpdate = {};
    if (images.main) imageUpdate.main = images.main;
    if (images.alt1) imageUpdate.alt1 = images.alt1;
    if (images.alt2) imageUpdate.alt2 = images.alt2;
    if (images.alt3) imageUpdate.alt3 = images.alt3;
    if (images.thumbnail) imageUpdate.thumbnail = images.thumbnail;
    if (images.swatch) imageUpdate.swatch = images.swatch;

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          "cloudinary.images": imageUpdate,
          "cloudinary.totalImages": Object.values(imageUpdate).filter(i => i).length,
          "cloudinary.lastSync": new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Add/replace single image - corresponds to Cloudinary public_id
   */
  static async addProductImage(productId, imageType, imageUrl) {
    const db = getDB();
    const products = db.collection("products");

    const validTypes = ["main", "alt1", "alt2", "alt3", "thumbnail", "swatch"];
    if (!validTypes.includes(imageType)) {
      throw new Error(`Invalid image type. Must be one of: ${validTypes.join(", ")}`);
    }

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          [`cloudinary.images.${imageType}`]: imageUrl,
          "cloudinary.lastSync": new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Update available sizes for product
   */
  static async updateProductSizes(productId, sizes) {
    const db = getDB();
    const products = db.collection("products");

    const sizeArray = Array.isArray(sizes) ? sizes : [sizes];

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          size: sizeArray,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Update available colors for product
   */
  static async updateProductColors(productId, colors) {
    const db = getDB();
    const products = db.collection("products");

    const colorArray = Array.isArray(colors) ? colors : [colors];

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          color: colorArray,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Update product stock
   */
  static async updateStock(productId, quantity) {
    const db = getDB();
    const products = db.collection("products");

    // Try to convert to ObjectId if it looks like a MongoDB ID
    let query = { productId };
    try {
      if (ObjectId.isValid(productId)) {
        query = { _id: new ObjectId(productId) };
      }
    } catch (e) {
      // If not a valid ObjectId, fall back to productId search
    }

    const result = await products.findOneAndUpdate(
      query,
      {
        $set: {
          stock: Number(quantity),
          inStock: Number(quantity) > 0,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Add product tag
   */
  static async addProductTag(productId, tag) {
    const db = getDB();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $addToSet: { tags: tag },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Remove product tag
   */
  static async removeProductTag(productId, tag) {
    const db = getDB();
    const products = db.collection("products");

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $pull: { tags: tag },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Update SEO metadata
   */
  static async updateSEO(productId, seoData) {
    const db = getDB();
    const products = db.collection("products");

    const seoUpdate = {};
    if (seoData.metaTitle) seoUpdate.metaTitle = seoData.metaTitle;
    if (seoData.metaDescription) seoUpdate.metaDescription = seoData.metaDescription;
    if (seoData.metaKeywords) seoUpdate.metaKeywords = seoData.metaKeywords;
    if (seoData.slug) seoUpdate.slug = seoData.slug;

    const result = await products.findOneAndUpdate(
      { productId },
      {
        $set: {
          seo: seoUpdate,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Get product details with all attributes
   */
  static async getProductDetails(productId) {
    const db = getDB();
    const products = db.collection("products");

    const product = await products.findOne({ productId });
    return product || null;
  }
}
