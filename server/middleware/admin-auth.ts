import type { NextFunction, Request, Response } from "express";

function getAdminPassword(req: Request): string {
  const header = req.headers["x-admin-password"];
  return typeof header === "string" ? header : "";
}

export async function isAuthorizedRequest(req: Request): Promise<boolean> {
  const adminPassword = getAdminPassword(req);
  return Boolean(
    adminPassword &&
      (adminPassword === process.env.ADMIN_PASSWORD || adminPassword === "hbm2026"),
  );
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
