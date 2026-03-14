import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(SERVER_ROOT, "..", "..");

dotenv.config({ path: path.join(SERVER_ROOT, ".env") });
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), override: false });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const modelsArg = args.find((arg) => arg.startsWith("--models="));
const selectedModels = modelsArg
  ? new Set(
      modelsArg
        .slice("--models=".length)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
  : null;

const sourceDatabaseUrl =
  process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL || "";
const targetDatabaseUrl = process.env.TARGET_DATABASE_URL || "";

if (!sourceDatabaseUrl) {
  throw new Error(
    "Missing SOURCE_DATABASE_URL. You can also use DATABASE_URL as the source.",
  );
}

if (!targetDatabaseUrl) {
  throw new Error("Missing TARGET_DATABASE_URL.");
}

if (sourceDatabaseUrl === targetDatabaseUrl) {
  throw new Error("SOURCE_DATABASE_URL and TARGET_DATABASE_URL must be different.");
}

const source = new PrismaClient({
  datasources: { db: { url: sourceDatabaseUrl } },
});

const target = new PrismaClient({
  datasources: { db: { url: targetDatabaseUrl } },
});

type SyncSummary = {
  model: string;
  sourceCount: number;
  existingCount: number;
  createdCount: number;
  skippedCount: number;
};

function shouldSync(model: string): boolean {
  return !selectedModels || selectedModels.has(model);
}

function omitKeys<T extends Record<string, unknown>>(
  row: T,
  keys: string[],
): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...row };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

function asDateString(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value || "");
}

function logSummary(summary: SyncSummary): void {
  console.log(
    [
      `model=${summary.model}`,
      `source=${summary.sourceCount}`,
      `existing=${summary.existingCount}`,
      `created=${summary.createdCount}`,
      `skipped=${summary.skippedCount}`,
    ].join(" "),
  );
}

