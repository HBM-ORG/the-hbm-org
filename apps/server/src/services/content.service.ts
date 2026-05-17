import { Prisma, PrismaClient } from "@prisma/client";
import type {
  ContentLockTarget,
  HowItWorksConfig,
  KnowledgeBaseConfig,
  RegistrationFieldsConfig,
  VideoEventConfig,
} from "../types/content.js";
import { runtimeConfig } from "../config/runtime-config.js";
import { normalizeCtaFormFields } from "../utils/cta-form-fields.js";
import { DateTime } from "luxon";
import {
  coerceWallCalendarDate,
  coerceWallClockTime,
  normalizeEventTimezone,
} from "../../../../lib/zoned-schedule.js";

const prisma = new PrismaClient();
const VIDEO_EVENT_KEY = "videoEvent";
const HOW_IT_WORKS_KEY = "howItWorks";
const KNOWLEDGE_BASE_KEY = "knowledgeBase";
const SITE_SETTINGS_KEY = "siteSettings";
const DEFAULT_JOIN_MOVEMENT_VIDEO_URL =
  "https://test-org-site-media-files.nyc3.digitaloceanspaces.com/legacy/wordpress-media/2025/05/banner-video.mp4";

const DEFAULT_SITE_SETTINGS = Object.freeze({
  organizationName: "The HBM",
  contactEmail: "office@thehbm.org",
  whatsappPhoneE164: "972587073136",
  whatsappPhoneDisplay: "0587073136",
  socialLinks: Object.freeze({
    instagram: "https://www.instagram.com/the__hbm/",
    facebook: "https://www.facebook.com/people/The-HBM/61573100935457/",
    linkedin: "https://www.linkedin.com/company/the-human-being-movement/",
    youtube: "https://www.youtube.com/@TheHBM",
  }),
  inquiryWhatsappMessage: "אשמח לקבל פרטים נוספים על הארגון",
  siteMedia: Object.freeze({
    joinMovementVideoUrl: DEFAULT_JOIN_MOVEMENT_VIDEO_URL,
  }),
  brevo: Object.freeze({
    newsletterListKey: "newsletter",
    ctaBypassEmailArchitect: false,
    /** When CTAs bypass architect, still fire Email Architect for “Be Part” / footer newsletter if true. */
    bePartUsesEmailArchitect: false,
    appendGeneralListToCta: false,
    listIdsOverride: "",
    /** When false, Brevo contact upserts omit SMS; public marketing opt-in copy mentions email only. */
    syncSmsAttributeToBrevo: true,
  }),
});

export function getDefaultSiteSettingsConfig(): SiteSettingsConfig {
  return normalizeSiteSettingsConfig({});
}

export function getDefaultVideoEventConfig(): VideoEventConfig {
  return normalizeVideoEventConfig({
    title: {
      en: runtimeConfig.defaultVideoEventTitleEn,
      he: runtimeConfig.defaultVideoEventTitleHe,
    },
    timezone: normalizeEventTimezone(""),
    date: new Date().toISOString().slice(0, 10),
    time: runtimeConfig.defaultVideoEventTime,
    location: runtimeConfig.defaultVideoEventLocation,
    image: "",
    participants: 0,
    registrationFields: { name: true, email: true, phone: true },
    brevoListKey: "",
  });
}

export function getDefaultHowItWorksConfig(): HowItWorksConfig {
  return withLockState(normalizeHowItWorksConfig({}), false);
}

