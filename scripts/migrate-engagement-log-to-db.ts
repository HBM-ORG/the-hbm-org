import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Prisma, PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const LEGACY_ENGAGEMENT_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "engagement.json",
);

type LegacyEngagementEntry = {
  id?: unknown;
  type?: unknown;
  email?: unknown;
  timestamp?: unknown;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toIsoDate(value: unknown): Date {
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

async function main() {
  if (!fs.existsSync(LEGACY_ENGAGEMENT_PATH)) {
    console.log("No legacy engagement.json file found. Nothing to import.");
    return;
  }

  const raw = JSON.parse(
    fs.readFileSync(LEGACY_ENGAGEMENT_PATH, "utf8"),
  ) as unknown;
  const entries = Array.isArray(raw) ? raw : [];

  if (entries.length === 0) {
    console.log("Legacy engagement.json is empty. Nothing to import.");
    return;
  }

  const existingCount = await prisma.emailEngagement.count();
  if (existingCount > 0) {
    console.log(
      `EmailEngagement already has ${existingCount} rows. Skipping import to avoid duplicates.`,
    );
    return;
  }

  let imported = 0;
  for (const entry of entries) {
    if (!isRecord(entry)) continue;

    const typed = entry as LegacyEngagementEntry;
    const metadata = { ...typed };
    delete metadata.id;
    delete metadata.type;
    delete metadata.email;
    delete metadata.timestamp;

    await prisma.emailEngagement.create({
      data: {
        trackingId: typeof typed.id === "string" ? typed.id : null,
        eventType: typeof typed.type === "string" ? typed.type : "unknown",
        email: typeof typed.email === "string" ? typed.email : "unknown",
        timestamp: toIsoDate(typed.timestamp),
        ...(Object.keys(metadata).length
          ? { metadata: metadata as Prisma.InputJsonValue }
          : {}),
      },
    });

    imported += 1;
  }

  console.log(`Imported ${imported} engagement entries into EmailEngagement.`);
}

main()
  .catch((error) => {
    console.error("Engagement log migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
