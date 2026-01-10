import { ProductAttributes } from "../models/ProductAttributes.js";

export const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sku, size, color, price, originalPrice, stock, images, cloudinaryImagePath } = req.body;

    if (!productId || !sku || !price) {
      return res.status(400).json({
        success: false,
        message: "Product ID, SKU, and price are required"
      });
    }

    const variant = await ProductAttributes.createVariant(productId, {
      sku,
      size,
      color,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock || 0),
      images: images || [],
      cloudinaryImagePath
    });

    res.json({
      success: true,
      message: "Variant created successfully",
      data: variant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const updates = req.body;

    const variant = await ProductAttributes.updateVariant(productId, variantId, updates);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    res.json({
      success: true,
      message: "Variant updated successfully",
      data: variant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const deleted = await ProductAttributes.deleteVariant(productId, variantId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    res.json({
      success: true,
      message: "Variant deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = req.body;

    const updated = await ProductAttributes.updateProductImages(productId, images);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product images updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageType, imageUrl } = req.body;

    if (!imageType || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image type and URL are required"
      });
    }

    const added = await ProductAttributes.addProductImage(productId, imageType, imageUrl);

    if (!added) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Image added successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductSizes = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sizes } = req.body;

    if (!Array.isArray(sizes)) {
      return res.status(400).json({
        success: false,
        message: "Sizes must be an array"
      });
    }

    const updated = await ProductAttributes.updateProductSizes(productId, sizes);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product sizes updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductColors = async (req, res) => {
  try {
    const { productId } = req.params;
    const { colors } = req.body;

    if (!Array.isArray(colors)) {
      return res.status(400).json({
        success: false,
        message: "Colors must be an array"
      });
    }

    const updated = await ProductAttributes.updateProductColors(productId, colors);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product colors updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    console.log('\n=== STOCK UPDATE ATTEMPT ===');
    console.log('User authenticated:', !!req.user);
    console.log('User role:', req.user?.role);
    console.log('Request headers:', { authorization: req.headers.authorization ? 'Present' : 'Missing' });
    
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);

    if (quantity === undefined || quantity === null) {
      console.log('Validation failed: Quantity missing');
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }

    console.log('Calling ProductAttributes.updateStock...');
    const updated = await ProductAttributes.updateStock(productId, quantity);
    console.log('Update result:', updated);

    if (!updated) {
      console.log('Product not found for stock update');
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log('Stock updated successfully');
    res.json({
      success: true,
      message: "Product stock updated successfully"
    });
  } catch (error) {
    console.error('Stock update error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addProductTag = async (req, res) => {
  try {
    const { productId } = req.params;
    const { tag } = req.body;

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: "Tag is required"
      });
    }

    const added = await ProductAttributes.addProductTag(productId, tag);

    if (!added) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Tag added successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const removeProductTag = async (req, res) => {
  try {
    const { productId } = req.params;
    const { tag } = req.body;

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: "Tag is required"
      });
    }

    const removed = await ProductAttributes.removeProductTag(productId, tag);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Product not found or tag not found"
      });
    }

    res.json({
      success: true,
      message: "Tag removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSEO = async (req, res) => {
  try {
    const { productId } = req.params;
    const { metaTitle, metaDescription, metaKeywords, slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required"
      });
    }

    const updated = await ProductAttributes.updateSEO(productId, {
      metaTitle,
      metaDescription,
      metaKeywords,
      slug
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "SEO data updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
