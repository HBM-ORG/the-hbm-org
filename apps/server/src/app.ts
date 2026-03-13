import express from "express";
import { mountStaticServing } from "./bootstrap/static-serving.js";
import { CLIENT_DIST_ROOT, CLIENT_PUBLIC_ROOT } from "./paths.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { createCampaignRoutes } from "./routes/campaign.routes.js";
import cmsRoutes from "./routes/cms.routes.js";
import contentRoutes from "./routes/content.routes.js";
import cookieConsentRoutes from "./routes/cookie-consent.routes.js";
import crmRoutes from "./routes/crm.routes.js";
import { createEmailRoutes } from "./routes/email.routes.js";
import { createRegistrationRoutes } from "./routes/registration.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.js";
import { subdomainRoutingMiddleware } from "./middleware/subdomain-routing.js";
import { createEmailQueueEngine } from "./services/email-queue.service.js";

type CreateAppOptions = {
  baseUrl: string;
  startWorker?: boolean;
};

type TriggerAutomationFn = (flowId: string, data?: unknown) => Promise<void>;

function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const entry = `[${new Date().toISOString()}] [${context}] ${message}\n`;
  console.error(entry);
}

function createTriggerAutomation(): TriggerAutomationFn {
  return async (flowId, _data) => {
    console.log(`Triggering automation for flowId: ${flowId}`);
  };
}

export function createApp({ baseUrl, startWorker = false }: CreateAppOptions) {
  const app = express();
  const triggerAutomation = createTriggerAutomation();

  const emailQueueEngine = createEmailQueueEngine({
    baseUrl,
    logError,
  });

  if (startWorker) {
    emailQueueEngine.startWorker();
  }

  app.set("trust proxy", 1);
  app.use(corsMiddleware);
  app.use(express.json());
  app.use("/api", authRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", cookieConsentRoutes);
  app.use("/api", cmsRoutes);
  app.use("/api", contentRoutes);
  app.use("/api", crmRoutes);
  app.use(
    "/api",
    createRegistrationRoutes({
      triggerAutomationByEvent: (triggerType, userData) =>
        emailQueueEngine.triggerAutomationByEvent(triggerType, userData),
    }),
  );
  app.use(
    "/api",
    createEmailRoutes({
      processQueue: (specificItemId) => emailQueueEngine.processQueue(specificItemId),
      triggerAutomation,
    }),
  );
  app.use(subdomainRoutingMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(
    "/api",
    createCampaignRoutes({
      processQueue: (specificItemId) => emailQueueEngine.processQueue(specificItemId),
    }),
  );

  mountStaticServing(app, {
    publicRoot: CLIENT_PUBLIC_ROOT,
    distRoot: CLIENT_DIST_ROOT,
  });

  return { app, emailQueueEngine };
}
