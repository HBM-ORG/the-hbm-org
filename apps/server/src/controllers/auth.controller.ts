import type { Request, Response } from "express";
import { isAuthorizedRequest } from "../middleware/admin-auth.js";

export async function checkAdminAuth(
  req: Request,
  res: Response,
): Promise<void> {
  if (!(await isAuthorizedRequest(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({ success: true });
}
