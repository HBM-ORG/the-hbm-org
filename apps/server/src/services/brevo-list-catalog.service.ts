import { runtimeConfig } from "../config/runtime-config.js";

/**
 * Parse BREVO_LIST_IDS env (e.g. `general:3,event:3,video:9`) into a lowercase key → id map.
 * Single source of truth for catalog parsing used by Brevo upsert and admin UI.
 */
export function parseBrevoListCatalog(raw?: string): Record<string, number> {
  return String(raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, entry) => {
      const [label, id] = entry.split(":").map((value) => value.trim());
      const parsed = Number(id);
      if (label && Number.isFinite(parsed)) {
        acc[label.toLowerCase()] = parsed;
      }
      return acc;
    }, {});
}

export function getRuntimeBrevoListCatalog(): Record<string, number> {
  return parseBrevoListCatalog(runtimeConfig.brevoListIds);
}

export type ResolveListIdsResult = {
  listIds: number[];
  unknownKeys: string[];
};

/**
 * Map admin/env logical keys to numeric list ids. Unknown keys are reported and skipped.
 */
export function resolveListIdsFromKeys(
  keys: string[],
  catalog: Record<string, number>,
): ResolveListIdsResult {
  const listIds = new Set<number>();
  const unknownKeys: string[] = [];

  for (const raw of keys) {
    const key = String(raw || "")
      .trim()
      .toLowerCase();
    if (!key) continue;
    const id = catalog[key];
    if (Number.isFinite(id)) {
      listIds.add(id);
    } else {
      unknownKeys.push(key);
    }
  }

  return { listIds: Array.from(listIds), unknownKeys };
}

export function brevoCatalogToPublicEntries(
  catalog: Record<string, number>,
): Array<{ key: string; id: number }> {
  return Object.entries(catalog)
    .map(([key, id]) => ({ key, id }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
