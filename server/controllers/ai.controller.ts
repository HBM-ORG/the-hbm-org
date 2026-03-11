import type { Request, Response } from "express";
import { fetchBookInfo } from "../services/book-enrichment.service.js";
import {
  getAiPing,
  improveCopy,
} from "../services/ai.service.js";
import { fetchVideoInfo } from "../services/video-enrichment.service.js";

/**
 * @openapi
 * /api/ai/ping:
 *   get:
 *     summary: Check AI service availability
 *     tags: [AI]
 */
export function pingAi(_req: Request, res: Response): void {
  res.json(getAiPing());
}

/**
 * @openapi
 * /api/ai/improve-copy:
 *   post:
 *     summary: Improve marketing or content copy using AI with fallback simulation
 *     tags: [AI]
 */
export async function postImproveCopy(
  req: Request,
  res: Response,
): Promise<void> {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  const goal = typeof req.body?.goal === "string" ? req.body.goal : "";
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
  const tone = typeof req.body?.tone === "string" ? req.body.tone : "";
  const language =
    typeof req.body?.language === "string" ? req.body.language : "en";

  res.json({
    text: await improveCopy({ text, goal, prompt, tone, language }),
  });
}

/**
 * @openapi
 * /api/ai/fetch-book:
 *   post:
 *     summary: Enrich a book with metadata and AI-generated copy
 *     tags: [AI]
 */
export async function postFetchBook(
  req: Request,
  res: Response,
): Promise<void> {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const author =
    typeof req.body?.author === "string" ? req.body.author.trim() : "";

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  try {
    res.json(await fetchBookInfo({ title, author }));
  } catch (error) {
    console.error("Fetch Book Crash:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * @openapi
 * /api/ai/fetch-video:
 *   post:
 *     summary: Enrich a YouTube video with AI-generated metadata
 *     tags: [AI]
 */
export async function postFetchVideo(
  req: Request,
  res: Response,
): Promise<void> {
  const youtubeUrl =
    typeof req.body?.youtubeUrl === "string" ? req.body.youtubeUrl.trim() : "";

  if (!youtubeUrl) {
    res.status(400).json({ error: "YouTube URL is required" });
    return;
  }

  try {
    res.json(await fetchVideoInfo(youtubeUrl));
  } catch (error) {
    console.error("Fetch Video Crash:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
