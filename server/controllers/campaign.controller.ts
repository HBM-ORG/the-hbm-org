import type { Request, Response } from "express";
import {
  createCampaign,
  listCampaigns,
  queueCampaignSend,
  saveAllCampaigns,
  type CampaignDefinition,
} from "../services/campaign.service.js";
import {
  buildUnsubscribeHtml,
  listSuppression,
  toggleSuppressionEmail,
  unsubscribeEmail,
} from "../services/suppression.service.js";

type ProcessQueueFn = (specificItemId?: string | null) => Promise<boolean>;

type CampaignControllerDeps = {
  campaignsFilePath: string;
  suppressionListPath: string;
  processQueue: ProcessQueueFn;
};

function getQueryString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function createCampaignController({
  campaignsFilePath,
  suppressionListPath,
  processQueue,
}: CampaignControllerDeps) {
  return {
    async listCampaigns(_req: Request, res: Response): Promise<void> {
      res.json(listCampaigns(campaignsFilePath));
    },

    async createCampaign(req: Request, res: Response): Promise<void> {
      try {
        const campaign = createCampaign(
          campaignsFilePath,
          (req.body || {}) as Record<string, unknown>,
        );
        res.json({ success: true, campaign });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to create campaign",
        });
      }
    },

    async saveAllCampaigns(req: Request, res: Response): Promise<void> {
      try {
        const campaigns = Array.isArray(req.body?.campaigns)
          ? (req.body.campaigns as CampaignDefinition[])
          : [];
        saveAllCampaigns(campaignsFilePath, campaigns);
        res.json({ success: true, message: "All campaigns saved" });
      } catch (error) {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Failed to save all campaigns",
        });
      }
    },

    async sendCampaign(req: Request, res: Response): Promise<void> {
      const campaignId =
        typeof req.body?.campaignId === "string" ? req.body.campaignId : "";
      const segment = typeof req.body?.segment === "string" ? req.body.segment : "all";

      try {
        const result = await queueCampaignSend(campaignsFilePath, {
          campaignId,
          segment,
        });
        res.json({ success: true, count: result.count });

        processQueue().catch((error) => {
          console.error("[Email] Campaign process failed:", error);
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to send campaign";
        const status =
          message === "No campaigns file" || message === "Campaign not found"
            ? 404
            : 500;
        res.status(status).json({ error: message });
      }
    },

    getUnsubscribePage(req: Request, res: Response): void {
      const email = getQueryString(req.query.email);
      res.send(buildUnsubscribeHtml(email));
    },

    postUnsubscribe(req: Request, res: Response): void {
      const email = getQueryString(req.query.email);
      if (!email) {
        res.status(400).send("Email missing");
        return;
      }

      try {
        unsubscribeEmail(suppressionListPath, email);
        res.send(buildUnsubscribeHtml(email));
      } catch {
        res.status(500).send("Error");
      }
    },

    getSuppression(_req: Request, res: Response): void {
      res.json(listSuppression(suppressionListPath));
    },

    toggleSuppression(req: Request, res: Response): void {
      const email = typeof req.body?.email === "string" ? req.body.email : "";

      try {
        const list = toggleSuppressionEmail(suppressionListPath, email);
        res.json({ success: true, list });
      } catch (error) {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : "Failed to toggle suppression",
        });
      }
    },
  };
}
