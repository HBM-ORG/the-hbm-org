import type { NextFunction, Request, Response } from "express";

export const ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "https://admin.thehbm.org",
  "https://www.admin.thehbm.org",
  "https://thehbm.org",
  "https://www.thehbm.org",
  "http://localhost:4200",
  "http://localhost:4201",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:4201",
];

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}
