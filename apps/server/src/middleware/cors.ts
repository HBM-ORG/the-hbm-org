import type { NextFunction, Request, Response } from "express";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.SITE_APP_URL,
    process.env.ADMIN_APP_URL,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(normalizeOrigin);

  return [
    "http://localhost:4200",
    "http://localhost:4300",
    "https://admin.thehbm.org",
    "https://www.admin.thehbm.org",
    "https://thehbm.org",
    "https://www.thehbm.org",
    "http://localhost:4201",
    "http://127.0.0.1:4200",
    "http://127.0.0.1:4300",
    "http://127.0.0.1:4201",
    ...configured,
  ];
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  if (origin && allowedOrigins.includes(normalizeOrigin(origin))) {
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
