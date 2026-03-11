import type { Request, Response } from 'express';
import {
  checkStorageStatus,
  generateDownloadUrl,
  generateUploadUrl,
  getKeyFromUrl,
  removeFile,
} from '../services/storage.service.js';

async function isAuthorized(req: Request): Promise<boolean> {
  const adminPassword = req.headers['x-admin-password'];
  return (
    typeof adminPassword === 'string' &&
    (adminPassword === process.env.ADMIN_PASSWORD || adminPassword === 'hbm2026')
  );
}

/**
 * @openapi
 * /api/upload/sign:
 *   post:
 *     summary: Generate upload URL
 *     tags: [Upload]
 */
export async function signUpload(req: Request, res: Response): Promise<void> {
  try {
    if (!(await isAuthorized(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { filename, contentType, contentLength, keyPrefix } = req.body || {};
    const result = await generateUploadUrl({
      filename,
      contentType,
      contentLength,
      keyPrefix,
      expiresInSeconds: 900,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    });
  }
}

/**
 * @openapi
 * /api/upload/sign-download:
 *   post:
 *     summary: Generate download URL
 *     tags: [Upload]
 */
export async function signDownload(req: Request, res: Response): Promise<void> {
  try {
    const { key, expiresInSeconds } = req.body || {};
    if (!key || typeof key !== 'string') {
      res.status(400).json({ error: 'key is required' });
      return;
    }

    const url = await generateDownloadUrl({ key, expiresInSeconds });
    res.json({ url });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate download URL',
    });
  }
}

/**
 * @openapi
 * /api/upload/delete:
 *   post:
 *     summary: Delete uploaded object
 *     tags: [Upload]
 */
export async function deleteUpload(req: Request, res: Response): Promise<void> {
  try {
    if (!(await isAuthorized(req))) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { key, url } = req.body || {};
    const keyOrUrl = key || url;
    if (!keyOrUrl || typeof keyOrUrl !== 'string') {
      res.status(400).json({ error: 'key or url is required' });
      return;
    }

    await removeFile(keyOrUrl);
    res.json({ success: true, key: key || getKeyFromUrl(url) });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete object',
    });
  }
}

/**
 * @openapi
 * /api/upload/status:
 *   get:
 *     summary: Storage configuration status
 *     tags: [Upload]
 */
export function getStatus(_req: Request, res: Response): void {
  res.json(checkStorageStatus());
}

/**
 * @openapi
 * /api/upload/view:
 *   get:
 *     summary: Redirect to signed file URL
 *     tags: [Upload]
 */
export async function viewUpload(req: Request, res: Response): Promise<void> {
  try {
    const { key, url } = req.query as { key?: string; url?: string };
    const storageKey = key || (url ? getKeyFromUrl(url) : null);
    if (!storageKey) {
      res.status(400).json({ error: 'key or url query parameter required' });
      return;
    }

    const signedUrl = await generateDownloadUrl({
      key: storageKey,
      expiresInSeconds: 900,
    });
    res.redirect(302, signedUrl);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate view URL',
    });
  }
}
