import process from "process";
import { buildBaseUrl } from "./config/runtime-config.js";
import { loadServerEnv } from "./load-env.js";
import { createEmailQueueEngine } from "./services/email-queue.service.js";

loadServerEnv();

const port = Number(process.env.PORT || 3001) || 3001;
const baseUrl = buildBaseUrl(port);

function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.stack || err.message : String(err);
  const entry = `[${new Date().toISOString()}] [${context}] ${message}\n`;
  console.error(entry);
}

const emailQueueEngine = createEmailQueueEngine({
  baseUrl,
  logError,
});

emailQueueEngine.startWorker();
console.log(`📮 HBM email worker started (baseUrl=${baseUrl || "unset"})`);

process.on("unhandledRejection", (reason) => {
  console.error("[worker] Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[worker] Uncaught exception:", error);
});

process.on("SIGINT", () => {
  console.log("\n⏹️  Worker shutting down gracefully...");
  process.exit(0);
});
