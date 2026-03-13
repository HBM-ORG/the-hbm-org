import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type AssetCheckResult =
  | { status: "ok"; value: string }
  | { status: "remapped"; value: string }
  | { status: "removed"; value: null };

type EventRecord = Awaited<ReturnType<PrismaClient["event"]["findMany"]>>[number];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SITE_PUBLIC_ROOT = path.join(PROJECT_ROOT, "apps", "site", "public");
const LEGACY_CLIENT_PUBLIC_ROOT = path.join(PROJECT_ROOT, "apps", "client", "public");
const SITE_EVENTS_JSON_PATH = path.join(
  SITE_PUBLIC_ROOT,
  "data",
  "events.json",
);
const SITE_DIST_EVENTS_JSON_PATH = path.join(
  PROJECT_ROOT,
  "apps",
  "site",
  "dist",
  "data",
  "events.json",
);
const URL_MAPPING_PATH = path.join(
  PROJECT_ROOT,
  "scripts",
  "one-off",
  "url-mapping.json",
);

dotenv.config({ path: path.join(PROJECT_ROOT, "apps", "server", ".env") });
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), override: false });

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function readUrlMapping(): Record<string, string> {
  if (!fs.existsSync(URL_MAPPING_PATH)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(URL_MAPPING_PATH, "utf8"));
  } catch (error) {
    console.warn("Failed to read url-mapping.json, continuing without it.", error);
    return {};
  }
}

const urlMapping = readUrlMapping();

function isManagedAssetPath(value: unknown): value is string {
  return typeof value === "string" && value.trim().startsWith("/assets/");
}

function localAssetExists(rawPath: string): boolean {
  const relativePath = decodeURIComponent(rawPath).replace(/^\/+/, "");
  return [SITE_PUBLIC_ROOT, LEGACY_CLIENT_PUBLIC_ROOT].some((root) =>
    fs.existsSync(path.join(root, relativePath)),
  );
}