export function getDefaultKnowledgeBaseConfig(): KnowledgeBaseConfig {
  return withLockState(normalizeKnowledgeBaseConfig({}), false);
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRegistrationFields(value: unknown): RegistrationFieldsConfig {
  const source = isRecord(value) ? value : {};
  return {
    name: source.name !== false,
    email: source.email !== false,
    phone: source.phone !== false,
  };
}

function normalizeVideoEventConfig(value: unknown): VideoEventConfig {
  const source = isRecord(value) ? value : {};
  const title = isRecord(source.title) ? source.title : {};
  const registrationFields = normalizeRegistrationFields(source.registrationFields);
  const legacy: { name?: boolean; email?: boolean; phone?: boolean } = {};
  if (!registrationFields.name) legacy.name = false;
  if (!registrationFields.email) legacy.email = false;
  if (!registrationFields.phone) legacy.phone = false;
  const formFields = normalizeCtaFormFields(
    source.formFields,
    Object.keys(legacy).length ? legacy : null,
  );

  const published = source.published !== false;

  const timezone = normalizeEventTimezone(
    typeof source.timezone === "string" ? source.timezone : "",
  );

  const rawDate =
    typeof source.date === "string" ? source.date.trim() : "";
  let dateWall = coerceWallCalendarDate(rawDate);
  if (!dateWall && rawDate) {
    const parsed = DateTime.fromISO(rawDate, { setZone: true });
    if (parsed.isValid) {
      dateWall = parsed.setZone(timezone).toFormat("yyyy-MM-dd");
    }
  }
  dateWall =
    dateWall || new Date().toISOString().slice(0, 10);

  const timeHm = coerceWallClockTime(
    typeof source.time === "string" ? source.time : "",
    runtimeConfig.defaultVideoEventTime,
  );

  const rawEnd =
    typeof source.endDate === "string" ? source.endDate.trim() : "";
  let endWall = coerceWallCalendarDate(rawEnd);
  if (!rawEnd) {
    endWall = "";
  } else if (!endWall && rawEnd) {
    const parsedEnd = DateTime.fromISO(rawEnd, { setZone: true });
    endWall =
      parsedEnd.isValid
        ? parsedEnd.setZone(timezone).toFormat("yyyy-MM-dd")
        : "";
  }

  let endHm = "";
  if (endWall) {
    endHm = coerceWallClockTime(
      typeof source.endTime === "string" ? source.endTime : "",
      timeHm,
    );
  }

  return {
    ...source,
    published,
    title: {
      en:
        typeof title.en === "string"
          ? title.en
          : runtimeConfig.defaultVideoEventTitleEn,
      he:
        typeof title.he === "string"
          ? title.he
          : runtimeConfig.defaultVideoEventTitleHe,
    },
    timezone,
    date: dateWall,
    time: timeHm,
    endDate: endWall || undefined,
    endTime: endWall ? endHm : undefined,
    location:
      typeof source.location === "string"
        ? source.location
        : runtimeConfig.defaultVideoEventLocation,
    image: typeof source.image === "string" ? source.image : "",
    participants:
      typeof source.participants === "number" ? source.participants : 0,
    registrationFields,
    formFields,
    brevoListKey:
      typeof source.brevoListKey === "string" && source.brevoListKey.trim()
        ? source.brevoListKey.trim().toLowerCase()
        : "",
  };
}

/** Public API: no event details when unpublished (draft / hidden). */
export function getPublicVideoEventPayload(
  config: VideoEventConfig,
): VideoEventConfig | { published: false } {
  if (!config.published) {
    return { published: false };
  }
  return config;
}

function normalizeHowItWorksConfig(value: unknown): HowItWorksConfig {
  const source = isRecord(value) ? value : {};

  return {
    ...source,
    videoSteps: Array.isArray(source.videoSteps) ? source.videoSteps : [],
    physicalSteps: Array.isArray(source.physicalSteps) ? source.physicalSteps : [],
    isLocked: Boolean(source.isLocked),
  };
}

function normalizeKnowledgeBaseConfig(value: unknown): KnowledgeBaseConfig {
  const source = isRecord(value) ? value : {};

  return {
    ...source,
    books: Array.isArray(source.books) ? source.books : [],
    videos: Array.isArray(source.videos) ? source.videos : [],
    isLocked: Boolean(source.isLocked),
  };
}

export type SiteBrevoSettings = {
  /** Key in BREVO_LIST_IDS for footer / “Be Part” /api/newsletter signups. */
  newsletterListKey: string;
  /** When true, CTA paths skip Email Architect triggers; Brevo list automations own email. */
  ctaBypassEmailArchitect: boolean;
  /**
   * When `ctaBypassEmailArchitect` is true, newsletter can still run `onNewsletterSignup`
   * through Email Architect if this is true (Brevo list + architect hybrid).
   */
  bePartUsesEmailArchitect: boolean;
  /** When true, also add the `general` list to explicit CTA list resolution. */
  appendGeneralListToCta: boolean;
  /**
   * Optional override of env `BREVO_LIST_IDS` (same format: `general:3,event:5,...`).
   * When non-empty, replaces env catalog for list resolution and admin dropdowns.
   */
  listIdsOverride: string;
  /**
   * When false, Brevo `/contacts` upserts do not set the SMS attribute (reduces duplicate-SMS errors;
   * use when Brevo SMS automation is off). Public site marketing checkbox copy omits SMS when false.
   */
  syncSmsAttributeToBrevo: boolean;
};

export type SiteSettingsConfig = {
  organizationName: string;
  contactEmail: string;
  whatsappPhoneE164: string;
  whatsappPhoneDisplay: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
  };
  inquiryWhatsappMessage: string;
  siteMedia: {
    joinMovementVideoUrl: string;
  };
  brevo: SiteBrevoSettings;
};

