import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getAllOrders,
  updateOrderStatus,
  updateTrackingInfo,
  generateInvoice,
  addOrderNote,
  cancelOrder,
  processRefund,
  getOrderStats,
  updateDeliveryAddress,
  bulkUpdateStatus,
  deleteOrder
} from "../controllers/orderManagement.controller.js";

const router = express.Router();

// Admin endpoints
router.get("/admin/list", requireAuth, requireAdmin, getAllOrders);
router.get("/admin/stats", requireAuth, requireAdmin, getOrderStats);
router.put("/admin/:orderId/status", requireAuth, requireAdmin, updateOrderStatus);
router.put("/admin/:orderId/tracking", requireAuth, requireAdmin, updateTrackingInfo);
router.post("/admin/:orderId/invoice", requireAuth, requireAdmin, generateInvoice);
router.post("/admin/:orderId/notes", requireAuth, requireAdmin, addOrderNote);
router.post("/admin/:orderId/cancel", requireAuth, requireAdmin, cancelOrder);
router.post("/admin/:orderId/refund", requireAuth, requireAdmin, processRefund);
router.put("/admin/:orderId/address", requireAuth, requireAdmin, updateDeliveryAddress);
router.post("/admin/bulk-status", requireAuth, requireAdmin, bulkUpdateStatus);
router.delete("/admin/:orderId", requireAuth, requireAdmin, deleteOrder);

export default router;