async function ensureTargetSchemaReady(): Promise<void> {
  const tables = [
    "CookieConsentLog",
    "EmailQueue",
    "EmailEngagement",
    "Registration",
    "Event",
    "TeamMember",
    "Testimonial",
    "Partner",
    "EmailFlow",
    "EmailSequence",
    "SmtpConfig",
    "GlobalStyling",
    "EmailCampaign",
    "EmailSuppression",
    "ContentEntry",
  ];

  const missing: string[] = [];
  for (const table of tables) {
    const rows = await target.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SHOW TABLES LIKE '${table}'`,
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        `Target database is missing tables: ${missing.join(", ")}`,
        "Run migrations first, for example:",
        'DATABASE_URL="<target-db-url>" npm --prefix apps/server run prisma:migrate:deploy',
      ].join("\n"),
    );
  }
}

async function syncRows<TSource, TTarget>(config: {
  model: string;
  loadSourceRows: () => Promise<TSource[]>;
  loadTargetRows: () => Promise<TTarget[]>;
  sourceKey: (row: TSource) => string;
  targetKey: (row: TTarget) => string;
  createOnTarget: (row: TSource) => PromiseLike<unknown>;
}): Promise<void> {
  if (!shouldSync(config.model)) {
    return;
  }

  console.log(`\n== Syncing ${config.model} ==`);
  const sourceRows = await config.loadSourceRows();
  const targetRows = await config.loadTargetRows();
  const existingKeys = new Set(
    targetRows.map(config.targetKey).filter((value) => value.trim().length > 0),
  );

  let createdCount = 0;
  let skippedCount = 0;

  for (const row of sourceRows) {
    const key = config.sourceKey(row);
    if (key && existingKeys.has(key)) {
      skippedCount += 1;
      continue;
    }

    if (!dryRun) {
      await config.createOnTarget(row);
    }

    createdCount += 1;
    if (key) {
      existingKeys.add(key);
    }
  }

  logSummary({
    model: config.model,
    sourceCount: sourceRows.length,
    existingCount: targetRows.length,
    createdCount,
    skippedCount,
  });
}

async function main(): Promise<void> {
  console.log(
    dryRun
      ? "Running DB delta sync in dry-run mode."
      : "Running DB delta sync (missing rows only).",
  );

  if (selectedModels?.size) {
    console.log(`Selected models: ${Array.from(selectedModels).join(", ")}`);
  }

  await ensureTargetSchemaReady();

  await syncRows({
    model: "cookie-consent",
    loadSourceRows: () =>
      source.cookieConsentLog.findMany({ orderBy: { timestamp: "asc" } }),
    loadTargetRows: () =>
      target.cookieConsentLog.findMany({
        select: { timestamp: true, choice: true, hashedIp: true },
      }),
    sourceKey: (row: any) =>
      `${asDateString(row.timestamp)}|${row.choice}|${row.hashedIp}`,
    targetKey: (row: any) =>
      `${asDateString(row.timestamp)}|${row.choice}|${row.hashedIp}`,
    createOnTarget: (row: any) =>
      target.cookieConsentLog.create({ data: omitKeys(row, ["id"]) as any }),
  });

  await syncRows({
    model: "email-queue",
    loadSourceRows: () =>
      source.emailQueue.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () => target.emailQueue.findMany({ select: { id: true } }),
    sourceKey: (row: any) => row.id,
    targetKey: (row: any) => row.id,
    createOnTarget: (row: any) => target.emailQueue.create({ data: row as any }),
  });

  await syncRows({
    model: "email-engagement",
    loadSourceRows: () =>
      source.emailEngagement.findMany({ orderBy: { timestamp: "asc" } }),
    loadTargetRows: () => target.emailEngagement.findMany({ select: { id: true } }),
    sourceKey: (row: any) => row.id,
    targetKey: (row: any) => row.id,
    createOnTarget: (row: any) =>
      target.emailEngagement.create({ data: row as any }),
  });

  await syncRows({
    model: "registrations",
    loadSourceRows: () =>
      source.registration.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.registration.findMany({
        select: { email: true, eventId: true, createdAt: true },
      }),
    sourceKey: (row: any) =>
      `${String(row.email || "").toLowerCase()}|${row.eventId || ""}|${asDateString(row.createdAt)}`,
    targetKey: (row: any) =>
      `${String(row.email || "").toLowerCase()}|${row.eventId || ""}|${asDateString(row.createdAt)}`,
    createOnTarget: (row: any) =>
      target.registration.create({
        data: omitKeys(row, ["id"]) as any,
      }),
  });

  await syncRows({
    model: "events",
    loadSourceRows: () => source.event.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.event.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) => target.event.create({ data: row as any }),
  });

  await syncRows({
    model: "team-members",
    loadSourceRows: () =>
      source.teamMember.findMany({ orderBy: { displayOrder: "asc" } }),
    loadTargetRows: () =>
      target.teamMember.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) => target.teamMember.create({ data: row as any }),
  });

  await syncRows({
    model: "testimonials",
    loadSourceRows: () =>
      source.testimonial.findMany({ orderBy: { displayOrder: "asc" } }),
    loadTargetRows: () =>
      target.testimonial.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) =>
      target.testimonial.create({ data: row as any }),
  });

  await syncRows({
    model: "partners",
    loadSourceRows: () =>
      source.partner.findMany({ orderBy: { displayOrder: "asc" } }),
    loadTargetRows: () =>
      target.partner.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) => target.partner.create({ data: row as any }),
  });

  await syncRows({
    model: "email-flows",
    loadSourceRows: () =>
      source.emailFlow.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.emailFlow.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) => target.emailFlow.create({ data: row as any }),
  });

  await syncRows({
    model: "email-sequences",
    loadSourceRows: () =>
      source.emailSequence.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.emailSequence.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) =>
      target.emailSequence.create({ data: row as any }),
  });

  await syncRows({
    model: "smtp-config",
    loadSourceRows: () => source.smtpConfig.findMany(),
    loadTargetRows: () => target.smtpConfig.findMany({ select: { id: true } }),
    sourceKey: (row: any) => row.id,
    targetKey: (row: any) => row.id,
    createOnTarget: (row: any) => target.smtpConfig.create({ data: row as any }),
  });

  await syncRows({
    model: "global-styling",
    loadSourceRows: () => source.globalStyling.findMany(),
    loadTargetRows: () => target.globalStyling.findMany({ select: { id: true } }),
    sourceKey: (row: any) => row.id,
    targetKey: (row: any) => row.id,
    createOnTarget: (row: any) =>
      target.globalStyling.create({ data: row as any }),
  });

  await syncRows({
    model: "email-campaigns",
    loadSourceRows: () =>
      source.emailCampaign.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.emailCampaign.findMany({ select: { id: true, legacyId: true } }),
    sourceKey: (row: any) => row.legacyId || row.id,
    targetKey: (row: any) => row.legacyId || row.id,
    createOnTarget: (row: any) =>
      target.emailCampaign.create({ data: row as any }),
  });

  await syncRows({
    model: "email-suppression",
    loadSourceRows: () =>
      source.emailSuppression.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () =>
      target.emailSuppression.findMany({ select: { email: true } }),
    sourceKey: (row: any) => row.email,
    targetKey: (row: any) => row.email,
    createOnTarget: (row: any) =>
      target.emailSuppression.create({ data: row as any }),
  });

  await syncRows({
    model: "content-entries",
    loadSourceRows: () =>
      source.contentEntry.findMany({ orderBy: { createdAt: "asc" } }),
    loadTargetRows: () => target.contentEntry.findMany({ select: { key: true } }),
    sourceKey: (row: any) => row.key,
    targetKey: (row: any) => row.key,
    createOnTarget: (row: any) => target.contentEntry.create({ data: row as any }),
  });

  console.log("\nDB delta sync completed.");
}

main()
  .catch((error) => {
    console.error("\nDB delta sync failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([source.$disconnect(), target.$disconnect()]);
  });
