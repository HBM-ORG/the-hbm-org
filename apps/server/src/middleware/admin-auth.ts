import type { NextFunction, Request, Response } from "express";
import { runtimeConfig } from "../config/runtime-config.js";

function getAdminPassword(req: Request): string {
  const header = req.headers["x-admin-password"];
  return typeof header === "string" ? header : "";
}

export async function isAuthorizedRequest(req: Request): Promise<boolean> {
  const adminPassword = getAdminPassword(req);
  const configuredPassword = runtimeConfig.adminPassword;

  if (!configuredPassword) {
    console.warn(
      `[Auth] ADMIN_PASSWORD is not configured for ${req.method} ${req.originalUrl}`,
    );
    return false;
  }

  if (!adminPassword) {
    console.warn(
      `[Auth] Missing admin password for ${req.method} ${req.originalUrl}`,
    );
    return false;
  }

  const isAuthorized = adminPassword === configuredPassword;
  if (!isAuthorized) {
    console.warn(
      `[Auth] Rejected admin password for ${req.method} ${req.originalUrl}`,
    );
  }

  return isAuthorized;
}

export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!(await isAuthorizedRequest(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
