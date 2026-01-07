/**
 * Storage Service Facade
 * High-level storage operations for the application
 */

import type { PatternV1, StitchDefaults, Dimensions } from '../../types';

import { LocalStorageAdapter, localStorageAdapter } from './LocalStorageAdapter';

// Re-export adapter
export { LocalStorageAdapter, localStorageAdapter } from './LocalStorageAdapter';
export type { StorageError, StorageErrorType } from './LocalStorageAdapter';

/**
 * Keys used for storage
 */
export const STORAGE_KEYS = {
  CURRENT_PATTERN: 'currentPattern',
  EDITOR_STATE: 'editorState',
  USER_PREFERENCES: 'userPreferences',
  RECENT_PATTERNS: 'recentPatterns',
  CUSTOM_PATTERNS: 'customPatterns',
} as const;

/**
 * Editor state that can be persisted
 */
export interface PersistedEditorState {
  svgContent?: string;
  viewBox?: string;
  backgroundColor?: string;
  threadColor?: string;
  showGrid?: boolean;
  unit?: 'mm' | 'in';
  sizeMode?: 'tile-size' | 'final-size';
  tileSizeMm?: number;
  rows?: number;
  cols?: number;
  rowOffset?: number;
  finalSizeMm?: Dimensions | null;
  stitchDefaults?: Partial<StitchDefaults>;
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultUnit?: 'mm' | 'in';
  defaultPaperSize?: string;
  showGrid?: boolean;
  autoSave?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Recent pattern entry
 */
export interface RecentPatternEntry {
  id: string;
  name: string;
  accessedAt: string;
}

/**
 * Storage Service - application-level storage operations
 */
export class StorageService {
  private adapter: LocalStorageAdapter;

  constructor(adapter?: LocalStorageAdapter) {
    this.adapter = adapter ?? localStorageAdapter;
  }

  // ============================================================================
  // PATTERN STORAGE
  // ============================================================================

  /**
   * Save current pattern state
   */
  saveCurrentPattern(pattern: Partial<PatternV1>): void {
    this.adapter.set(STORAGE_KEYS.CURRENT_PATTERN, pattern);
  }

  /**
   * Load current pattern state
   */
  loadCurrentPattern(): Partial<PatternV1> | null {
    const result = this.adapter.get<Partial<PatternV1>>(STORAGE_KEYS.CURRENT_PATTERN);
    return result.success ? result.data : null;
  }

  /**
   * Clear current pattern
   */
  clearCurrentPattern(): void {
    this.adapter.remove(STORAGE_KEYS.CURRENT_PATTERN);
  }

  // ============================================================================
  // EDITOR STATE
  // ============================================================================

  /**
   * Save editor state
   */
  saveEditorState(state: PersistedEditorState): void {
    this.adapter.set(STORAGE_KEYS.EDITOR_STATE, state);
  }

  /**
   * Load editor state
   */
  loadEditorState(): PersistedEditorState | null {
    const result = this.adapter.get<PersistedEditorState>(STORAGE_KEYS.EDITOR_STATE);
    return result.success ? result.data : null;
  }

  /**
   * Clear editor state
   */
  clearEditorState(): void {
    this.adapter.remove(STORAGE_KEYS.EDITOR_STATE);
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  /**
   * Save user preferences
   */
  savePreferences(prefs: UserPreferences): void {
    this.adapter.set(STORAGE_KEYS.USER_PREFERENCES, prefs);
  }

  /**
   * Load user preferences
   */
  loadPreferences(): UserPreferences | null {
    const result = this.adapter.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    return result.success ? result.data : null;
  }

  /**
   * Update a single preference
   */
  updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    const current = this.loadPreferences() || {};
    this.savePreferences({ ...current, [key]: value });
  }

  // ============================================================================
  // RECENT PATTERNS
  // ============================================================================

  /**
   * Add pattern to recent list
   */
  addRecentPattern(id: string, name: string): void {
    const recent = this.loadRecentPatterns();
    const entry: RecentPatternEntry = {
      id,
      name,
      accessedAt: new Date().toISOString(),
    };

    // Remove existing entry if present
    const filtered = recent.filter((p) => p.id !== id);

    // Add to front, limit to 10
    const updated = [entry, ...filtered].slice(0, 10);
    this.adapter.set(STORAGE_KEYS.RECENT_PATTERNS, updated);
  }

  /**
   * Load recent patterns
   */
  loadRecentPatterns(): RecentPatternEntry[] {
    const result = this.adapter.get<RecentPatternEntry[]>(STORAGE_KEYS.RECENT_PATTERNS);
    return result.success && result.data ? result.data : [];
  }

  /**
   * Clear recent patterns
   */
  clearRecentPatterns(): void {
    this.adapter.remove(STORAGE_KEYS.RECENT_PATTERNS);
  }

  // ============================================================================
  // CUSTOM PATTERNS
  // ============================================================================

  /**
   * Save a custom pattern
   */
  saveCustomPattern(pattern: PatternV1): void {
    const patterns = this.loadCustomPatterns();
    const updated = patterns.filter((p) => p.id !== pattern.id);
    updated.push(pattern);
    this.adapter.set(STORAGE_KEYS.CUSTOM_PATTERNS, updated);
  }

  /**
   * Load all custom patterns
   */
  loadCustomPatterns(): PatternV1[] {
    const result = this.adapter.get<PatternV1[]>(STORAGE_KEYS.CUSTOM_PATTERNS);
    return result.success && result.data ? result.data : [];
  }

  /**
   * Load a specific custom pattern
   */
  loadCustomPattern(id: string): PatternV1 | null {
    const patterns = this.loadCustomPatterns();
    return patterns.find((p) => p.id === id) || null;
  }

  /**
   * Delete a custom pattern
   */
  deleteCustomPattern(id: string): void {
    const patterns = this.loadCustomPatterns();
    const filtered = patterns.filter((p) => p.id !== id);
    this.adapter.set(STORAGE_KEYS.CUSTOM_PATTERNS, filtered);
  }

  /**
   * Clear all custom patterns
   */
  clearCustomPatterns(): void {
    this.adapter.remove(STORAGE_KEYS.CUSTOM_PATTERNS);
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.adapter.isAvailable();
  }

  /**
   * Clear all app data
   */
  clearAll(): void {
    this.adapter.clear();
  }

  /**
   * Export all data as JSON
   */
  exportData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const key of Object.values(STORAGE_KEYS)) {
      const result = this.adapter.get(key);
      if (result.success && result.data !== null) {
        data[key] = result.data;
      }
    }

    return data;
  }

  /**
   * Import data from JSON
   */
  importData(data: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(data)) {
      if (
        Object.values(STORAGE_KEYS).includes(
          key as (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
        )
      ) {
        this.adapter.set(key, value);
      }
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
