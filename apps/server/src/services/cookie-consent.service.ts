import crypto from "crypto";
import { prisma } from "../db/prisma.js";

type CookieConsentLogInput = {
  choice?: string;
  settings?: unknown;
  ip?: string;
};

export function getRequestIp(
  ip: string | undefined,
  forwardedFor: string | string[] | undefined,
  remoteAddress: string | undefined,
): string {
  if (typeof ip === "string" && ip.trim()) return ip;
  if (Array.isArray(forwardedFor) && typeof forwardedFor[0] === "string") {
    return forwardedFor[0];
  }
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  if (typeof remoteAddress === "string" && remoteAddress.trim()) {
    return remoteAddress;
  }
  return "unknown";
}

export async function createCookieConsentLog({
  choice,
  settings,
  ip,
}: CookieConsentLogInput) {
  const hashedIp = crypto.createHash("sha256").update(ip || "unknown").digest("hex");

  return prisma.cookieConsentLog.create({
    data: {
      choice: choice || "custom",
      settings: JSON.stringify(settings || {}),
      hashedIp,
    },
  });
}

export async function listCookieConsentLogs() {
  return prisma.cookieConsentLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}
