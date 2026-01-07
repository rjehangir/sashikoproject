/**
 * Persistence middleware configuration
 * Handles localStorage persistence with selective state saving
 */

import type { PersistOptions } from 'zustand/middleware';

import type { AppStore } from '../index';

/**
 * Storage key for the persisted state
 */
export const STORAGE_KEY = 'sashiko-store';

/**
 * Current storage version for migrations
 */
export const STORAGE_VERSION = 1;

/**
 * Fields to persist to localStorage
 * Excludes transient UI state (isDrawing, selectedElementId, etc.)
 */
export type PersistedFields = Pick<
  AppStore,
  | 'patternId'
  | 'patternName'
  | 'patternAuthor'
  | 'patternLicense'
  | 'patternNotes'
  | 'svgContent'
  | 'viewBox'
  | 'backgroundColor'
  | 'threadColor'
  | 'showGrid'
  | 'unit'
  | 'tileSizeMm'
  | 'rows'
  | 'cols'
  | 'rowOffset'
  | 'stitchLengthMm'
  | 'gapLengthMm'
  | 'strokeWidthMm'
  | 'snapGridMm'
>;

/**
 * Extract only the fields we want to persist
 */
export function partializeState(state: AppStore): PersistedFields {
  return {
    // Pattern data
    patternId: state.patternId,
    patternName: state.patternName,
    patternAuthor: state.patternAuthor,
    patternLicense: state.patternLicense,
    patternNotes: state.patternNotes,
    svgContent: state.svgContent,
    viewBox: state.viewBox,
    // Display settings
    backgroundColor: state.backgroundColor,
    threadColor: state.threadColor,
    showGrid: state.showGrid,
    // Size settings
    unit: state.unit,
    tileSizeMm: state.tileSizeMm,
    rows: state.rows,
    cols: state.cols,
    rowOffset: state.rowOffset,
    // Stitch settings
    stitchLengthMm: state.stitchLengthMm,
    gapLengthMm: state.gapLengthMm,
    strokeWidthMm: state.strokeWidthMm,
    snapGridMm: state.snapGridMm,
  };
}

/**
 * Persistence configuration for Zustand
 */
export const persistConfig: PersistOptions<AppStore, PersistedFields> = {
  name: STORAGE_KEY,
  version: STORAGE_VERSION,
  partialize: partializeState,
  // Migration function for future schema changes
  migrate: (persistedState, version) => {
    // Handle migrations when STORAGE_VERSION increases
    if (version === 0) {
      // Migration from v0 to v1 (if needed in future)
      return persistedState as PersistedFields;
    }
    return persistedState as PersistedFields;
  },
};