function normalizeSiteSettingsConfig(value: unknown): SiteSettingsConfig {
  const source = isRecord(value) ? value : {};
  const socialLinks = isRecord(source.socialLinks) ? source.socialLinks : {};
  const siteMedia = isRecord(source.siteMedia) ? source.siteMedia : {};
  const brevoIn = isRecord(source.brevo) ? source.brevo : {};
  const defaultBrevo = DEFAULT_SITE_SETTINGS.brevo;

  return {
    organizationName:
      typeof source.organizationName === "string" && source.organizationName.trim()
        ? source.organizationName.trim()
        : DEFAULT_SITE_SETTINGS.organizationName,
    contactEmail:
      typeof source.contactEmail === "string" && source.contactEmail.trim()
        ? source.contactEmail.trim()
        : DEFAULT_SITE_SETTINGS.contactEmail,
    whatsappPhoneE164:
      typeof source.whatsappPhoneE164 === "string" && source.whatsappPhoneE164.trim()
        ? source.whatsappPhoneE164.trim()
        : DEFAULT_SITE_SETTINGS.whatsappPhoneE164,
    whatsappPhoneDisplay:
      typeof source.whatsappPhoneDisplay === "string" && source.whatsappPhoneDisplay.trim()
        ? source.whatsappPhoneDisplay.trim()
        : DEFAULT_SITE_SETTINGS.whatsappPhoneDisplay,
    socialLinks: {
      instagram:
        typeof socialLinks.instagram === "string" && socialLinks.instagram.trim()
          ? socialLinks.instagram.trim()
          : DEFAULT_SITE_SETTINGS.socialLinks.instagram,
      facebook:
        typeof socialLinks.facebook === "string" && socialLinks.facebook.trim()
          ? socialLinks.facebook.trim()
          : DEFAULT_SITE_SETTINGS.socialLinks.facebook,
      linkedin:
        typeof socialLinks.linkedin === "string" && socialLinks.linkedin.trim()
          ? socialLinks.linkedin.trim()
          : DEFAULT_SITE_SETTINGS.socialLinks.linkedin,
      youtube:
        typeof socialLinks.youtube === "string" && socialLinks.youtube.trim()
          ? socialLinks.youtube.trim()
          : DEFAULT_SITE_SETTINGS.socialLinks.youtube,
    },
    inquiryWhatsappMessage:
      typeof source.inquiryWhatsappMessage === "string"
      && source.inquiryWhatsappMessage.trim()
        ? source.inquiryWhatsappMessage.trim()
        : DEFAULT_SITE_SETTINGS.inquiryWhatsappMessage,
    siteMedia: {
      joinMovementVideoUrl:
        typeof siteMedia.joinMovementVideoUrl === "string"
        && siteMedia.joinMovementVideoUrl.trim()
          ? siteMedia.joinMovementVideoUrl.trim()
          : DEFAULT_SITE_SETTINGS.siteMedia.joinMovementVideoUrl,
    },
    brevo: {
      newsletterListKey:
        typeof brevoIn.newsletterListKey === "string"
          ? brevoIn.newsletterListKey.trim().toLowerCase()
          : defaultBrevo.newsletterListKey,
      ctaBypassEmailArchitect: Boolean(brevoIn.ctaBypassEmailArchitect),
      bePartUsesEmailArchitect: Boolean(brevoIn.bePartUsesEmailArchitect),
      appendGeneralListToCta: Boolean(brevoIn.appendGeneralListToCta),
      listIdsOverride:
        typeof brevoIn.listIdsOverride === "string"
          ? brevoIn.listIdsOverride.trim()
          : defaultBrevo.listIdsOverride,
      syncSmsAttributeToBrevo: brevoIn.syncSmsAttributeToBrevo !== false,
    },
  };
}

