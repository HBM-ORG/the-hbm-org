/**
 * Object Storage Provider Migration Script
 * Copies media already stored in one provider to another and updates DB URLs.
 *
 * Usage:
 *   npx tsx scripts/one-off/migrate-storage-provider.ts --from spaces --to gcs
 *   npx tsx scripts/one-off/migrate-storage-provider.ts --from gcs --to spaces --dry-run
 *   npx tsx scripts/one-off/migrate-storage-provider.ts --from spaces --to gcs --update-db-only
 *
 * Notes:
 * - Uses existing SPACES_* and GCS_* env vars for both providers.
 * - Saves URL mapping to scripts/one-off/provider-url-mapping-<from>-to-<to>.json
 * - DB-only mode reuses the mapping file without copying objects again.
 */

import { PrismaClient } from '@prisma/client';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type ProviderName = 'spaces' | 'gcs';

type DownloadResult = {
  buffer: Buffer;
  contentType: string;
};

type UploadResult = {
  key: string;
  viewUrl: string;
};

type MigrationTarget = {
  model: 'teamMember' | 'partner' | 'testimonial' | 'event';
  id: string;
  field: 'image' | 'logoUrl' | 'companyLogo' | 'heroVideo' | 'gallery' | 'imageBubbles';
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, 'apps', 'server', '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), override: false });

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const updateDbOnly = args.includes('--update-db-only');

function readFlagValue(flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) return null;
  return String(args[index + 1] || '').trim();
}

function parseProvider(value: string | null, flag: string): ProviderName {
  if (value === 'spaces' || value === 'gcs') return value;
  throw new Error(`Expected ${flag} to be 'spaces' or 'gcs'`);
}

const sourceProvider = parseProvider(readFlagValue('--from'), '--from');
const targetProvider = parseProvider(readFlagValue('--to'), '--to');

if (sourceProvider === targetProvider) {
  throw new Error('--from and --to must be different');
}

const MAPPING_PATH = path.join(
  PROJECT_ROOT,
  'scripts',
  'one-off',
  `provider-url-mapping-${sourceProvider}-to-${targetProvider}.json`,
);

const urlMapping = new Map<string, string>();
const urlTargets = new Map<string, MigrationTarget[]>();

let spacesClient: S3Client | null = null;
let gcsClient: Storage | null = null;

function getSpacesClient(): S3Client {
  if (spacesClient) return spacesClient;

  const endpoint = String(process.env.SPACES_ENDPOINT || '').trim();
  const region = String(process.env.SPACES_REGION || '').trim();
  const accessKeyId = String(process.env.SPACES_KEY || '').trim();
  const secretAccessKey = String(process.env.SPACES_SECRET || '').trim();

  const missing = [
    'SPACES_ENDPOINT',
    'SPACES_REGION',
    'SPACES_BUCKET',
    'SPACES_KEY',
    'SPACES_SECRET',
  ].filter((key) => !String(process.env[key] || '').trim());

  if (missing.length) {
    throw new Error(`Spaces env vars missing (${missing.join(', ')})`);
  }

  spacesClient = new S3Client({
    region,
    endpoint,
    forcePathStyle: false,
    credentials: { accessKeyId, secretAccessKey },
  });

  return spacesClient;
}

function getGcsClient(): Storage {
  if (gcsClient) return gcsClient;

  const rawCredentials = String(process.env.GCS_CREDENTIALS_JSON || '').trim();
  const credentials = rawCredentials ? JSON.parse(rawCredentials) : undefined;

  gcsClient = new Storage({
    projectId: String(process.env.GCS_PROJECT_ID || '').trim() || undefined,
    keyFilename: String(process.env.GCS_KEY_FILE || '').trim() || undefined,
    credentials,
  });

  return gcsClient;
}

function getSpacesBucket(): string {
  const bucket = String(process.env.SPACES_BUCKET || '').trim();
  if (!bucket) throw new Error('SPACES_BUCKET missing');
  return bucket;
}

function getGcsBucket(): string {
  const bucket = String(process.env.GCS_BUCKET || '').trim();
  if (!bucket) throw new Error('GCS_BUCKET missing');
  return bucket;
}

