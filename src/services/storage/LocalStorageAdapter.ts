/**
 * LocalStorage Adapter Service
 * Type-safe wrapper for browser localStorage
 */

import type { Result } from '../../types';
import { ok, err } from '../../types';

/**
 * Storage error types
 */
export type StorageErrorType =
  | 'quota_exceeded'
  | 'parse_error'
  | 'stringify_error'
  | 'not_available'
  | 'unknown';

/**
 * Storage error with type
 */
export interface StorageError {
  type: StorageErrorType;
  message: string;
  originalError?: Error | undefined;
}

/**
 * LocalStorage Adapter - type-safe localStorage operations
 */
export class LocalStorageAdapter {
  private prefix: string;
  private storage: Storage | null;

  constructor(prefix: string = 'sashiko') {
    this.prefix = prefix;
    this.storage = this.getStorage();
  }

  /**
   * Get storage instance (may be null if not available)
   */
  private getStorage(): Storage | null {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      return null;
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.storage !== null;
  }

  /**
   * Build prefixed key
   */
  private key(name: string): string {
    return `${this.prefix}:${name}`;
  }

  /**
   * Get a value from storage
   */
  get<T>(name: string): Result<T | null, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      const raw = this.storage.getItem(this.key(name));
      if (raw === null) {
        return ok(null);
      }

      try {
        return ok(JSON.parse(raw) as T);
      } catch (parseError) {
        return err({
          type: 'parse_error',
          message: `Failed to parse stored value for ${name}`,
          originalError: parseError instanceof Error ? parseError : undefined,
        });
      }
    } catch (error) {
      return err({
        type: 'unknown',
        message: `Failed to read ${name} from storage`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get a raw string value
   */
  getRaw(name: string): Result<string | null, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      return ok(this.storage.getItem(this.key(name)));
    } catch (error) {
      return err({
        type: 'unknown',
        message: `Failed to read ${name} from storage`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Set a value in storage
   */
  set<T>(name: string, value: T): Result<void, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      let serialized: string;
      try {
        serialized = JSON.stringify(value);
      } catch (stringifyError) {
        return err({
          type: 'stringify_error',
          message: `Failed to serialize value for ${name}`,
          originalError: stringifyError instanceof Error ? stringifyError : undefined,
        });
      }

      this.storage.setItem(this.key(name), serialized);
      return ok(undefined);
    } catch (error) {
      // Check for quota exceeded
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22)
      ) {
        return err({
          type: 'quota_exceeded',
          message: 'Storage quota exceeded',
          originalError: error,
        });
      }

      return err({
        type: 'unknown',
        message: `Failed to write ${name} to storage`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Set a raw string value
   */
  setRaw(name: string, value: string): Result<void, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      this.storage.setItem(this.key(name), value);
      return ok(undefined);
    } catch (error) {
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22)
      ) {
        return err({
          type: 'quota_exceeded',
          message: 'Storage quota exceeded',
          originalError: error,
        });
      }

      return err({
        type: 'unknown',
        message: `Failed to write ${name} to storage`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Remove a value from storage
   */
  remove(name: string): Result<void, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      this.storage.removeItem(this.key(name));
      return ok(undefined);
    } catch (error) {
      return err({
        type: 'unknown',
        message: `Failed to remove ${name} from storage`,
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Check if a key exists
   */
  has(name: string): boolean {
    if (!this.storage) return false;
    return this.storage.getItem(this.key(name)) !== null;
  }

  /**
   * Get all keys with this prefix
   */
  keys(): string[] {
    if (!this.storage) return [];

    const prefixWithColon = `${this.prefix}:`;
    const keys: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(prefixWithColon)) {
        keys.push(key.slice(prefixWithColon.length));
      }
    }

    return keys;
  }

  /**
   * Clear all values with this prefix
   */
  clear(): Result<void, StorageError> {
    if (!this.storage) {
      return err({
        type: 'not_available',
        message: 'localStorage is not available',
      });
    }

    try {
      const keys = this.keys();
      for (const key of keys) {
        this.storage.removeItem(this.key(key));
      }
      return ok(undefined);
    } catch (error) {
      return err({
        type: 'unknown',
        message: 'Failed to clear storage',
        originalError: error instanceof Error ? error : undefined,
      });
    }
  }
}

// Default singleton instance
export const localStorageAdapter = new LocalStorageAdapter();
