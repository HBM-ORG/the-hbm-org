import { PrismaClient } from "@prisma/client";
import {
  getEffectiveBrevoListCatalog,
} from "./brevo-catalog-resolve.service.js";
import {
  resolveListIdsFromKeys,
} from "./brevo-list-catalog.service.js";
import {
  getSiteSettingsConfig,
  getVideoEventConfig,
  type SiteSettingsConfig,
} from "./content.service.js";

const prisma = new PrismaClient();

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeListKey(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** When strategy is heuristic, Brevo upsert uses deriveBrevoListIdsWithCatalog + effective list catalog. */
export type BrevoListsForSync =
  | { strategy: "heuristic" }
  | { strategy: "explicit"; listIds: number[] };

function applyAppendGeneral(
  listIds: number[],
  site: SiteSettingsConfig,
  catalog: Record<string, number>,
): number[] {
  if (!site.brevo?.appendGeneralListToCta) {
    return listIds;
  }
  const generalId = catalog.general;
  if (!Number.isFinite(generalId)) {
    return listIds;
  }
  const merged = new Set(listIds);
  merged.add(generalId);
  return Array.from(merged);
}

/**
 * Resolve Brevo list IDs for POST /api/register.
 * If the relevant admin field is unset, returns heuristic (existing category-based behavior).
 *
 * Policy: configured non-empty key → explicit list ids (optional +general via site settings).
 * Unknown keys are logged and omitted; if none resolve, falls back to heuristic.
 */
export async function resolveBrevoListsForRegister(
  eventId: string,
  siteSettings?: SiteSettingsConfig,
): Promise<BrevoListsForSync> {
  const catalog = await getEffectiveBrevoListCatalog();
  const site = siteSettings ?? (await getSiteSettingsConfig());
  const normalizedEventId = String(eventId || "").trim();

  let configuredKey = "";

  if (normalizedEventId === "video-event") {
    const video = await getVideoEventConfig();
    configuredKey = normalizeListKey(video.brevoListKey);
  } else if (normalizedEventId && normalizedEventId !== "general") {
    const row = await prisma.event.findFirst({
      where: {
        OR: [{ id: normalizedEventId }, { legacyId: normalizedEventId }],
      },
      select: { registration: true },
    });
    const reg = row?.registration;
    if (isRecord(reg)) {
      configuredKey = normalizeListKey(reg.brevoListKey);
    }
  }

  if (!configuredKey) {
    return { strategy: "heuristic" };
  }

  const { listIds, unknownKeys } = resolveListIdsFromKeys([configuredKey], catalog);
  if (unknownKeys.length) {
    console.warn(
      `[Brevo CTA] Unknown brevoListKey(s) for register eventId=${normalizedEventId}: ${unknownKeys.join(", ")}`,
    );
  }

  if (listIds.length === 0) {
    return { strategy: "heuristic" };
  }

  return {
    strategy: "explicit",
    listIds: applyAppendGeneral(listIds, site, catalog),
  };
}

/**
 * Resolve Brevo list IDs for POST /api/newsletter (e.g. “Be Part” footer).
 */
export async function resolveBrevoListsForNewsletter(
  siteSettings?: SiteSettingsConfig,
): Promise<BrevoListsForSync> {
  const catalog = await getEffectiveBrevoListCatalog();
  const site = siteSettings ?? (await getSiteSettingsConfig());
  const configuredKey = normalizeListKey(site.brevo?.newsletterListKey ?? "");

  if (!configuredKey) {
    return { strategy: "heuristic" };
  }

  const { listIds, unknownKeys } = resolveListIdsFromKeys([configuredKey], catalog);
  if (unknownKeys.length) {
    console.warn(
      `[Brevo CTA] Unknown newsletter brevoListKey: ${unknownKeys.join(", ")}`,
    );
  }

  if (listIds.length === 0) {
    return { strategy: "heuristic" };
  }

  return {
    strategy: "explicit",
    listIds: applyAppendGeneral(listIds, site, catalog),
  };
}
