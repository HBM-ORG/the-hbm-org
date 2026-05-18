import { Prisma } from "@prisma/client";
import { Buffer } from "buffer";
import { prisma } from "../db/prisma.js";

type JsonRecord = Record<string, unknown>;

type EmailQueuePayload = {
  email?: string;
  [key: string]: unknown;
};

export type EngagementEntry = {
  id: string;
  trackingId?: string | null;
  type: string;
  email: string;
  timestamp: string;
  metadata?: JsonRecord | null;
};

function asEmailQueuePayload(value: unknown): EmailQueuePayload {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as EmailQueuePayload)
    : {};
}

export function getEmailFromPayload(value: unknown): string {
  const email = asEmailQueuePayload(value).email;
  return typeof email === "string" ? email : "";
}

export async function resolveEmailForQueueItem(id: string): Promise<string> {
  try {
    const item = await prisma.emailQueue.findUnique({
      where: { id },
    });
    return getEmailFromPayload(item?.data) || "unknown";
  } catch {
    return "unknown";
  }
}

export async function logEngagement(
  trackingId: string,
  type: string,
  email: string,
  metadata: JsonRecord = {},
) : Promise<void> {
  await prisma.emailEngagement.create({
    data: {
      trackingId,
      eventType: type,
      email,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

export async function listEngagement(): Promise<EngagementEntry[]> {
  const rows = await prisma.emailEngagement.findMany({
    orderBy: { timestamp: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    trackingId: row.trackingId,
    type: row.eventType,
    email: row.email,
    timestamp: row.timestamp.toISOString(),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as JsonRecord)
        : null,
  }));
}

export function buildTrackingPixel(): Buffer {
  return Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
}
