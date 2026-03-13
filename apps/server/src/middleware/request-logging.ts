import type { NextFunction, Request, Response } from "express";

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const shouldSkip = req.path.startsWith("/assets/");
  const startedAt = Date.now();

  if (!shouldSkip) {
    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const isApiRequest = req.path.startsWith("/api");
      const shouldLog =
        isApiRequest ||
        req.path === "/visual-sitemap.html" ||
        req.path === "/sitemap.xml" ||
        res.statusCode >= 400;

      if (!shouldLog) {
        return;
      }

      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode} (${durationMs}ms, Host: ${req.headers.host})`,
      );
    });
  }

  next();
}
