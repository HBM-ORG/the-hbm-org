import type { NextFunction, Request, Response } from "express";

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const shouldSkip = req.path.startsWith("/assets/");
  const startedAt = Date.now();
  const isApiRequest = req.path.startsWith("/api");
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "-";
  const userAgent = typeof req.headers["user-agent"] === "string"
    ? req.headers["user-agent"]
    : "-";

  if (!shouldSkip) {
    if (isApiRequest) {
      console.log(
        `[${new Date().toISOString()}] --> ${req.method} ${req.url} (Host: ${req.headers.host}, Origin: ${origin}, UA: ${userAgent})`,
      );
    }

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const shouldLog =
        isApiRequest ||
        req.path === "/visual-sitemap.html" ||
        req.path === "/sitemap.xml" ||
        res.statusCode >= 400;

      if (!shouldLog) {
        return;
      }

      console.log(
        `[${new Date().toISOString()}] <-- ${req.method} ${req.url} -> ${res.statusCode} (${durationMs}ms, Host: ${req.headers.host}, Origin: ${origin})`,
      );
    });
  }

  next();
}
