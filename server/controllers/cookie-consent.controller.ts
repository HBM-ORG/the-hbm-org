import type { Request, Response } from "express";
import {
  createCookieConsentLog,
  getRequestIp,
  listCookieConsentLogs,
} from "../services/cookie-consent.service.js";

/**
 * @openapi
 * /api/cookie-consent-log:
 *   post:
 *     summary: Store cookie consent selection
 *     tags: [Cookie Consent]
 */
export async function postCookieConsentLog(
  req: Request,
  res: Response,
): Promise<void> {
  const { choice, settings } = req.body || {};
  const ip = getRequestIp(
    req.ip,
    req.headers["x-forwarded-for"],
    req.socket.remoteAddress,
  );

  try {
    const row = await createCookieConsentLog({ choice, settings, ip });
    console.log("[Cookie Consent] Logged:", {
      choice,
      ip: row.hashedIp.substring(0, 16),
    });
    res.json({ success: true, id: row.id });
  } catch (error) {
    console.error("[Cookie Consent POST Error]", error);
    res.status(500).json({
      error: "Failed to log consent",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * @openapi
 * /api/cookie-consent-logs:
 *   get:
 *     summary: List recent cookie consent logs
 *     tags: [Cookie Consent]
 */
export async function getCookieConsentLogs(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const logs = await listCookieConsentLogs();
    console.log("[Cookie Consent] Fetched logs count:", logs.length);
    res.json(logs);
  } catch (error) {
    console.error("[Cookie Consent GET Error]", error);
    res.status(500).json({
      error: "Failed to fetch logs",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
