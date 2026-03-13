/**
 * DigitalOcean Spaces Storage Adapter
 * Uses AWS S3 SDK (Spaces is S3-compatible)
 */

import { randomUUID } from 'crypto';
import {
  S3Client,
  type PutObjectCommandInput,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  PresignedGetOptions,
  PresignedPutOptions,
  PresignedPutResult,
  StorageAdapter,
  StorageConfigSummary,
} from '../types.js';

let client: S3Client | null = null;

/**
 * Get list of missing required environment variables
 */
function getSpacesMissingKeys(): string[] {
  const required = ['SPACES_ENDPOINT', 'SPACES_REGION', 'SPACES_BUCKET', 'SPACES_KEY', 'SPACES_SECRET'] as const;
  return required.filter((key) => !String(process.env[key] || '').trim());
}

/**
 * Get bucket name from environment
 */
function getSpacesBucket(): string {
  const bucket = String(process.env.SPACES_BUCKET || '').trim();
  if (!bucket) throw new Error('SPACES_BUCKET missing');
  return bucket;
}

/**
 * Get or create S3 client
 */
function getClient(): S3Client {
  const endpoint = String(process.env.SPACES_ENDPOINT || '').trim();
  const region = String(process.env.SPACES_REGION || '').trim();
  const accessKeyId = String(process.env.SPACES_KEY || '').trim();
  const secretAccessKey = String(process.env.SPACES_SECRET || '').trim();

  const missing = getSpacesMissingKeys();
  if (missing.length) {
    throw new Error(`Spaces env vars missing (${missing.join(', ')})`);
  }

  if (client) return client;

  client = new S3Client({
    region,
    endpoint,
    forcePathStyle: false,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

/**
 * DigitalOcean Spaces Storage Adapter
 */
export class SpacesStorageAdapter implements StorageAdapter {
  provider = 'spaces' as const;

  getConfigSummary(): StorageConfigSummary {
    const missingKeys = getSpacesMissingKeys();
    return {
      provider: this.provider,
      isReady: missingKeys.length === 0,
      missingKeys,
    };
  }

  async createPresignedPutUrl(opts: PresignedPutOptions): Promise<PresignedPutResult> {
    const s3 = getClient();

    // Sanitize key prefix and filename
    const keyPrefix = String(opts.keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
    const safeName = String(opts.filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${keyPrefix}/${randomUUID()}-${safeName}`;

    const params: PutObjectCommandInput = {
      Bucket: getSpacesBucket(),
      Key: key,
      ContentType: opts.contentType || 'application/octet-stream',
      ACL: 'public-read',
    };

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand(params),
      { expiresIn: opts.expiresInSeconds || 900 }
    );

    // Build view URL
    const endpoint = String(process.env.SPACES_ENDPOINT || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
    const bucket = getSpacesBucket();
    const viewUrl = endpoint && bucket ? `https://${bucket}.${endpoint}/${key}` : key;

    return { uploadUrl, key, viewUrl };
  }

  async createPresignedGetUrl(opts: PresignedGetOptions): Promise<string> {
    const s3 = getClient();

    return getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: getSpacesBucket(),
        Key: opts.key,
      }),
      { expiresIn: opts.expiresInSeconds || 900 }
    );
  }

  async deleteObject(key: string): Promise<void> {
    const s3 = getClient();

    await s3.send(
      new DeleteObjectCommand({
        Bucket: getSpacesBucket(),
        Key: key,
      })
    );
  }

  extractKeyFromUrl(raw?: string | null): string | null {
    if (!raw) return null;

    try {
      const bucket = getSpacesBucket();
      const endpoint = String(process.env.SPACES_ENDPOINT || '')
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');

      if (!bucket || !endpoint) return null;

      const url = new URL(raw, `https://${endpoint}`);
      const host = url.hostname;
      const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

      // Format: bucket.endpoint/key
      if (host.startsWith(`${bucket}.`) && host.includes(endpoint)) {
        return path;
      }

      // Format: endpoint/bucket/key
      if (host.includes(endpoint) && path.startsWith(`${bucket}/`)) {
        return path.slice(bucket.length + 1);
      }

      return null;
    } catch {
      return null;
    }
  }
}
