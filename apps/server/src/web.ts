import http from "node:http";
import process from "process";
import { createApp } from "./app.js";
import { buildBaseUrl } from "./config/runtime-config.js";
import { loadServerEnv } from "./load-env.js";
import { SITE_DIST_ROOT } from "./paths.js";

loadServerEnv();

type RunningServer = {
  close: (callback?: (error?: Error) => void) => void;
};

/** Attach listeners before calling `listen()` (Node emits `error` synchronously on some failures). */
function listenOnce(server: http.Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (err: NodeJS.ErrnoException) => {
      server.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

export async function startWebServer(): Promise<RunningServer> {
  const requestedPort = Number(process.env.PORT || 3001) || 3001;
  const shouldRunWorker =
    process.env.RUN_EMAIL_WORKER === "true"
    || process.env.RUN_EMAIL_WORKER === "1";
  const baseUrl = buildBaseUrl(requestedPort);
  const { app } = createApp({ baseUrl, startWorker: shouldRunWorker });

  /** In production bind exactly `PORT`; in dev bump if busy (old dev server still running). Set `HBM_STICKY_PORT=1` to mimic production. */
  const stickyBind =
    process.env.NODE_ENV === "production"
    || process.env.HBM_STICKY_PORT === "1";

  process.on("unhandledRejection", (reason) => {
    console.error("[web] Unhandled rejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[web] Uncaught exception:", error);
  });

  const maxAttempts = stickyBind ? 1 : 20;
  let port = requestedPort;
  let server: http.Server | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const s = http.createServer(app);
    try {
      await listenOnce(s, port, "0.0.0.0");
      server = s;
      break;
    } catch (err) {
      const errno = err as NodeJS.ErrnoException;
      if (
        errno.code === "EADDRINUSE"
        && !stickyBind
        && attempt < maxAttempts - 1
      ) {
        console.warn(
          `⚠️  Port ${port} is busy; trying ${port + 1}. (Production or HBM_STICKY_PORT=1 uses PORT only.)`,
        );
        port += 1;
        continue;
      }
      if (errno.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${port} is already in use. Stop the other process or set PORT. (Locally: unset NODE_ENV production and omit HBM_STICKY_PORT=1 to try the next free port.)`,
        );
      } else {
        console.error("[web] Listen error:", errno.message);
      }
      process.exit(1);
    }
  }

  if (!server) {
    process.exit(1);
  }

  if (port !== requestedPort && !stickyBind) {
    console.log(`ℹ️  Listening on ${port} (requested ${requestedPort}).`);
  }

  console.log(`🚀 HBM Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Serving site dist from: ${SITE_DIST_ROOT}`);
  console.log(
    `📚 Magic Fetch: GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? "set" : "NOT SET"}, GOOGLE_BOOKS_API_KEY=${process.env.GOOGLE_BOOKS_API_KEY ? "set" : "NOT SET"}`,
  );
  console.log(`📦 Worker in web process: ${shouldRunWorker ? "enabled" : "disabled"}`);

  process.on("SIGINT", () => {
    console.log("\n⏹️  Shutting down gracefully...");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });

  return server;
}

startWebServer().catch((error) => {
  console.error("[web] Failed to start:", error);
  process.exit(1);
});