function ensureProvidersConfigured(): void {
  if (sourceProvider === 'spaces') {
    getSpacesClient();
    getSpacesBucket();
  }
  if (sourceProvider === 'gcs') {
    getGcsClient();
    getGcsBucket();
  }

  if (dryRun) {
    return;
  }

  if (targetProvider === 'spaces') {
    getSpacesClient();
    getSpacesBucket();
  }
  if (targetProvider === 'gcs') {
    getGcsClient();
    getGcsBucket();
  }
}

function extractSpacesKey(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const bucket = getSpacesBucket();
    const endpoint = String(process.env.SPACES_ENDPOINT || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
    if (!bucket || !endpoint) return null;

    const url = new URL(raw, `https://${endpoint}`);
    const host = url.hostname;
    const pathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

    if (host.startsWith(`${bucket}.`) && host.includes(endpoint)) return pathname;
    if (host.includes(endpoint) && pathname.startsWith(`${bucket}/`)) {
      return pathname.slice(bucket.length + 1);
    }

    return null;
  } catch {
    return null;
  }
}

function extractGcsKey(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const bucket = getGcsBucket();
    const pathname = url.pathname.replace(/^\/+/, '');

    if (url.protocol === 'gs:' && url.hostname === bucket) return pathname || null;
    if (url.hostname === 'storage.googleapis.com' && pathname.startsWith(`${bucket}/`)) {
      return pathname.slice(bucket.length + 1);
    }
    if (url.hostname === `${bucket}.storage.googleapis.com`) return pathname || null;

    return null;
  } catch {
    return null;
  }
}

function extractKey(provider: ProviderName, raw?: string | null): string | null {
  return provider === 'spaces' ? extractSpacesKey(raw) : extractGcsKey(raw);
}

