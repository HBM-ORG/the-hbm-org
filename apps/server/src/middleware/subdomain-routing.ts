import type { NextFunction, Request, Response } from "express";

function buildRedirectTarget(origin: string, path: string): string {
  const safeOrigin = String(origin || "").trim().replace(/\/+$/, "");
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${safeOrigin}${safePath}`;
}

function getConfiguredHostname(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

export function subdomainRoutingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const host = String(req.headers.host || "").split(":")[0];
  const adminAppUrl = String(process.env.ADMIN_APP_URL || "").trim();
  const siteHost =
    getConfiguredHostname(String(process.env.SITE_PUBLIC_URL || "").trim())
    || getConfiguredHostname(String(process.env.SITE_APP_URL || "").trim());

  if (host.startsWith("admin.") && req.method === "GET" && !req.path.startsWith("/api")) {
    if (adminAppUrl) {
      res.redirect(buildRedirectTarget(adminAppUrl, req.originalUrl || "/"));
      return;
    }

    if (req.path === "/") {
      res.redirect("/admin-dashboard");
      return;
    }
  }

  if (siteHost && host === siteHost && req.path === "/admin-dashboard") {
    if (adminAppUrl) {
      res.redirect(buildRedirectTarget(adminAppUrl, "/"));
      return;
    }

    res.redirect("/admin");
    return;
  }

  next();
}
