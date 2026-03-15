/**
 * Google Cloud Storage Adapter
 * Uses @google-cloud/storage SDK
 */

import { randomUUID } from 'crypto';
import { Storage } from '@google-cloud/storage';
import type {
  DirectUploadOptions,
  DirectUploadResult,
  PresignedGetOptions,
  PresignedPutOptions,
  PresignedPutResult,
  StorageAdapter,
  StorageConfigSummary,
} from '../types.js';

let client: Storage | null = null;

/**
 * Get list of missing required environment variables
 */
function getGcsMissingKeys(): string[] {
  const required = ['GCS_BUCKET'] as const;
  return required.filter((key) => !String(process.env[key] || '').trim());
}

/**
 * Parse inline credentials JSON from environment
 */
function parseInlineCredentials(): object | undefined {
  const raw = String(process.env.GCS_CREDENTIALS_JSON || '').trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Get or create GCS client
 */
function getClient(): Storage {
  if (client) return client;

  const projectId = String(process.env.GCS_PROJECT_ID || '').trim() || undefined;
  const keyFilename = String(process.env.GCS_KEY_FILE || '').trim() || undefined;
  const credentials = parseInlineCredentials();

  client = new Storage({
    projectId,
    keyFilename,
    credentials,
  });

  return client;
}

/**
 * Get bucket name from environment
 */
function getBucketName(): string {
  const bucket = String(process.env.GCS_BUCKET || '').trim();
  if (!bucket) throw new Error('GCS_BUCKET missing');
  return bucket;
}

function buildObjectKey(opts: { keyPrefix?: string; filename?: string }) {
  const keyPrefix = String(opts.keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
  const safeName = String(opts.filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${keyPrefix}/${randomUUID()}-${safeName}`;
}

function buildViewUrl(key: string) {
  return `https://storage.googleapis.com/${getBucketName()}/${key}`;
}

/**
 * Google Cloud Storage Adapter
 */
export class GcsStorageAdapter implements StorageAdapter {
  provider = 'gcs' as const;

  getConfigSummary(): StorageConfigSummary {
    const missingKeys = getGcsMissingKeys();
    return {
      provider: this.provider,
      isReady: missingKeys.length === 0,
      missingKeys,
    };
  }

  async createPresignedPutUrl(opts: PresignedPutOptions): Promise<PresignedPutResult> {
    const storage = getClient();

    const key = buildObjectKey(opts);

    const bucketName = getBucketName();
    const file = storage.bucket(bucketName).file(key);
    const expiresMs = Date.now() + (Number(opts.expiresInSeconds || 900) * 1000);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresMs,
      contentType: opts.contentType || 'application/octet-stream',
    });

    // GCS public URL format
    const viewUrl = buildViewUrl(key);

    return { uploadUrl, key, viewUrl };
  }

  async uploadObject(opts: DirectUploadOptions): Promise<DirectUploadResult> {
    const storage = getClient();
    const key = buildObjectKey(opts);
    const bucketName = getBucketName();
    const file = storage.bucket(bucketName).file(key);

    await file.save(opts.body, {
      contentType: opts.contentType || 'application/octet-stream',
      resumable: false,
      public: true,
    });

    return {
      key,
      viewUrl: buildViewUrl(key),
    };
  }

  async createPresignedGetUrl(opts: PresignedGetOptions): Promise<string> {
    const storage = getClient();
    const bucketName = getBucketName();
    const file = storage.bucket(bucketName).file(opts.key);

    const expiresMs = Date.now() + (Number(opts.expiresInSeconds || 900) * 1000);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresMs,
    });

    return url;
  }

  async deleteObject(key: string): Promise<void> {
    const storage = getClient();
    const bucketName = getBucketName();

    await storage.bucket(bucketName).file(key).delete({ ignoreNotFound: true });
  }

  extractKeyFromUrl(raw?: string | null): string | null {
    if (!raw) return null;

    try {
      const url = new URL(raw);
      const bucket = getBucketName();
      const path = url.pathname.replace(/^\/+/, '');

      // Format: gs://bucket/key
      if (url.protocol === 'gs:' && bucket && url.hostname === bucket) {
        return path || null;
      }

      // Format: https://storage.googleapis.com/bucket/key
      if (url.hostname === 'storage.googleapis.com' && bucket && path.startsWith(`${bucket}/`)) {
        return path.slice(bucket.length + 1);
      }

      // Format: https://bucket.storage.googleapis.com/key
      if (bucket && url.hostname === `${bucket}.storage.googleapis.com`) {
        return path || null;
      }

      return null;
    } catch {
      return null;
    }
  }
}
