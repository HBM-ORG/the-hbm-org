import { Prisma, PrismaClient } from "@prisma/client";
import type {
  ContentLockTarget,
  HowItWorksConfig,
  KnowledgeBaseConfig,
  RegistrationFieldsConfig,
  VideoEventConfig,
} from "../types/content.js";
import { runtimeConfig } from "../config/runtime-config.js";

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
    date: new Date().toISOString(),
    time: runtimeConfig.defaultVideoEventTime,
    location: runtimeConfig.defaultVideoEventLocation,
    image: "",
    participants: 0,
    registrationFields: { name: true, email: true, phone: true },
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

  return {
    ...source,
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
    date:
      typeof source.date === "string" ? source.date : new Date().toISOString(),
    time:
      typeof source.time === "string"
        ? source.time
        : runtimeConfig.defaultVideoEventTime,
    location:
      typeof source.location === "string"
        ? source.location
        : runtimeConfig.defaultVideoEventLocation,
    image: typeof source.image === "string" ? source.image : "",
    participants:
      typeof source.participants === "number" ? source.participants : 0,
    registrationFields: normalizeRegistrationFields(source.registrationFields),
  };
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
};

function normalizeSiteSettingsConfig(value: unknown): SiteSettingsConfig {
  const source = isRecord(value) ? value : {};
  const socialLinks = isRecord(source.socialLinks) ? source.socialLinks : {};
  const siteMedia = isRecord(source.siteMedia) ? source.siteMedia : {};

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
