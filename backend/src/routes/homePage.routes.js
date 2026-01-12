import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getHomePageContent,
  updateCarouselSlides,
  updateNewArrivalsSection,
  updateBridalSection,
  updateCollectionBanner,
  updateHomePageContent
} from "../controllers/homePage.controller.js";

const router = express.Router();

// Get home page content (public)
router.get("/", getHomePageContent);

// Update endpoints (admin only)
router.put("/carousel", requireAuth, requireAdmin, updateCarouselSlides);
router.put("/new-arrivals", requireAuth, requireAdmin, updateNewArrivalsSection);
router.put("/bridal-section", requireAuth, requireAdmin, updateBridalSection);
router.put("/collection-banner", requireAuth, requireAdmin, updateCollectionBanner);
router.put("/content", requireAuth, requireAdmin, updateHomePageContent);

export default router;
