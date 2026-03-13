import type { Request, Response } from "express";
import {
  getEmailQueueItemError,
  listEmailQueueItems,
  queueTestFlow,
  verifySmtpConnection,
} from "../services/email-admin.service.js";
import {
  buildTrackingPixel,
  listEngagement,
  logEngagement,
  resolveEmailForQueueItem,
} from "../services/email-tracking.service.js";
import { runtimeConfig } from "../config/runtime-config.js";

type TriggerAutomationFn = (flowId: string, data?: unknown) => Promise<void>;
type ProcessQueueFn = (specificItemId?: string | null) => Promise<boolean>;

type EmailControllerDeps = {
  processQueue: ProcessQueueFn;
  triggerAutomation: TriggerAutomationFn;
};

function getQueryString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getRouteParam(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function createEmailController({
  processQueue,
  triggerAutomation,
}: EmailControllerDeps) {
  return {
    /**
     * @openapi
     * /api/track/open/{id}:
     *   get:
     *     summary: Register email open tracking
     *     tags: [Email]
     */
    async trackOpen(req: Request, res: Response): Promise<void> {
      const id = getRouteParam(req.params.id);
      const email = await resolveEmailForQueueItem(id);
      await logEngagement(id, "open", email);

      const pixel = buildTrackingPixel();
      res
        .writeHead(200, {
          "Content-Type": "image/gif",
          "Content-Length": pixel.length,
        })
        .end(pixel);
    },

    /**
     * @openapi
     * /api/track/click/{id}:
     *   get:
     *     summary: Register email click tracking
     *     tags: [Email]
     */
    async trackClick(req: Request, res: Response): Promise<void> {
      const id = getRouteParam(req.params.id);
      const email = await resolveEmailForQueueItem(id);
      await logEngagement(id, "click", email);
      const target = getQueryString(req.query.url) || runtimeConfig.publicSiteUrl;
      res.redirect(target);
    },

    /**
     * @openapi
     * /api/engagement:
     *   get:
     *     summary: List engagement log entries
     *     tags: [Email]
     */
    async getEngagement(_req: Request, res: Response): Promise<void> {
      res.json(await listEngagement());
    },

    /**
     * @openapi
     * /api/email-queue:
     *   get:
     *     summary: List email queue items
     *     tags: [Email]
     */
    async getEmailQueue(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await listEmailQueueItems());
      } catch (error) {
        console.error("[Email] GET queue error:", error);
        res.json([]);
      }
    },

    /**
     * @openapi
     * /api/smtp-check:
     *   post:
     *     summary: Verify SMTP connectivity
     *     tags: [Email]
     */
    async smtpCheck(req: Request, res: Response): Promise<void> {
      res.json(await verifySmtpConnection(req.body || {}));
    },

    /**
     * @openapi
     * /api/automation/trigger:
     *   post:
     *     summary: Manually trigger automation flow
     *     tags: [Email]
     */
    async triggerAutomation(req: Request, res: Response): Promise<void> {
      const flowId = typeof req.body?.flowId === "string" ? req.body.flowId : "";
      const data = req.body?.data;

      try {
        await triggerAutomation(flowId, data);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to trigger flow",
        });
      }
    },

    /**
     * @openapi
     * /api/test-flow:
     *   post:
     *     summary: Queue and send test flow email
     *     tags: [Email]
     */
    async testFlow(req: Request, res: Response): Promise<void> {
      const email = typeof req.body?.email === "string" ? req.body.email : "";
      const flowId = typeof req.body?.flowId === "string" ? req.body.flowId : "";
      const language =
        typeof req.body?.language === "string" ? req.body.language : "en";

      try {
        const { itemId } = await queueTestFlow({ email, flowId, language });
        const success = await processQueue(itemId);

        if (success) {
          res.json({
            success: true,
            message: "Test email delivered successfully!",
          });
          return;
        }

        res.status(500).json({
          error: (await getEmailQueueItemError(itemId)) || "Unknown delivery failure",
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to send test flow",
        });
      }
    },
  };
}
