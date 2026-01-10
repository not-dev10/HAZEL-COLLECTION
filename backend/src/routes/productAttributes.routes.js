import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createVariant,
  updateVariant,
  deleteVariant,
  updateProductImages,
  addProductImage,
  updateProductSizes,
  updateProductColors,
  addProductTag,
  removeProductTag,
  updateSEO,
  updateStock
} from "../controllers/productAttributes.controller.js";

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.type !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can access this resource"
    });
  }
  next();
};

// Variant endpoints
router.post("/:productId/variants", requireAuth, requireAdmin, createVariant);
router.put("/:productId/variants/:variantId", requireAuth, requireAdmin, updateVariant);
router.delete("/:productId/variants/:variantId", requireAuth, requireAdmin, deleteVariant);

// Image endpoints
router.put("/:productId/images", requireAuth, requireAdmin, updateProductImages);
router.post("/:productId/images", requireAuth, requireAdmin, addProductImage);

// Size and Color endpoints
router.put("/:productId/sizes", requireAuth, requireAdmin, updateProductSizes);
router.put("/:productId/colors", requireAuth, requireAdmin, updateProductColors);

// Stock endpoint
router.put("/:productId/stock", requireAuth, requireAdmin, updateStock);

// Tag endpoints
router.post("/:productId/tags", requireAuth, requireAdmin, addProductTag);
router.delete("/:productId/tags", requireAuth, requireAdmin, removeProductTag);

// SEO endpoint
router.put("/:productId/seo", requireAuth, requireAdmin, updateSEO);

export default router;
