import process from "process";
import { createApp } from "./app.js";
import { buildBaseUrl } from "./config/runtime-config.js";
import { loadServerEnv } from "./load-env.js";
import { CLIENT_DIST_ROOT } from "./paths.js";

loadServerEnv();

type RunningServer = {
  close: (callback?: (error?: Error) => void) => void;
};

export function startWebServer(): RunningServer {
  const port = Number(process.env.PORT || 3001) || 3001;
  const baseUrl = buildBaseUrl(port);
  const shouldRunWorker =
    process.env.RUN_EMAIL_WORKER === "true"
    || process.env.RUN_EMAIL_WORKER === "1";
  const { app } = createApp({ baseUrl, startWorker: shouldRunWorker });

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 HBM Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📁 Serving dist from: ${CLIENT_DIST_ROOT}`);
    console.log(
      `📚 Magic Fetch: GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? "set" : "NOT SET"}, GOOGLE_BOOKS_API_KEY=${process.env.GOOGLE_BOOKS_API_KEY ? "set" : "NOT SET"}`,
    );
    console.log(`📦 Worker in web process: ${shouldRunWorker ? "enabled" : "disabled"}`);
  });

  process.on("SIGINT", () => {
    console.log("\n⏹️  Shutting down gracefully...");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });

  return server;
}

startWebServer();
