/**
 * Storage Adapter Factory and Facade
 * Provides unified interface for object storage operations
 */

import type { StorageAdapter, StorageProviderName } from './types.js';
import { SpacesStorageAdapter } from './adapters/spaces.adapter.js';
import { GcsStorageAdapter } from './adapters/gcs.adapter.js';

let adapter: StorageAdapter | null = null;

/**
 * Get storage provider name from environment
 * Defaults to 'spaces' if not set or invalid
 */
export function getStorageProviderName(): StorageProviderName {
  const raw = String(process.env.STORAGE_PROVIDER || '').trim().toLowerCase();
  if (raw === 'gcs') return 'gcs';
  return 'spaces';
}

/**
 * Create a new storage adapter instance
 */
export function createStorageAdapter(provider: StorageProviderName): StorageAdapter {
  if (provider === 'gcs') return new GcsStorageAdapter();
  return new SpacesStorageAdapter();
}

/**
 * Get the singleton storage adapter instance
 * Creates adapter on first call based on STORAGE_PROVIDER env var
 */
export function getStorageAdapter(): StorageAdapter {
  if (adapter) return adapter;

  adapter = createStorageAdapter(getStorageProviderName());
  return adapter;
}

/**
 * Reset the adapter (useful for testing)
 */
export function resetStorageAdapter(): void {
  adapter = null;
}

// Re-export types
export type { StorageAdapter, StorageProviderName } from './types.js';
export type {
  PresignedGetOptions,
  PresignedPutOptions,
  PresignedPutResult,
  StorageConfigSummary,
} from './types.js';
