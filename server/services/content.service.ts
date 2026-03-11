import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type {
  ContentLockTarget,
  HowItWorksConfig,
  KnowledgeBaseConfig,
  RegistrationFieldsConfig,
  VideoEventConfig,
} from "../types/content.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const VIDEO_EVENT_CONFIG_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "videoEvent.json",
);
const HOW_IT_WORKS_CONFIG_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "howItWorksConfig.json",
);
const HOW_IT_WORKS_STAGING_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "howItWorksStaging.json",
);
const KNOWLEDGE_BASE_CONFIG_PATH = path.join(
  PROJECT_ROOT,
  "src",
  "data",
  "knowledgeBaseConfig.json",
);

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
      en: typeof title.en === "string" ? title.en : "",
      he: typeof title.he === "string" ? title.he : "",
    },
    date:
      typeof source.date === "string" ? source.date : new Date().toISOString(),
    time: typeof source.time === "string" ? source.time : "20:00",
    location:
      typeof source.location === "string" ? source.location : "Zoom / Video Call",
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

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getVideoEventConfig(): VideoEventConfig {
  if (!fs.existsSync(VIDEO_EVENT_CONFIG_PATH)) {
    return normalizeVideoEventConfig({
      title: { en: "", he: "" },
      date: new Date().toISOString(),
      time: "20:00",
      location: "Zoom / Video Call",
      image: "",
      participants: 0,
      registrationFields: { name: true, email: true, phone: true },
    });
  }

  return normalizeVideoEventConfig(
    readJsonFile<unknown>(VIDEO_EVENT_CONFIG_PATH, {}),
  );
}

export function saveVideoEventConfig(payload: unknown): VideoEventConfig {
  const normalized = normalizeVideoEventConfig(payload);
  fs.writeFileSync(VIDEO_EVENT_CONFIG_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}

export function getHowItWorksStaging(): HowItWorksConfig {
  const target = fs.existsSync(HOW_IT_WORKS_STAGING_PATH)
    ? HOW_IT_WORKS_STAGING_PATH
    : HOW_IT_WORKS_CONFIG_PATH;
  return normalizeHowItWorksConfig(readJsonFile<unknown>(target, {}));
}

export function saveHowItWorksStaging(payload: unknown): HowItWorksConfig {
  const normalized = normalizeHowItWorksConfig(payload);
  fs.writeFileSync(HOW_IT_WORKS_STAGING_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}

export function publishHowItWorks(): void {
  if (!fs.existsSync(HOW_IT_WORKS_STAGING_PATH)) {
    throw new Error("No staged changes to publish");
  }

  const staged = fs.readFileSync(HOW_IT_WORKS_STAGING_PATH);
  fs.writeFileSync(HOW_IT_WORKS_CONFIG_PATH, staged);
}

export function getHowItWorksConfig(): HowItWorksConfig {
  if (!fs.existsSync(HOW_IT_WORKS_CONFIG_PATH)) {
    return normalizeHowItWorksConfig({
      videoSteps: [],
      physicalSteps: [],
      isLocked: false,
    });
  }

  return normalizeHowItWorksConfig(readJsonFile<unknown>(HOW_IT_WORKS_CONFIG_PATH, {
    videoSteps: [],
    physicalSteps: [],
    isLocked: false,
  }));
}

export function saveHowItWorksConfig(
  payload: unknown,
  force: boolean,
): HowItWorksConfig {
  const config = readJsonFile<JsonRecord>(HOW_IT_WORKS_CONFIG_PATH, {});
  if (Boolean(config.isLocked) && !force) {
    throw new Error("Section is locked");
  }

  const normalized = normalizeHowItWorksConfig(payload);
  fs.writeFileSync(HOW_IT_WORKS_CONFIG_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}

export function getKnowledgeBaseConfig(): KnowledgeBaseConfig {
  if (!fs.existsSync(KNOWLEDGE_BASE_CONFIG_PATH)) {
    return normalizeKnowledgeBaseConfig({
      books: [],
      videos: [],
      isLocked: false,
    });
  }

  return normalizeKnowledgeBaseConfig(readJsonFile<unknown>(KNOWLEDGE_BASE_CONFIG_PATH, {
    books: [],
    videos: [],
    isLocked: false,
  }));
}

export function saveKnowledgeBaseConfig(
  payload: unknown,
  force: boolean,
): KnowledgeBaseConfig {
  const config = readJsonFile<JsonRecord>(KNOWLEDGE_BASE_CONFIG_PATH, {});
  if (Boolean(config.isLocked) && !force) {
    throw new Error("Section is locked");
  }

  const normalized = normalizeKnowledgeBaseConfig(payload);
  fs.writeFileSync(
    KNOWLEDGE_BASE_CONFIG_PATH,
    JSON.stringify(normalized, null, 2),
  );
  return normalized;
}

export function toggleContentLock(configPath: ContentLockTarget): boolean {
  const targetPath =
    configPath === "howItWorks"
      ? HOW_IT_WORKS_CONFIG_PATH
      : KNOWLEDGE_BASE_CONFIG_PATH;
  const config = readJsonFile<JsonRecord>(targetPath, {});
  config.isLocked = !Boolean(config.isLocked);
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
  return Boolean(config.isLocked);
}