function withLockState<T extends JsonRecord>(
  value: T,
  isLocked: boolean,
): T {
  return {
    ...value,
    isLocked,
  };
}

async function getContentEntry(key: string) {
  return prisma.contentEntry.findUnique({
    where: { key },
  });
}

async function saveContentEntry(input: {
  key: string;
  published: JsonRecord;
  draft?: JsonRecord | null;
  isLocked?: boolean;
}) {
  return prisma.contentEntry.upsert({
    where: { key: input.key },
    update: {
      published: input.published as Prisma.InputJsonValue,
      draft:
        input.draft === undefined
          ? undefined
          : input.draft === null
            ? Prisma.JsonNull
            : (input.draft as Prisma.InputJsonValue),
      isLocked: input.isLocked,
    },
    create: {
      key: input.key,
      published: input.published as Prisma.InputJsonValue,
      draft:
        input.draft === undefined
          ? undefined
          : input.draft === null
            ? Prisma.JsonNull
            : (input.draft as Prisma.InputJsonValue),
      isLocked: Boolean(input.isLocked),
    },
  });
}

export async function getVideoEventConfig(): Promise<VideoEventConfig> {
  const row = await getContentEntry(VIDEO_EVENT_KEY);
  if (!row) {
    return getDefaultVideoEventConfig();
  }

  return normalizeVideoEventConfig(row.published);
}

export async function saveVideoEventConfig(
  payload: unknown,
): Promise<VideoEventConfig> {
  const normalized = normalizeVideoEventConfig(payload);
  await saveContentEntry({
    key: VIDEO_EVENT_KEY,
    published: normalized as JsonRecord,
  });
  return normalized;
}

export async function getHowItWorksStaging(): Promise<HowItWorksConfig> {
  const row = await getContentEntry(HOW_IT_WORKS_KEY);
  const source = row?.draft ?? row?.published ?? {};
  return withLockState(
    normalizeHowItWorksConfig(source),
    Boolean(row?.isLocked),
  );
}

export async function saveHowItWorksStaging(
  payload: unknown,
): Promise<HowItWorksConfig> {
  const row = await getContentEntry(HOW_IT_WORKS_KEY);
  const normalized = normalizeHowItWorksConfig(payload);
  await saveContentEntry({
    key: HOW_IT_WORKS_KEY,
    published: isRecord(row?.published) ? row.published : normalizeHowItWorksConfig({}),
    draft: normalized as JsonRecord,
    isLocked: Boolean(row?.isLocked),
  });
  return withLockState(normalized, Boolean(row?.isLocked));
}

