/**
 * Local Files to Object Storage Migration Script
 * Uploads local files (images, videos) to DigitalOcean Spaces or GCS
 * and updates database records with new URLs
 *
 * Usage:
 *   npx tsx scripts/migrate-files-to-storage.ts [--dry-run] [--skip-db-update] [--update-db-only]
 *
 * Options:
 *   --dry-run         Preview uploads without actually uploading
 *   --skip-db-update  Only upload files, don't update database records
 *   --update-db-only  Reuse scripts/url-mapping.json to update DB without uploading
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStorageAdapter } from '../server/storage/adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipDbUpdate = args.includes('--skip-db-update');
const updateDbOnly = args.includes('--update-db-only');

// Paths
const ASSETS_DIR = path.join(PROJECT_ROOT, 'public', 'assets');
const TEAM_DIR = path.join(ASSETS_DIR, 'team');
const EVENTS_DIR = path.join(ASSETS_DIR, 'events');
const PARTNER_LOGOS_DIR = path.join(PROJECT_ROOT, 'public', 'partner-logos');
const URL_MAPPING_PATH = path.join(PROJECT_ROOT, 'scripts', 'url-mapping.json');

// Mapping of old local paths to new object storage URLs
const urlMapping: Map<string, string> = new Map();

function validateArgs(): void {
  if (updateDbOnly && skipDbUpdate) {
    throw new Error('Cannot use --update-db-only together with --skip-db-update');
  }
}

/**
 * Check if storage is configured
 */
function checkStorageConfig(): boolean {
  const adapter = getStorageAdapter();
  const config = adapter.getConfigSummary();

  if (!config.isReady) {
    console.error('Storage is not configured. Missing environment variables:');
    config.missingKeys.forEach((key) => console.error(`  - ${key}`));
    return false;
  }

  console.log(`Storage provider: ${config.provider}`);
  console.log(`Provider is ready: ${config.isReady}`);
  return true;
}

function loadUrlMapping(): void {
  if (!fs.existsSync(URL_MAPPING_PATH)) {
    throw new Error(`URL mapping file not found: ${URL_MAPPING_PATH}`);
  }

  const raw = fs.readFileSync(URL_MAPPING_PATH, 'utf8');
  const parsed = JSON.parse(raw) as Record<string, string>;
  let count = 0;

  for (const [sourceUrl, targetUrl] of Object.entries(parsed)) {
    if (!sourceUrl || !targetUrl) continue;
    urlMapping.set(sourceUrl, targetUrl);
    count++;
  }

  console.log(`Loaded ${count} URL mappings from: ${URL_MAPPING_PATH}`);
}

/**
 * Upload a single file to object storage
 */
