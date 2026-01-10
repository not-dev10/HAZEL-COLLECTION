import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET all products - public
router.get("/", getAllProducts);

// GET single product - public
router.get("/:id", getProductById);

// CREATE product - admin only
router.post("/", requireAuth, requireAdmin, createProduct);

// UPDATE product - admin only
router.put("/:id", requireAuth, requireAdmin, updateProduct);

// DELETE product - admin only
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;
