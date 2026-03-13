/**
 * Email Routes
 *
 * Route declarations only. Business logic lives in controllers/services.
 */

import { Router } from "express";
import { createEmailController } from "../controllers/email.controller.js";

type TriggerAutomationFn = (flowId: string, data?: unknown) => Promise<void>;
type ProcessQueueFn = (specificItemId?: string | null) => Promise<boolean>;

type EmailRoutesDeps = {
  processQueue: ProcessQueueFn;
  triggerAutomation: TriggerAutomationFn;
};

export function createEmailRoutes({
  processQueue,
  triggerAutomation,
}: EmailRoutesDeps) {
  const router = Router();
  const controller = createEmailController({ processQueue, triggerAutomation });

  router.get("/track/open/:id", controller.trackOpen);
  router.get("/track/click/:id", controller.trackClick);
  router.get("/engagement", controller.getEngagement);
  router.get("/email-queue", controller.getEmailQueue);
  router.post("/smtp-check", controller.smtpCheck);
  router.post("/automation/trigger", controller.triggerAutomation);
  router.post("/test-flow", controller.testFlow);

  return router;
}
