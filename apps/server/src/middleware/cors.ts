import type { NextFunction, Request, Response } from "express";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.SITE_APP_URL,
    process.env.ADMIN_APP_URL,
    process.env.SITE_PUBLIC_URL,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(normalizeOrigin);

  return [...new Set(configured)];
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  const normalizedOrigin = origin ? normalizeOrigin(origin) : "";
  const allowLocalOrigin =
    process.env.NODE_ENV !== "production"
    && normalizedOrigin
    && isLocalDevelopmentOrigin(normalizedOrigin);

  if (origin && (allowedOrigins.includes(normalizedOrigin) || allowLocalOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  const requestedHeaders = req.headers["access-control-request-headers"];
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    typeof requestedHeaders === "string" && requestedHeaders.trim()
      ? requestedHeaders
      : "Content-Type, Authorization, X-Admin-Password",
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}