async function uploadFile(
  localPath: string,
  keyPrefix: string,
  contentType: string
): Promise<{ key: string; viewUrl: string } | null> {
  try {
    if (!fs.existsSync(localPath)) {
      console.warn(`  File not found: ${localPath}`);
      return null;
    }

    const filename = path.basename(localPath);
    const stats = fs.statSync(localPath);

    if (stats.size === 0) {
      console.warn(`  Skipping empty file: ${filename}`);
      return null;
    }

    console.log(`  Uploading: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);

    if (dryRun) {
      return {
        key: `${keyPrefix}/${filename}`,
        viewUrl: `https://storage.example.com/${keyPrefix}/${filename}`,
      };
    }

    const adapter = getStorageAdapter();
    const { key, uploadUrl, viewUrl } = await adapter.createPresignedPutUrl({
      keyPrefix,
      filename,
      contentType,
      expiresInSeconds: 900,
    });

    // Upload file content
    const fileBuffer = fs.readFileSync(localPath);
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': contentType,
        'x-amz-acl': 'public-read', // For Spaces
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    console.log(`    -> ${viewUrl}`);
    return { key, viewUrl };
  } catch (error) {
    console.error(`  ERROR uploading ${localPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Migrate team member photos
 */
async function migrateTeamPhotos(): Promise<{ count: number; errors: string[] }> {
  console.log('\n--- Migrating Team Photos ---');

  if (!fs.existsSync(TEAM_DIR)) {
    console.log('Team directory not found, skipping...');
    return { count: 0, errors: [] };
  }

  const errors: string[] = [];
  let count = 0;

  const files = fs.readdirSync(TEAM_DIR);

  for (const file of files) {
    const localPath = path.join(TEAM_DIR, file);
    const stat = fs.statSync(localPath);

    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    const result = await uploadFile(localPath, 'team', contentType);

    if (result) {
      urlMapping.set(`/assets/team/${file}`, result.viewUrl);
      count++;
    } else {
      errors.push(`Failed to upload: ${file}`);
    }
  }

  console.log(`Team photos: ${count} uploaded, ${errors.length} errors`);
  return { count, errors };
}

/**
 * Migrate partner logos
 */
async function migratePartnerLogos(): Promise<{ count: number; errors: string[] }> {
  console.log('\n--- Migrating Partner Logos ---');

  if (!fs.existsSync(PARTNER_LOGOS_DIR)) {
    console.log('Partner logos directory not found, skipping...');
    return { count: 0, errors: [] };
  }

  const errors: string[] = [];
  let count = 0;

  const files = fs.readdirSync(PARTNER_LOGOS_DIR);

  for (const file of files) {
    const localPath = path.join(PARTNER_LOGOS_DIR, file);
    const stat = fs.statSync(localPath);

    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';

    const result = await uploadFile(localPath, 'partner-logos', contentType);

    if (result) {
      urlMapping.set(`/partner-logos/${file}`, result.viewUrl);
      count++;
    } else {
      errors.push(`Failed to upload: ${file}`);
    }
  }

  console.log(`Partner logos: ${count} uploaded, ${errors.length} errors`);
  return { count, errors };
}

/**
 * Migrate event images and videos
 */
async function migrateEventAssets(): Promise<{ count: number; errors: string[] }> {
  console.log('\n--- Migrating Event Assets ---');

  if (!fs.existsSync(EVENTS_DIR)) {
    console.log('Events directory not found, skipping...');
    return { count: 0, errors: [] };
  }

  const errors: string[] = [];
  let count = 0;

  // Recursively scan event folders
  const scanDirectory = async (dir: string, prefix: string): Promise<void> => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = `${prefix}/${entry.name}`;

      if (entry.isDirectory()) {
        await scanDirectory(fullPath, relativePath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        let contentType = 'application/octet-stream';

        // Images
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';
        // Videos
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.mov') contentType = 'video/quicktime';
        else if (ext === '.webm') contentType = 'video/webm';
        // Skip other files
        else continue;

        const result = await uploadFile(fullPath, `events/${prefix}`, contentType);

        if (result) {
          urlMapping.set(`/assets/events/${relativePath}`, result.viewUrl);
          count++;
        } else {
          errors.push(`Failed to upload: ${relativePath}`);
        }
      }
    }
  };

  const eventFolders = fs.readdirSync(EVENTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  for (const folder of eventFolders) {
    await scanDirectory(path.join(EVENTS_DIR, folder), folder);
  }

  console.log(`Event assets: ${count} uploaded, ${errors.length} errors`);
  return { count, errors };
}

/**
 * Update database records with new URLs
 */
async function updateDatabaseUrls(): Promise<{ updated: number; errors: string[] }> {
  if (skipDbUpdate || dryRun) {
    console.log('\n--- Skipping Database Update ---');
    if (dryRun) console.log('(dry-run mode)');
    if (skipDbUpdate) console.log('(--skip-db-update flag)');
    return { updated: 0, errors: [] };
  }

  console.log('\n--- Updating Database URLs ---');

  const errors: string[] = [];
  let updated = 0;

  // Update Team Members
  const teamMembers = await prisma.teamMember.findMany();
  for (const member of teamMembers) {
    if (member.image && urlMapping.has(member.image)) {
      try {
        const newUrl = urlMapping.get(member.image)!;
        await prisma.teamMember.update({
          where: { id: member.id },
          data: { image: newUrl },
        });
        console.log(`  Updated team member ${member.legacyId}: ${newUrl}`);
        updated++;
      } catch (error) {
        errors.push(`Failed to update team member ${member.id}`);
      }
    }
  }

  // Update Partners
  const partners = await prisma.partner.findMany();
  for (const partner of partners) {
    if (partner.logoUrl && urlMapping.has(partner.logoUrl)) {
      try {
        const newUrl = urlMapping.get(partner.logoUrl)!;
        await prisma.partner.update({
          where: { id: partner.id },
          data: { logoUrl: newUrl },
        });
        console.log(`  Updated partner ${partner.legacyId}: ${newUrl}`);
        updated++;
      } catch (error) {
        errors.push(`Failed to update partner ${partner.id}`);
      }
    }
  }

  // Update Events
  const events = await prisma.event.findMany();
  for (const event of events) {
    const updates: any = {};

    if (event.image && urlMapping.has(event.image)) {
      updates.image = urlMapping.get(event.image);
    }

    if (event.heroVideo && urlMapping.has(event.heroVideo)) {
      updates.heroVideo = urlMapping.get(event.heroVideo);
    }

    if (Array.isArray(event.gallery)) {
      const newGallery = event.gallery.map((url) => {
        const normalizedUrl = typeof url === 'string' ? url : '';
        return urlMapping.has(normalizedUrl)
          ? urlMapping.get(normalizedUrl)
          : normalizedUrl;
      });
      if (JSON.stringify(newGallery) !== JSON.stringify(event.gallery)) {
        updates.gallery = newGallery;
      }
    }

    if (Array.isArray(event.imageBubbles)) {
      const newImageBubbles = event.imageBubbles.map((bubble) => {
        if (!bubble || typeof bubble !== 'object') return bubble;
        const bubbleRecord = bubble as Record<string, any>;
        const image = typeof bubbleRecord.image === 'string' ? bubbleRecord.image : '';
        return urlMapping.has(image)
          ? { ...bubbleRecord, image: urlMapping.get(image) }
          : bubbleRecord;
      });
      if (JSON.stringify(newImageBubbles) !== JSON.stringify(event.imageBubbles)) {
        updates.imageBubbles = newImageBubbles;
      }
    }

    if (Object.keys(updates).length > 0) {
      try {
        await prisma.event.update({
          where: { id: event.id },
          data: updates,
        });
        console.log(`  Updated event ${event.legacyId}`);
        updated++;
      } catch (error) {
        errors.push(`Failed to update event ${event.id}`);
      }
    }
  }

  console.log(`Database records updated: ${updated}, errors: ${errors.length}`);
  return { updated, errors };
}

/**
 * Save URL mapping to file for reference
 */
function saveUrlMapping(): void {
  if (dryRun) return;

  const mappingObj: Record<string, string> = {};
  urlMapping.forEach((value, key) => {
    mappingObj[key] = value;
  });

  fs.writeFileSync(URL_MAPPING_PATH, JSON.stringify(mappingObj, null, 2));
  console.log(`\nURL mapping saved to: ${URL_MAPPING_PATH}`);
}

/**
 * Main migration function
 */
async function main() {
  validateArgs();

  console.log('========================================');
  console.log('Files to Object Storage Migration');
  console.log('========================================');
  console.log(
    `Mode: ${
      updateDbOnly
        ? 'UPDATE DB ONLY (no uploads)'
        : dryRun
          ? 'DRY RUN (no uploads)'
          : 'LIVE (uploading files)'
    }`
  );
  console.log(`DB Update: ${skipDbUpdate || dryRun ? 'SKIPPED' : 'ENABLED'}`);
  console.log('');

  try {
    const teamResult = { count: 0, errors: [] as string[] };
    const partnerResult = { count: 0, errors: [] as string[] };
    const eventResult = { count: 0, errors: [] as string[] };

    if (updateDbOnly) {
      console.log('Skipping uploads and reusing existing URL mapping.');
      loadUrlMapping();
    } else {
      // Check storage configuration
      if (!checkStorageConfig()) {
        process.exit(1);
      }

      const teamMigration = await migrateTeamPhotos();
      teamResult.count = teamMigration.count;
      teamResult.errors = teamMigration.errors;

      const partnerMigration = await migratePartnerLogos();
      partnerResult.count = partnerMigration.count;
      partnerResult.errors = partnerMigration.errors;

      const eventMigration = await migrateEventAssets();
      eventResult.count = eventMigration.count;
      eventResult.errors = eventMigration.errors;

      saveUrlMapping();
    }

    // Update database records
    const dbResult = await updateDatabaseUrls();

    // Summary
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Team photos: ${teamResult.count} uploaded, ${teamResult.errors.length} errors`);
    console.log(`Partner logos: ${partnerResult.count} uploaded, ${partnerResult.errors.length} errors`);
    console.log(`Event assets: ${eventResult.count} uploaded, ${eventResult.errors.length} errors`);
    console.log(`Database records updated: ${dbResult.updated}, ${dbResult.errors.length} errors`);

    const totalErrors = teamResult.errors.length + partnerResult.errors.length + eventResult.errors.length + dbResult.errors.length;

    if (totalErrors > 0) {
      console.log(`\nERRORS: ${totalErrors}`);
    } else {
      console.log('\nAll migrations completed successfully!');
    }

    if (dryRun) {
      console.log('\nThis was a dry run. No files were uploaded.');
      console.log('Run without --dry-run to perform the actual migration.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
