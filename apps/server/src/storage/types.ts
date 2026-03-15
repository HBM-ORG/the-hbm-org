/**
 * Storage Adapter Types
 * Defines interfaces for object storage providers (DigitalOcean Spaces, GCS)
 */

export type StorageProviderName = 'spaces' | 'gcs';

export type PresignedPutOptions = {
  keyPrefix?: string;
  filename?: string;
  contentType?: string;
  expiresInSeconds?: number;
};

export type PresignedPutResult = {
  uploadUrl: string;
  key: string;
  viewUrl: string;
};

export type DirectUploadOptions = {
  keyPrefix?: string;
  filename?: string;
  contentType?: string;
  body: Buffer;
};

export type DirectUploadResult = {
  key: string;
  viewUrl: string;
};

export type PresignedGetOptions = {
  key: string;
  expiresInSeconds?: number;
};

export type StorageConfigSummary = {
  provider: StorageProviderName;
  isReady: boolean;
  missingKeys: string[];
};

/**
 * Storage Adapter Interface
 * Implementations: SpacesStorageAdapter, GcsStorageAdapter
 */
export interface StorageAdapter {
  provider: StorageProviderName;

  /**
   * Check if storage configuration is complete
   */
  getConfigSummary(): StorageConfigSummary;

  /**
   * Create a pre-signed URL for uploading a file
   * Client uploads directly to this URL
   */
  createPresignedPutUrl(opts: PresignedPutOptions): Promise<PresignedPutResult>;

  /**
   * Create a pre-signed URL for downloading/viewing a file
   */
  createPresignedGetUrl(opts: PresignedGetOptions): Promise<string>;

  /**
   * Upload an object from the server process directly to storage
   */
  uploadObject(opts: DirectUploadOptions): Promise<DirectUploadResult>;

  /**
   * Delete an object from storage
   */
  deleteObject(key: string): Promise<void>;

  /**
   * Extract storage key from a public URL
   * Returns null if URL is not from this storage provider
   */
  extractKeyFromUrl(raw?: string | null): string | null;
}