function buildViewUrl(provider: ProviderName, key: string): string {
  if (provider === 'spaces') {
    const endpoint = String(process.env.SPACES_ENDPOINT || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
    const bucket = String(process.env.SPACES_BUCKET || '').trim();
    if (!bucket || !endpoint) {
      return `https://migration-preview.invalid/spaces/${key}`;
    }
    return `https://${bucket}.${endpoint}/${key}`;
  }

  const bucket = String(process.env.GCS_BUCKET || '').trim();
  if (!bucket) {
    return `https://migration-preview.invalid/gcs/${key}`;
  }
  return `https://storage.googleapis.com/${bucket}/${key}`;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  if (typeof stream?.transformToByteArray === 'function') {
    const bytes = await stream.transformToByteArray();
    return Buffer.from(bytes);
  }

  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer | Uint8Array | string) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
    );
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function downloadObject(provider: ProviderName, key: string): Promise<DownloadResult> {
  if (provider === 'spaces') {
    const response = await getSpacesClient().send(
      new GetObjectCommand({
        Bucket: getSpacesBucket(),
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`No response body returned for Spaces object: ${key}`);
    }

    return {
      buffer: await streamToBuffer(response.Body),
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  const file = getGcsClient().bucket(getGcsBucket()).file(key);
  const [buffer] = await file.download();
  const [metadata] = await file.getMetadata().catch(() => [{ contentType: undefined }]);

  return {
    buffer,
    contentType: metadata.contentType || 'application/octet-stream',
  };
}

async function uploadObject(
  provider: ProviderName,
  key: string,
  { buffer, contentType }: DownloadResult,
): Promise<UploadResult> {
  if (provider === 'spaces') {
    await getSpacesClient().send(
      new PutObjectCommand({
        Bucket: getSpacesBucket(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );

    return {
      key,
      viewUrl: buildViewUrl('spaces', key),
    };
  }

  await getGcsClient().bucket(getGcsBucket()).file(key).save(buffer, {
    resumable: false,
    metadata: { contentType },
  });

  return {
    key,
    viewUrl: buildViewUrl('gcs', key),
  };
}

function addTarget(url: string, target: MigrationTarget): void {
  const existing = urlTargets.get(url) || [];
  existing.push(target);
  urlTargets.set(url, existing);
}

async function collectUrlsFromDatabase(): Promise<number> {
  const [teamMembers, partners, testimonials, events] = await Promise.all([
    prisma.teamMember.findMany(),
    prisma.partner.findMany(),
    prisma.testimonial.findMany(),
    prisma.event.findMany(),
  ]);

  for (const member of teamMembers) {
    if (extractKey(sourceProvider, member.image)) {
      addTarget(member.image!, { model: 'teamMember', id: member.id, field: 'image' });
    }
  }

  for (const partner of partners) {
    if (extractKey(sourceProvider, partner.logoUrl)) {
      addTarget(partner.logoUrl, { model: 'partner', id: partner.id, field: 'logoUrl' });
    }
  }

  for (const testimonial of testimonials) {
    if (extractKey(sourceProvider, testimonial.companyLogo)) {
      addTarget(testimonial.companyLogo!, {
        model: 'testimonial',
        id: testimonial.id,
        field: 'companyLogo',
      });
    }
  }

  for (const event of events) {
    if (extractKey(sourceProvider, event.image)) {
      addTarget(event.image!, { model: 'event', id: event.id, field: 'image' });
    }
    if (extractKey(sourceProvider, event.heroVideo)) {
      addTarget(event.heroVideo!, { model: 'event', id: event.id, field: 'heroVideo' });
    }

    if (Array.isArray(event.gallery)) {
      for (const url of event.gallery) {
        if (typeof url === 'string' && extractKey(sourceProvider, url)) {
          addTarget(url, { model: 'event', id: event.id, field: 'gallery' });
        }
      }
    }

    if (Array.isArray(event.imageBubbles)) {
      for (const bubble of event.imageBubbles) {
        if (!bubble || typeof bubble !== 'object' || Array.isArray(bubble)) continue;
        const image = typeof bubble.image === 'string' ? bubble.image : null;
        if (image && extractKey(sourceProvider, image)) {
          addTarget(image, { model: 'event', id: event.id, field: 'imageBubbles' });
        }
      }
    }
  }

  return urlTargets.size;
}

function saveMapping(): void {
  if (dryRun) return;

  const mapping = Object.fromEntries(urlMapping.entries());
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`\nURL mapping saved to: ${MAPPING_PATH}`);
}

function loadMapping(): void {
  if (!fs.existsSync(MAPPING_PATH)) {
    throw new Error(`Mapping file not found: ${MAPPING_PATH}`);
  }

  const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8')) as Record<string, string>;
  for (const [fromUrl, toUrl] of Object.entries(mapping)) {
    if (fromUrl && toUrl) {
      urlMapping.set(fromUrl, toUrl);
    }
  }

  console.log(`Loaded ${urlMapping.size} URL mappings from: ${MAPPING_PATH}`);
}

async function migrateObjects(): Promise<{ migrated: number; errors: string[] }> {
  console.log('\n--- Migrating Provider Objects ---');

  const errors: string[] = [];
  let migrated = 0;

  for (const [sourceUrl] of urlTargets.entries()) {
    try {
      const key = extractKey(sourceProvider, sourceUrl);
      if (!key) {
        errors.push(`Could not extract key from: ${sourceUrl}`);
        continue;
      }

      if (dryRun) {
        urlMapping.set(sourceUrl, buildViewUrl(targetProvider, key));
        migrated++;
        continue;
      }

      const download = await downloadObject(sourceProvider, key);
      const uploaded = await uploadObject(targetProvider, key, download);
      urlMapping.set(sourceUrl, uploaded.viewUrl);
      console.log(`  Migrated ${key}`);
      migrated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${sourceUrl}: ${message}`);
      console.error(`  ERROR migrating ${sourceUrl}: ${message}`);
    }
  }

  console.log(`Provider objects: ${migrated} migrated, ${errors.length} errors`);
  return { migrated, errors };
}

async function updateDatabaseUrls(): Promise<{ updated: number; errors: string[] }> {
  if (dryRun) {
    console.log('\n--- Skipping Database Update ---');
    console.log('(dry-run mode)');
    return { updated: 0, errors: [] };
  }

  console.log('\n--- Updating Database URLs ---');

  const errors: string[] = [];
  let updated = 0;

  const teamMembers = await prisma.teamMember.findMany();
  for (const member of teamMembers) {
    if (!member.image || !urlMapping.has(member.image)) continue;
    try {
      await prisma.teamMember.update({
        where: { id: member.id },
        data: { image: urlMapping.get(member.image)! },
      });
      updated++;
    } catch {
      errors.push(`Failed to update team member ${member.id}`);
    }
  }

  const partners = await prisma.partner.findMany();
  for (const partner of partners) {
    if (!partner.logoUrl || !urlMapping.has(partner.logoUrl)) continue;
    try {
      await prisma.partner.update({
        where: { id: partner.id },
        data: { logoUrl: urlMapping.get(partner.logoUrl)! },
      });
      updated++;
    } catch {
      errors.push(`Failed to update partner ${partner.id}`);
    }
  }

  const testimonials = await prisma.testimonial.findMany();
  for (const testimonial of testimonials) {
    if (!testimonial.companyLogo || !urlMapping.has(testimonial.companyLogo)) continue;
    try {
      await prisma.testimonial.update({
        where: { id: testimonial.id },
        data: { companyLogo: urlMapping.get(testimonial.companyLogo)! },
      });
      updated++;
    } catch {
      errors.push(`Failed to update testimonial ${testimonial.id}`);
    }
  }

  const events = await prisma.event.findMany();
  for (const event of events) {
    const updates: Record<string, unknown> = {};

    if (event.image && urlMapping.has(event.image)) {
      updates.image = urlMapping.get(event.image)!;
    }

    if (event.heroVideo && urlMapping.has(event.heroVideo)) {
      updates.heroVideo = urlMapping.get(event.heroVideo)!;
    }

    if (Array.isArray(event.gallery)) {
      const gallery = event.gallery.map((item) =>
        typeof item === 'string' && urlMapping.has(item) ? urlMapping.get(item)! : item,
      );
      if (JSON.stringify(gallery) !== JSON.stringify(event.gallery)) {
        updates.gallery = gallery;
      }
    }

    if (Array.isArray(event.imageBubbles)) {
      const imageBubbles = event.imageBubbles.map((bubble) => {
        if (!bubble || typeof bubble !== 'object' || Array.isArray(bubble)) return bubble;
        const record = bubble as Record<string, unknown>;
        const image = typeof record.image === 'string' ? record.image : '';
        return image && urlMapping.has(image)
          ? { ...record, image: urlMapping.get(image)! }
          : record;
      });
      if (JSON.stringify(imageBubbles) !== JSON.stringify(event.imageBubbles)) {
        updates.imageBubbles = imageBubbles;
      }
    }

    if (!Object.keys(updates).length) continue;

    try {
      await prisma.event.update({
        where: { id: event.id },
        data: updates,
      });
      updated++;
    } catch {
      errors.push(`Failed to update event ${event.id}`);
    }
  }

  console.log(`Database records updated: ${updated}, errors: ${errors.length}`);
  return { updated, errors };
}

async function main() {
  console.log('========================================');
  console.log('Storage Provider Migration');
  console.log('========================================');
  console.log(`From: ${sourceProvider}`);
  console.log(`To: ${targetProvider}`);
  console.log(`Mode: ${updateDbOnly ? 'UPDATE DB ONLY' : dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  try {
    const discovered = await collectUrlsFromDatabase();
    console.log(`Discovered ${discovered} source URLs in database`);

    let migrationResult = { migrated: 0, errors: [] as string[] };

    if (updateDbOnly) {
      loadMapping();
    } else {
      ensureProvidersConfigured();
      migrationResult = await migrateObjects();
      saveMapping();
    }

    const dbResult = await updateDatabaseUrls();

    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Provider objects migrated: ${migrationResult.migrated}, ${migrationResult.errors.length} errors`);
    console.log(`Database records updated: ${dbResult.updated}, ${dbResult.errors.length} errors`);

    const totalErrors = migrationResult.errors.length + dbResult.errors.length;
    if (totalErrors > 0) {
      console.log(`\nERRORS: ${totalErrors}`);
    } else {
      console.log('\nAll provider migrations completed successfully!');
    }

    if (dryRun) {
      console.log('\nThis was a dry run. No objects were copied.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