export async function publishHowItWorks(): Promise<void> {
  const row = await getContentEntry(HOW_IT_WORKS_KEY);
  if (!row?.draft || !isRecord(row.draft)) {
    throw new Error("No staged changes to publish");
  }

  await saveContentEntry({
    key: HOW_IT_WORKS_KEY,
    published: withLockState(
      normalizeHowItWorksConfig(row.draft) as JsonRecord,
      Boolean(row.isLocked),
    ),
    draft: null,
    isLocked: Boolean(row.isLocked),
  });
}

export async function getHowItWorksConfig(): Promise<HowItWorksConfig> {
  const row = await getContentEntry(HOW_IT_WORKS_KEY);
  return withLockState(
    normalizeHowItWorksConfig(row?.published ?? {}),
    Boolean(row?.isLocked),
  );
}

export async function saveHowItWorksConfig(
  payload: unknown,
  force: boolean,
): Promise<HowItWorksConfig> {
  const row = await getContentEntry(HOW_IT_WORKS_KEY);
  if (Boolean(row?.isLocked) && !force) {
    throw new Error("Section is locked");
  }

  const normalized = normalizeHowItWorksConfig(payload);
  await saveContentEntry({
    key: HOW_IT_WORKS_KEY,
    published: normalized as JsonRecord,
    draft:
      row?.draft && isRecord(row.draft)
        ? (row.draft as JsonRecord)
        : row?.draft === null
          ? null
          : undefined,
    isLocked: Boolean(row?.isLocked),
  });
  return withLockState(normalized, Boolean(row?.isLocked));
}

export async function getKnowledgeBaseConfig(): Promise<KnowledgeBaseConfig> {
  const row = await getContentEntry(KNOWLEDGE_BASE_KEY);
  return withLockState(
    normalizeKnowledgeBaseConfig(row?.published ?? {}),
    Boolean(row?.isLocked),
  );
}

export async function getSiteSettingsConfig(): Promise<SiteSettingsConfig> {
  const row = await getContentEntry(SITE_SETTINGS_KEY);
  return normalizeSiteSettingsConfig(row?.published ?? {});
}

export async function saveSiteSettingsConfig(
  payload: unknown,
): Promise<SiteSettingsConfig> {
  const normalized = normalizeSiteSettingsConfig(payload);
  await saveContentEntry({
    key: SITE_SETTINGS_KEY,
    published: normalized as JsonRecord,
  });
  return normalized;
}

export async function saveKnowledgeBaseConfig(
  payload: unknown,
  force: boolean,
): Promise<KnowledgeBaseConfig> {
  const row = await getContentEntry(KNOWLEDGE_BASE_KEY);
  if (Boolean(row?.isLocked) && !force) {
    throw new Error("Section is locked");
  }

  const normalized = normalizeKnowledgeBaseConfig(payload);
  await saveContentEntry({
    key: KNOWLEDGE_BASE_KEY,
    published: normalized as JsonRecord,
    isLocked: Boolean(row?.isLocked),
  });
  return withLockState(normalized, Boolean(row?.isLocked));
}

export async function toggleContentLock(
  configPath: ContentLockTarget,
): Promise<boolean> {
  const key = configPath === "howItWorks" ? HOW_IT_WORKS_KEY : KNOWLEDGE_BASE_KEY;
  const row = await getContentEntry(key);
  const nextIsLocked = !Boolean(row?.isLocked);
  const publishedBase = isRecord(row?.published) ? row.published : {};
  const draftBase = row?.draft && isRecord(row.draft) ? row.draft : null;

  await saveContentEntry({
    key,
    published: withLockState(publishedBase, nextIsLocked),
    draft: draftBase ? withLockState(draftBase, nextIsLocked) : row?.draft === null ? null : undefined,
    isLocked: nextIsLocked,
  });

  return nextIsLocked;
}
