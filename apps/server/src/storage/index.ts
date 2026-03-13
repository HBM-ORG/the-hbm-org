import { getStorageAdapter } from './adapter.js';
import type {
  PresignedGetOptions,
  PresignedPutOptions,
  PresignedPutResult,
  StorageConfigSummary,
} from './types.js';

export function getStorageConfigSummary(): StorageConfigSummary {
  return getStorageAdapter().getConfigSummary();
}

export function createPresignedPutUrl(
  opts: PresignedPutOptions,
): Promise<PresignedPutResult> {
  return getStorageAdapter().createPresignedPutUrl(opts);
}

export function createPresignedGetUrl(opts: PresignedGetOptions): Promise<string> {
  return getStorageAdapter().createPresignedGetUrl(opts);
}

export function deleteObject(key: string): Promise<void> {
  return getStorageAdapter().deleteObject(key);
}

export function extractKeyFromUrl(raw?: string | null): string | null {
  return getStorageAdapter().extractKeyFromUrl(raw);
}

export type * from './types.js';
