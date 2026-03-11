import type { NextFunction, Request, Response } from "express";

export function requestLoggingMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.path !== "/api/events" && !req.path.startsWith("/assets/")) {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} (Host: ${req.headers.host})`,
    );
  }

  next();
}
