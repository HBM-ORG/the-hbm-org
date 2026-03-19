import { Router } from "express";
import {
  getProvidersStatus,
  postBrevoWebhook,
  postEspoWebhook,
  resyncProviderContact,
} from "../controllers/provider.controller.js";

const router = Router();

router.get("/providers/status", getProvidersStatus);
router.post("/providers/contact/resync", resyncProviderContact);
router.post("/providers/brevo/webhook", postBrevoWebhook);
router.post("/providers/espocrm/webhook", postEspoWebhook);

export default router;
