import type { Request, Response } from "express";
import type { ContentLockTarget } from "../types/content.js";
import {
  getDefaultHowItWorksConfig,
  getDefaultKnowledgeBaseConfig,
  getDefaultSiteSettingsConfig,
  getDefaultVideoEventConfig,
  getSiteSettingsConfig,
  getHowItWorksConfig,
  getHowItWorksStaging,
  getKnowledgeBaseConfig,
  getPublicVideoEventPayload,
  getVideoEventConfig,
  publishHowItWorks,
  saveSiteSettingsConfig,
  saveHowItWorksConfig,
  saveHowItWorksStaging,
  saveKnowledgeBaseConfig,
  saveVideoEventConfig,
  toggleContentLock,
} from "../services/content.service.js";
import {
  brevoCatalogToPublicEntries,
  getRuntimeBrevoListCatalog,
} from "../services/brevo-list-catalog.service.js";
import { getEffectiveBrevoListCatalog } from "../services/brevo-catalog-resolve.service.js";
import { isAuthorizedRequest } from "../middleware/admin-auth.js";

function logContentError(context: string, error: unknown) {
  console.error(`[content.controller:${context}]`, error);
}

function isForced(req: Request): boolean {
  const value = req.query.force;
  return value === "1" || value === "true";
}

function getLockTarget(value: unknown): ContentLockTarget | null {
  return value === "howItWorks" || value === "knowledgeBase" ? value : null;
}

/**
 * @openapi
 * /api/video-event:
 *   get:
 *     summary: Get video event config
 *     tags: [Content]
 */
export async function getVideoEvent(req: Request, res: Response): Promise<void> {
  try {
    const full = await getVideoEventConfig();
    if (await isAuthorizedRequest(req)) {
      res.json(full);
      return;
    }
    res.json(getPublicVideoEventPayload(full));
  } catch (error) {
    logContentError("getVideoEvent", error);
    res.status(200).json(getDefaultVideoEventConfig());
  }
}

/**
 * @openapi
 * /api/video-event:
 *   post:
 *     summary: Save video event config
 *     tags: [Content]
 */
export async function saveVideoEvent(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    await saveVideoEventConfig(req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save video event settings" });
  }
}

export async function getSiteSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json(await getSiteSettingsConfig());
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[getSiteSettings] ${msg}`);
    res.status(200).json(getDefaultSiteSettingsConfig());
  }
}

/**
 * @openapi
 * /api/brevo-list-catalog:
 *   get:
 *     summary: Brevo list keys and numeric ids from BREVO_LIST_IDS (for admin UI)
 *     tags: [Content]
 */
export async function getBrevoListCatalog(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const catalog = await getEffectiveBrevoListCatalog();
    res.status(200).json({ entries: brevoCatalogToPublicEntries(catalog) });
  } catch (error) {
    logContentError("getBrevoListCatalog", error);
    res.status(200).json({
      entries: brevoCatalogToPublicEntries(getRuntimeBrevoListCatalog()),
    });
  }
}

export async function saveSiteSettings(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const settings = await saveSiteSettingsConfig(req.body);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to save site settings",
    });
  }
}

/**
 * @openapi
 * /api/cms/how-it-works/staging:
 *   get:
 *     summary: Get staged how-it-works config
 *     tags: [Content]
 */
export async function getHowItWorksStage(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.json(await getHowItWorksStaging());
  } catch (error) {
    logContentError("getHowItWorksStage", error);
    res.status(200).json(getDefaultHowItWorksConfig());
  }
}

/**
 * @openapi
 * /api/cms/how-it-works/staging:
 *   post:
 *     summary: Save staged how-it-works config
 *     tags: [Content]
 */
export async function saveHowItWorksStage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await saveHowItWorksStaging(req.body);
    res.json({ success: true, message: "Saved to staging" });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to save staging",
    });
  }
}

/**
 * @openapi
 * /api/cms/how-it-works/publish:
 *   post:
 *     summary: Publish staged how-it-works config
 *     tags: [Content]
 */
export async function publishHowItWorksStage(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    await publishHowItWorks();
    res.json({ success: true, message: "Published to live site!" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to publish content";
    res.status(message === "No staged changes to publish" ? 400 : 500).json({
      error: message,
    });
  }
}

/**
 * @openapi
 * /api/cms/how-it-works:
 *   get:
 *     summary: Get how-it-works config
 *     tags: [Content]
 */
export async function getHowItWorks(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json(await getHowItWorksConfig());
  } catch (error) {
    logContentError("getHowItWorks", error);
    res.status(200).json(getDefaultHowItWorksConfig());
  }
}

/**
 * @openapi
 * /api/cms/how-it-works:
 *   post:
 *     summary: Save how-it-works config
 *     tags: [Content]
 */
export async function saveHowItWorks(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    await saveHowItWorksConfig(req.body, isForced(req));
    res.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save how-it-works";
    res.status(message === "Section is locked" ? 403 : 500).json({ error: message });
  }
}

/**
 * @openapi
 * /api/cms/knowledge-base:
 *   get:
 *     summary: Get knowledge-base config
 *     tags: [Content]
 */
export async function getKnowledgeBase(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json(await getKnowledgeBaseConfig());
  } catch (error) {
    logContentError("getKnowledgeBase", error);
    res.status(200).json(getDefaultKnowledgeBaseConfig());
  }
}

/**
 * @openapi
 * /api/cms/knowledge-base:
 *   post:
 *     summary: Save knowledge-base config
 *     tags: [Content]
 */
export async function saveKnowledgeBase(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    await saveKnowledgeBaseConfig(req.body, isForced(req));
    res.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save knowledge-base";
    res.status(message === "Section is locked" ? 403 : 500).json({ error: message });
  }
}

/**
 * @openapi
 * /api/cms/lock-toggle:
 *   post:
 *     summary: Toggle content lock
 *     tags: [Content]
 */
export async function toggleLock(req: Request, res: Response): Promise<void> {
  try {
    if (!(await isAuthorizedRequest(req))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const configPath = getLockTarget(req.body?.path);
    if (!configPath) {
      res.status(400).json({ error: "Invalid content lock target" });
      return;
    }
    const isLocked = await toggleContentLock(configPath);
    res.json({ success: true, isLocked });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to toggle lock",
    });
  }
}
