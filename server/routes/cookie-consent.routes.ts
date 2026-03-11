/**
 * Cookie consent routes.
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import {
  getCookieConsentLogs,
  postCookieConsentLog,
} from "../controllers/cookie-consent.controller.js";

const router = Router();

router.post("/cookie-consent-log", postCookieConsentLog);
router.get("/cookie-consent-logs", getCookieConsentLogs);

export default router;
