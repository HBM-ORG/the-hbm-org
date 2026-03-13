/**
 * AI routes.
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import {
  pingAi,
  postFetchBook,
  postFetchVideo,
  postImproveCopy,
} from "../controllers/ai.controller.js";

const router = Router();

router.get("/ai/ping", pingAi);
router.post("/ai/improve-copy", postImproveCopy);
router.post("/ai/fetch-book", postFetchBook);
router.post("/ai/fetch-video", postFetchVideo);

export default router;
