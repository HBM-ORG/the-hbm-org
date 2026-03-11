import type { Request, Response } from "express";
import {
  addCrmLeadNote,
  exportCrmContactCsv,
  getCrmContactByEmail,
  listCrmLeads,
  updateCrmLeadStatus,
} from "../services/crm.service.js";

function getQueryString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getRouteParam(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * @openapi
 * /api/crm/contact:
 *   get:
 *     summary: Get CRM contact profile
 *     tags: [CRM]
 */
export async function getCrmContact(req: Request, res: Response): Promise<void> {
  try {
    const email = getQueryString(req.query.email).toLowerCase();
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    res.json(await getCrmContactByEmail(email));
  } catch (error) {
    console.error("Error fetching CRM contact:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch CRM contact",
    });
  }
}

/**
 * @openapi
 * /api/crm/ping:
 *   get:
 *     summary: Verify CRM API is reachable
 *     tags: [CRM]
 */
export function pingCrm(_req: Request, res: Response): void {
  res.json({ ok: true, message: "CRM API reachable" });
}

/**
 * @openapi
 * /api/crm/contact/export:
 *   get:
 *     summary: Export a CRM contact as CSV
 *     tags: [CRM]
 */
export async function exportCrmContact(req: Request, res: Response): Promise<void> {
  try {
    const email = getQueryString(req.query.email).toLowerCase();
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    const { filename, csvContent } = await exportCrmContactCsv(email);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting contact:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to export contact",
    });
  }
}

/**
 * @openapi
 * /api/crm/leads:
 *   get:
 *     summary: List CRM leads
 *     tags: [CRM]
 */
export async function getCrmLeads(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await listCrmLeads());
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list CRM leads",
    });
  }
}

/**
 * @openapi
 * /api/crm/leads/{id}/status:
 *   patch:
 *     summary: Update CRM lead status
 *     tags: [CRM]
 */
export async function patchCrmLeadStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = parseInt(getRouteParam(req.params.id), 10);
    const status = typeof req.body?.status === "string" ? req.body.status : "";

    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const lead = await updateCrmLeadStatus(id, status);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to update CRM lead status",
    });
  }
}

/**
 * @openapi
 * /api/crm/leads/{id}/note:
 *   post:
 *     summary: Add CRM lead note
 *     tags: [CRM]
 */
export async function createCrmLeadNote(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = parseInt(getRouteParam(req.params.id), 10);
    const note = typeof req.body?.note === "string" ? req.body.note : "";

    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const lead = await addCrmLeadNote(id, note);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to add CRM lead note",
    });
  }
}
