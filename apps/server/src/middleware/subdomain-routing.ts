import type { NextFunction, Request, Response } from "express";

export function subdomainRoutingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const host = req.headers.host || "";

  if (host.startsWith("admin.") && req.path === "/") {
    res.redirect("/admin-dashboard");
    return;
  }

  next();
}
