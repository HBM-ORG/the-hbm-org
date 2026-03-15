import {
  createPresignedGetUrl,
  createPresignedPutUrl,
  deleteObject,
  extractKeyFromUrl,
  getStorageConfigSummary,
  uploadObject,
} from '../storage/index.js';

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];
const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  'application/octet-stream',
];
const VALID_KEY_PREFIXES = ['events', 'team', 'partner-logos', 'emails', 'uploads', 'cms'];
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;
const SITE_SETTINGS_MEDIA_MAX_FILE_SIZE = 500 * 1024 * 1024;

type UploadOptions = {
  filename: string;
  contentType?: string;
  contentLength?: number;
  keyPrefix?: string;
  expiresInSeconds?: number;
};

export function checkStorageStatus() {
  return getStorageConfigSummary();
}

function getMaxFileSizeForPrefix(keyPrefix: string) {
  if (keyPrefix === 'cms/site-settings' || keyPrefix.startsWith('cms/site-settings/')) {
    return SITE_SETTINGS_MEDIA_MAX_FILE_SIZE;
  }

  return DEFAULT_MAX_FILE_SIZE;
}

export async function generateUploadUrl(options: UploadOptions) {
  const status = checkStorageStatus();
  if (!status.isReady) {
    throw new Error(`Storage not configured: ${status.missingKeys.join(', ')}`);
  }

  if (!options.filename || typeof options.filename !== 'string') {
    throw new Error('filename is required');
  }

  const contentType = options.contentType || 'application/octet-stream';
  if (!ALL_ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const keyPrefix = options.keyPrefix || 'uploads';
  const maxFileSize = getMaxFileSizeForPrefix(keyPrefix);

  if (options.contentLength && Number(options.contentLength) > maxFileSize) {
    throw new Error(`File too large (max ${maxFileSize / (1024 * 1024)}MB)`);
  }

  const isValidPrefix = VALID_KEY_PREFIXES.some(
    (prefix) => keyPrefix === prefix || keyPrefix.startsWith(`${prefix}/`),
  );
  if (!isValidPrefix) {
    throw new Error(`Invalid key prefix: ${keyPrefix}`);
  }

  return createPresignedPutUrl({
    filename: options.filename,
    contentType,
    keyPrefix,
    expiresInSeconds: options.expiresInSeconds || 900,
  });
}

export async function uploadBufferToStorage(options: UploadOptions & { body: Buffer }) {
  const status = checkStorageStatus();
  if (!status.isReady) {
    throw new Error(`Storage not configured: ${status.missingKeys.join(', ')}`);
  }

  if (!options.filename || typeof options.filename !== 'string') {
    throw new Error('filename is required');
  }

  const contentType = options.contentType || 'application/octet-stream';
  if (!ALL_ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const keyPrefix = options.keyPrefix || 'uploads';
  const maxFileSize = getMaxFileSizeForPrefix(keyPrefix);
  const contentLength = Number(options.contentLength || options.body.byteLength || 0);

  if (contentLength > maxFileSize) {
    throw new Error(`File too large (max ${maxFileSize / (1024 * 1024)}MB)`);
  }

  const isValidPrefix = VALID_KEY_PREFIXES.some(
    (prefix) => keyPrefix === prefix || keyPrefix.startsWith(`${prefix}/`),
  );
  if (!isValidPrefix) {
    throw new Error(`Invalid key prefix: ${keyPrefix}`);
  }

  return uploadObject({
    filename: options.filename,
    contentType,
    keyPrefix,
    body: options.body,
  });
}

export async function generateDownloadUrl({
  key,
  expiresInSeconds,
}: {
  key: string;
  expiresInSeconds?: number;
}) {
  const status = checkStorageStatus();
  if (!status.isReady) {
    throw new Error(`Storage not configured: ${status.missingKeys.join(', ')}`);
  }

  if (!key || typeof key !== 'string') {
    throw new Error('key is required');
  }

  return createPresignedGetUrl({
    key,
    expiresInSeconds: expiresInSeconds || 900,
  });
}

export async function removeFile(keyOrUrl: string) {
  const key = keyOrUrl.startsWith('http') ? extractKeyFromUrl(keyOrUrl) : keyOrUrl;
  if (!key) {
    throw new Error('invalid key or url');
  }
  await deleteObject(key);
}

export function getKeyFromUrl(url?: string | null) {
  return extractKeyFromUrl(url);
}
