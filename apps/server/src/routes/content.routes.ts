/**
 * Content routes.
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import {
  getHowItWorks,
  getHowItWorksStage,
  getKnowledgeBase,
  getSiteSettings,
  getVideoEvent,
  publishHowItWorksStage,
  saveHowItWorks,
  saveHowItWorksStage,
  saveKnowledgeBase,
  saveSiteSettings,
  saveVideoEvent,
  toggleLock,
} from "../controllers/content.controller.js";

const router = Router();

router.get("/video-event", getVideoEvent);
router.post("/video-event", saveVideoEvent);
router.get("/site-settings", getSiteSettings);
router.post("/site-settings", saveSiteSettings);
router.get("/cms/how-it-works/staging", getHowItWorksStage);
router.post("/cms/how-it-works/staging", saveHowItWorksStage);
router.post("/cms/how-it-works/publish", publishHowItWorksStage);
router.get("/cms/how-it-works", getHowItWorks);
router.post("/cms/how-it-works", saveHowItWorks);
router.get("/cms/knowledge-base", getKnowledgeBase);
router.post("/cms/knowledge-base", saveKnowledgeBase);
router.post("/cms/lock-toggle", toggleLock);

export default router;
