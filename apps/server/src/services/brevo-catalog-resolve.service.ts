import {
  getRuntimeBrevoListCatalog,
  parseBrevoListCatalog,
} from "./brevo-list-catalog.service.js";
import { getSiteSettingsConfig } from "./content.service.js";

/**
 * Site Settings can override env `BREVO_LIST_IDS` with the same comma/colon format.
 * When the override is non-empty it replaces the env catalog entirely for resolution.
 */
export async function getEffectiveBrevoListCatalog(): Promise<
  Record<string, number>
> {
  const site = await getSiteSettingsConfig();
  const raw = site.brevo?.listIdsOverride?.trim();
  if (raw) {
    return parseBrevoListCatalog(raw);
  }
  return getRuntimeBrevoListCatalog();
}
