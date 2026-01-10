import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getSettings,
  updateStoreInfo,
  updateSocialMedia,
  updatePaymentMethods,
  updateShippingRates,
  updateBusinessHours,
  updateCurrency
} from "../controllers/settings.controller.js";

const router = express.Router();

// Get settings (public or admin)
router.get("/", getSettings);

// Update endpoints (admin only)
router.put("/store-info", requireAuth, requireAdmin, updateStoreInfo);
router.put("/social-media", requireAuth, requireAdmin, updateSocialMedia);
router.put("/payment-methods", requireAuth, requireAdmin, updatePaymentMethods);
router.put("/shipping-rates", requireAuth, requireAdmin, updateShippingRates);
router.put("/business-hours", requireAuth, requireAdmin, updateBusinessHours);
router.put("/currency", requireAuth, requireAdmin, updateCurrency);

export default router;
