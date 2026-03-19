import type { Request, Response } from "express";
import { isAuthorizedRequest } from "../middleware/admin-auth.js";
import {
  getProviderStatusSummary,
  processBrevoWebhook,
  processEspoWebhook,
  syncContactToProviders,
} from "../services/provider-sync.service.js";

function getBodyEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function getProvidersStatus(req: Request, res: Response): Promise<void> {
  if (!(await isAuthorizedRequest(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(getProviderStatusSummary());
}

export async function resyncProviderContact(
  req: Request,
  res: Response,
): Promise<void> {
  if (!(await isAuthorizedRequest(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const email = getBodyEmail(req.body?.email);
  if (!email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  try {
    const results = await syncContactToProviders(email);
    res.json({ success: true, email, results });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to resync providers",
    });
  }
}

export async function postBrevoWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await processBrevoWebhook(req.body, req.headers);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : "Brevo webhook rejected",
    });
  }
}

export async function postEspoWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await processEspoWebhook(req.body, req.headers);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : "EspoCRM webhook rejected",
    });
  }
}
