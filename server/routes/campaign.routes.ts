/**
 * Campaign and suppression routes.
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import { createCampaignController } from "../controllers/campaign.controller.js";

type ProcessQueueFn = (specificItemId?: string | null) => Promise<boolean>;

type CampaignRoutesDeps = {
  campaignsFilePath: string;
  suppressionListPath: string;
  processQueue: ProcessQueueFn;
};

export function createCampaignRoutes({
  campaignsFilePath,
  suppressionListPath,
  processQueue,
}: CampaignRoutesDeps) {
  const router = Router();
  const controller = createCampaignController({
    campaignsFilePath,
    suppressionListPath,
    processQueue,
  });

  router.get("/campaigns", controller.listCampaigns);
  router.post("/campaigns", controller.createCampaign);
  router.post("/campaigns/save-all", controller.saveAllCampaigns);
  router.post("/campaigns/send", controller.sendCampaign);
  router.get("/unsubscribe", controller.getUnsubscribePage);
  router.post("/unsubscribe", controller.postUnsubscribe);
  router.get("/suppression", controller.getSuppression);
  router.post("/suppression/toggle", controller.toggleSuppression);

  return router;
}
