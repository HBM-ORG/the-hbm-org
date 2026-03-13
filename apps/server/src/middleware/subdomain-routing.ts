import type { NextFunction, Request, Response } from "express";

function buildRedirectTarget(origin: string, path: string): string {
  const safeOrigin = String(origin || "").trim().replace(/\/+$/, "");
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${safeOrigin}${safePath}`;
}

export function subdomainRoutingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const host = req.headers.host || "";
  const adminAppUrl = String(process.env.ADMIN_APP_URL || "").trim();

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

  if ((host === "thehbm.org" || host === "www.thehbm.org") && req.path === "/admin-dashboard") {
    if (adminAppUrl) {
      res.redirect(buildRedirectTarget(adminAppUrl, "/"));
      return;
    }

    res.redirect("/admin");
    return;
  }

  next();
}