function reconcileAssetUrl(rawValue: unknown): AssetCheckResult {
  if (!isManagedAssetPath(rawValue)) {
    return { status: "ok", value: typeof rawValue === "string" ? rawValue : "" };
  }

  if (localAssetExists(rawValue)) {
    return { status: "ok", value: rawValue };
  }

  const mappedValue = urlMapping[rawValue];
  if (mappedValue) {
    return { status: "remapped", value: mappedValue };
  }

  return { status: "removed", value: null };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function serializeEvent(event: EventRecord) {
  return {
    id: event.legacyId || event.id,
    folderName: event.folderName,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    location: event.location,
    locationParams: event.locationParams,
    type: event.type,
    image: event.image,
    heroVideo: event.heroVideo,
    gallery: event.gallery || [],
    imageBubbles: event.imageBubbles || [],
    promoBubbles: event.promoBubbles || [],
    whatToExpect: event.whatToExpect,
    showPartnership: event.showPartnership,
    partnership: event.partnership,
    freeText: event.freeText,
    socialProof: event.socialProof,
    tags: event.tags || [],
    highlights: event.highlights || [],
    partners: event.partners || [],
    faqs: event.faqs || [],
    hostNote: event.hostNote,
    registration: event.registration,
    visuals: event.visuals,
    isLocked: event.isLocked,
    contentEnglishOnly: event.contentEnglishOnly,
    importantDetailsHeading: event.importantDetailsHeading,
    importantDetailsSectionLabel: event.importantDetailsSectionLabel,
  };
}

async function writeEventsSnapshot(): Promise<void> {
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const payload = JSON.stringify(events.map(serializeEvent), null, 2);

  fs.mkdirSync(path.dirname(SITE_EVENTS_JSON_PATH), { recursive: true });
  fs.writeFileSync(SITE_EVENTS_JSON_PATH, `${payload}\n`);
  console.log(`Updated ${path.relative(PROJECT_ROOT, SITE_EVENTS_JSON_PATH)}`);

  if (fs.existsSync(path.dirname(SITE_DIST_EVENTS_JSON_PATH))) {
    fs.mkdirSync(path.dirname(SITE_DIST_EVENTS_JSON_PATH), { recursive: true });
    fs.writeFileSync(SITE_DIST_EVENTS_JSON_PATH, `${payload}\n`);
    console.log(`Updated ${path.relative(PROJECT_ROOT, SITE_DIST_EVENTS_JSON_PATH)}`);
  }
}

async function main() {
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  let touchedEvents = 0;
  let remappedAssets = 0;
  let removedAssets = 0;

  for (const event of events) {
    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    const imageResult = reconcileAssetUrl(event.image);
    if (imageResult.status === "remapped") {
      updateData.image = imageResult.value;
      changes.push(`image: remapped`);
      remappedAssets++;
    } else if (imageResult.status === "removed") {
      updateData.image = null;
      changes.push(`image: cleared missing local asset`);
      removedAssets++;
    }

    const heroVideoResult = reconcileAssetUrl(event.heroVideo);
    if (heroVideoResult.status === "remapped") {
      updateData.heroVideo = heroVideoResult.value;
      changes.push(`heroVideo: remapped`);
      remappedAssets++;
    } else if (heroVideoResult.status === "removed") {
      updateData.heroVideo = null;
      changes.push(`heroVideo: cleared missing local asset`);
      removedAssets++;
    }

    const nextGallery: string[] = [];
    let galleryChanged = false;
    for (const item of asArray<string>(event.gallery)) {
      const galleryResult = reconcileAssetUrl(item);
      if (galleryResult.status === "ok") {
        nextGallery.push(galleryResult.value);
      } else if (galleryResult.status === "remapped") {
        nextGallery.push(galleryResult.value);
        galleryChanged = true;
        remappedAssets++;
      } else {
        galleryChanged = true;
        removedAssets++;
      }
    }
    if (galleryChanged) {
      updateData.gallery = nextGallery;
      changes.push(`gallery: removed/remapped missing asset entries`);
    }

    const nextImageBubbles = asArray<Record<string, unknown>>(event.imageBubbles).map(
      (bubble) => {
        const bubbleImage = reconcileAssetUrl(bubble?.image);
        if (bubbleImage.status === "ok") return bubble;
        if (bubbleImage.status === "remapped") {
          remappedAssets++;
          return { ...bubble, image: bubbleImage.value };
        }
        removedAssets++;
        return { ...bubble, image: "" };
      },
    );
    if (
      JSON.stringify(nextImageBubbles) !== JSON.stringify(asArray(event.imageBubbles))
    ) {
      updateData.imageBubbles = nextImageBubbles;
      changes.push(`imageBubbles: cleared/remapped missing images`);
    }

    const nextPartners = asArray<Record<string, unknown>>(event.partners).map(
      (partner) => {
        const partnerLogo = reconcileAssetUrl(partner?.logo);
        if (partnerLogo.status === "ok") return partner;
        if (partnerLogo.status === "remapped") {
          remappedAssets++;
          return { ...partner, logo: partnerLogo.value };
        }
        removedAssets++;
        return { ...partner, logo: "" };
      },
    );
    if (JSON.stringify(nextPartners) !== JSON.stringify(asArray(event.partners))) {
      updateData.partners = nextPartners;
      changes.push(`partners: cleared/remapped missing logos`);
    }

    if (changes.length === 0) {
      continue;
    }

    touchedEvents++;
    console.log(
      `[${dryRun ? "dry-run" : "update"}] event ${event.legacyId || event.id} (${event.folderName || "no-folder"})`,
    );
    for (const change of changes) {
      console.log(`  - ${change}`);
    }

    if (!dryRun) {
      await prisma.event.update({
        where: { id: event.id },
        data: updateData,
      });
    }
  }

  if (!dryRun) {
    await writeEventsSnapshot();
  }

  console.log("");
  console.log(`Events touched: ${touchedEvents}`);
  console.log(`Assets remapped: ${remappedAssets}`);
  console.log(`Assets removed: ${removedAssets}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
