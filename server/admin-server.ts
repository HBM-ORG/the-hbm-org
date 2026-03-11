import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

dotenv.config();

import { mountStaticServing } from "./bootstrap/static-serving.js";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLoggingMiddleware } from "./middleware/request-logging.js";
import { subdomainRoutingMiddleware } from "./middleware/subdomain-routing.js";
import { createEmailQueueEngine } from "./services/email-queue.service.js";
import { createCampaignRoutes } from "./routes/campaign.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieConsentRoutes from "./routes/cookie-consent.routes.js";
import cmsRoutes from "./routes/cms.routes.js";
import contentRoutes from "./routes/content.routes.js";
import crmRoutes from "./routes/crm.routes.js";
import { createEmailRoutes } from "./routes/email.routes.js";
import { createRegistrationRoutes } from "./routes/registration.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

let emailQueueEngine: ReturnType<typeof createEmailQueueEngine> | null = null;

// Define triggerAutomation function
const triggerAutomation = async (flowId: string, _data?: unknown) => {
  console.log(`Triggering automation for flowId: ${flowId}`);
  // Add logic here
};

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();

// Trust reverse proxy (Hostinger)
app.set("trust proxy", 1);

app.use(corsMiddleware);
app.use(express.json());
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
      emailQueueEngine
        ? emailQueueEngine.triggerAutomationByEvent(triggerType, userData)
        : Promise.reject(new Error("Email queue engine not initialized")),
  }),
);
app.use(
  "/api",
  createEmailRoutes({
    processQueue: (specificItemId) =>
      emailQueueEngine
        ? emailQueueEngine.processQueue(specificItemId)
        : Promise.reject(new Error("Email queue engine not initialized")),
    triggerAutomation: (flowId, data) => triggerAutomation(flowId, data),
  }),
);
// --- Subdomain Routing ---
app.use(subdomainRoutingMiddleware);

// Middleware for logging
app.use(requestLoggingMiddleware);

// Global Paths
const AUTOMATION_CONFIG_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "automationConfig.json",
);
const SUPPRESSION_LIST_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "suppression.json",
);
const CAMPAIGNS_FILE_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "campaigns.json",
);

app.use(
  "/api",
  createCampaignRoutes({
    campaignsFilePath: CAMPAIGNS_FILE_PATH,
    suppressionListPath: SUPPRESSION_LIST_PATH,
    processQueue: (specificItemId) =>
      emailQueueEngine
        ? emailQueueEngine.processQueue(specificItemId)
        : Promise.reject(new Error("Email queue engine not initialized")),
  }),
);

const logError = (context: string, err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const entry = `[${new Date().toISOString()}] [${context}] ${message}\n`;
  console.error(entry);
};

emailQueueEngine = createEmailQueueEngine({
  automationConfigPath: AUTOMATION_CONFIG_PATH,
  campaignsFilePath: CAMPAIGNS_FILE_PATH,
  suppressionListPath: SUPPRESSION_LIST_PATH,
  baseUrl: BASE_URL || "http://localhost:3001",
  logError,
});
emailQueueEngine.startWorker();

// ==========================================
// SERVE STATIC ASSETS & PRODUCTION BUILD
// ==========================================
mountStaticServing(app, PROJECT_ROOT);

const SERVER_PORT = Number(PORT) || 3001;
const server = app.listen(SERVER_PORT, "0.0.0.0", () => {
  console.log(`🚀 HBM Server running on port ${SERVER_PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Serving dist from: ${path.join(PROJECT_ROOT, "dist")}`);
  console.log(
    `📚 Magic Fetch: GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? "set" : "NOT SET"}, GOOGLE_BOOKS_API_KEY=${process.env.GOOGLE_BOOKS_API_KEY ? "set" : "NOT SET"}`,
  );
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
