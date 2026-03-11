/**
 * CRM Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import {
  createCrmLeadNote,
  exportCrmContact,
  getCrmContact,
  getCrmLeads,
  patchCrmLeadStatus,
  pingCrm,
} from "../controllers/crm.controller.js";

const router = Router();

router.get("/crm/contact", getCrmContact);
router.get("/crm/contact/", getCrmContact);
router.get("/crm/ping", pingCrm);
router.get("/crm/contact/export", exportCrmContact);
router.get("/crm/leads", getCrmLeads);
router.patch("/crm/leads/:id/status", patchCrmLeadStatus);
router.post("/crm/leads/:id/note", createCrmLeadNote);

export default router;
