/**
 * Store-specific types
 * Types used exclusively by the Zustand store implementation
 */

import type { StateCreator } from 'zustand';

/**
 * Type helper for creating slices
 * Ensures proper typing when combining slices
 */
export type SliceCreator<T, Shared = object> = StateCreator<T & Shared, [], [], T>;

/**
 * Persistence configuration
 */
export interface PersistConfig {
  /** Storage key name */
  name: string;
  /** Version for migrations */
  version: number;
}

/**
 * State to persist to localStorage
 */
export interface PersistedState {
  // Pattern data
  patternId: string | null;
  patternName: string;
  patternAuthor: string;
  patternLicense: string;
  patternNotes: string;
  svgContent: string;
  viewBox: string;

  // Display settings
  backgroundColor: string;
  threadColor: string;
  showGrid: boolean;

  // Size settings
  unit: 'mm' | 'in';
  tileSizeMm: number;
  rows: number;
  cols: number;
  rowOffset: number;

  // Stitch settings
  stitchLengthMm: number;
  gapLengthMm: number;
  strokeWidthMm: number;
  snapGridMm: number;
}
