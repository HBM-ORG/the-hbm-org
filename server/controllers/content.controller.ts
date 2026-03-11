import type { Request, Response } from "express";
import type { ContentLockTarget } from "../types/content.js";
import {
  getHowItWorksConfig,
  getHowItWorksStaging,
  getKnowledgeBaseConfig,
  getVideoEventConfig,
  publishHowItWorks,
  saveHowItWorksConfig,
  saveHowItWorksStaging,
  saveKnowledgeBaseConfig,
  saveVideoEventConfig,
  toggleContentLock,
} from "../services/content.service.js";

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
export function getVideoEvent(_req: Request, res: Response): void {
  res.json(getVideoEventConfig());
}

/**
 * @openapi
 * /api/video-event:
 *   post:
 *     summary: Save video event config
 *     tags: [Content]
 */
export function saveVideoEvent(req: Request, res: Response): void {
  try {
    saveVideoEventConfig(req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save video event settings" });
  }
}

/**
 * @openapi
 * /api/cms/how-it-works/staging:
 *   get:
 *     summary: Get staged how-it-works config
 *     tags: [Content]
 */
export function getHowItWorksStage(_req: Request, res: Response): void {
  res.json(getHowItWorksStaging());
}

/**
 * @openapi
 * /api/cms/how-it-works/staging:
 *   post:
 *     summary: Save staged how-it-works config
 *     tags: [Content]
 */
export function saveHowItWorksStage(req: Request, res: Response): void {
  try {
    saveHowItWorksStaging(req.body);
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
export function publishHowItWorksStage(_req: Request, res: Response): void {
  try {
    publishHowItWorks();
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
export function getHowItWorks(_req: Request, res: Response): void {
  res.status(200).json(getHowItWorksConfig());
}

/**
 * @openapi
 * /api/cms/how-it-works:
 *   post:
 *     summary: Save how-it-works config
 *     tags: [Content]
 */
export function saveHowItWorks(req: Request, res: Response): void {
  try {
    saveHowItWorksConfig(req.body, isForced(req));
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
export function getKnowledgeBase(_req: Request, res: Response): void {
  res.status(200).json(getKnowledgeBaseConfig());
}

/**
 * @openapi
 * /api/cms/knowledge-base:
 *   post:
 *     summary: Save knowledge-base config
 *     tags: [Content]
 */
export function saveKnowledgeBase(req: Request, res: Response): void {
  try {
    saveKnowledgeBaseConfig(req.body, isForced(req));
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
export function toggleLock(req: Request, res: Response): void {
  try {
    const configPath = getLockTarget(req.body?.path);
    if (!configPath) {
      res.status(400).json({ error: "Invalid content lock target" });
      return;
    }
    const isLocked = toggleContentLock(configPath);
    res.json({ success: true, isLocked });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to toggle lock",
    });
  }
}
