import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type MigrationManifest = {
  migratedAt: string;
  sourceCmsBaseUrl: string;
  targetCmsBaseUrl: string;
  targetSpacesBucket: string;
  targetSpacesEndpointHost: string;
  mapping: Record<string, string>;
  derived: {
    ogImageUrl: string;
    homoDeusCoverUrl: string;
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SITE_ENV_PATH = path.join(PROJECT_ROOT, "apps", "site", ".env");
const ADMIN_ENV_PATH = path.join(PROJECT_ROOT, "apps", "admin", ".env");
const SERVER_ENV_PATH = path.join(PROJECT_ROOT, "apps", "server", ".env");
const SITE_CONTENT_PATH = path.join(PROJECT_ROOT, "apps", "site", "src", "data", "content.js");
const MAPPING_PATH = path.join(
  PROJECT_ROOT,
  "scripts",
  "one-off",
  "wordpress-media-mapping.json",
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

dotenv.config({ path: SERVER_ENV_PATH });
dotenv.config({ path: SITE_ENV_PATH, override: false });
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), override: false });

function readEnv(name: string): string {
  return String(process.env[name] || "").trim();
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function normalizeBaseUrl(value: string): string {
  return String(value || "").trim().replace(/\/+$/, "");
}

function buildSpacesClient(): S3Client {
  return new S3Client({
    region: requireEnv("SPACES_REGION"),
    endpoint: requireEnv("SPACES_ENDPOINT"),
    forcePathStyle: false,
    credentials: {
      accessKeyId: requireEnv("SPACES_KEY"),
      secretAccessKey: requireEnv("SPACES_SECRET"),
    },
  });
}

function extractWpRelativePaths(filePath: string): string[] {
  const source = fs.readFileSync(filePath, "utf8");
  const regex = /\$\{WP\}(\/[^`]+?)`/g;
  const results = new Set<string>();
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(source))) {
    results.add(match[1]);
  }

  return [...results].sort();
}

function detectContentType(url: string, fallbackHeader?: string | null): string {
  const header = String(fallbackHeader || "").split(";")[0].trim();
  if (header) return header;

  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  return "application/octet-stream";
}

function encodeKeyPath(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function downloadRemoteAsset(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: detectContentType(url, response.headers.get("content-type")),
  };
}

async function uploadToSpaces(
  client: S3Client,
  bucket: string,
  endpointHost: string,
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (!dryRun) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "public-read",
      }),
    );
  }

  return `https://${bucket}.${endpointHost}/${encodeKeyPath(key)}`;
}

async function main(): Promise<void> {
  const sourceCmsBaseUrl = normalizeBaseUrl(requireEnv("VITE_CMS_UPLOADS_BASE"));
  const spacesEndpointHost = requireEnv("SPACES_ENDPOINT")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const spacesBucket = requireEnv("SPACES_BUCKET");
  const targetCmsBaseUrl = `https://${spacesBucket}.${spacesEndpointHost}/legacy/wordpress-media`;
  const ogSourceUrl = normalizeBaseUrl(readEnv("VITE_SITE_OG_IMAGE_URL")) || "https://www.thehbm.org/og-default.png";
  const homoDeusSourceUrl = "https://www.ynharari.com/wp-content/uploads/2017/01/homo_deus.png";

  const wpRelativePaths = extractWpRelativePaths(SITE_CONTENT_PATH);
  const sourceUrls = new Map<string, string>();

  for (const relativePath of wpRelativePaths) {
    sourceUrls.set(`${sourceCmsBaseUrl}${relativePath}`, `legacy/wordpress-media${relativePath}`);
  }

  const faviconUrl = readEnv("VITE_FAVICON_URL");
  if (faviconUrl.startsWith("http")) {
    sourceUrls.set(faviconUrl, "legacy/wordpress-media/2025/05/cropped-favicon.png");
  }

  const appleTouchUrl = readEnv("VITE_APPLE_TOUCH_ICON_URL");
  if (appleTouchUrl.startsWith("http")) {
    sourceUrls.set(appleTouchUrl, "legacy/wordpress-media/2026/02/לוגו-HBM-עדכני.png");
  }

  sourceUrls.set(ogSourceUrl, "legacy/brand/og-default.png");
  sourceUrls.set(homoDeusSourceUrl, "legacy/book-covers/homo-deus.png");

  console.log("========================================");
  console.log("WordPress Media -> DO Spaces Migration");
  console.log("========================================");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Source CMS base: ${sourceCmsBaseUrl}`);
  console.log(`Target CMS base: ${targetCmsBaseUrl}`);
  console.log(`Assets queued: ${sourceUrls.size}`);

  const client = buildSpacesClient();
  const mapping: Record<string, string> = {};

  for (const [sourceUrl, targetKey] of sourceUrls.entries()) {
    console.log(`\nMigrating: ${sourceUrl}`);
    console.log(`         -> ${targetKey}`);

    try {
      const { buffer, contentType } = await downloadRemoteAsset(sourceUrl);
      const viewUrl = await uploadToSpaces(
        client,
        spacesBucket,
        spacesEndpointHost,
        targetKey,
        buffer,
        contentType,
      );
      mapping[sourceUrl] = viewUrl;
      console.log(`Uploaded: ${viewUrl}`);
    } catch (error) {
      throw new Error(
        `Failed migrating ${sourceUrl}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  const manifest: MigrationManifest = {
    migratedAt: new Date().toISOString(),
    sourceCmsBaseUrl,
    targetCmsBaseUrl,
    targetSpacesBucket: spacesBucket,
    targetSpacesEndpointHost: spacesEndpointHost,
    mapping,
    derived: {
      ogImageUrl: mapping[ogSourceUrl],
      homoDeusCoverUrl: mapping[homoDeusSourceUrl],
    },
  };

  fs.writeFileSync(MAPPING_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nSaved mapping manifest: ${MAPPING_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
