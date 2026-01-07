/**
 * Stitch slice - manages stitch rendering parameters
 * Handles stitch length, gap, stroke width, and snap grid
 */

import type { StateCreator } from 'zustand';

import {
  DEFAULT_STITCH_LENGTH_MM,
  DEFAULT_GAP_LENGTH_MM,
  DEFAULT_STROKE_WIDTH_MM,
  DEFAULT_SNAP_GRID_MM,
  MIN_STITCH_LENGTH_MM,
  MAX_STITCH_LENGTH_MM,
  MIN_STROKE_WIDTH_MM,
  MAX_STROKE_WIDTH_MM,
} from '../../config/constants';
import type { PatternV1 } from '../../types';

/**
 * Stitch state shape
 */
export interface StitchStateData {
  stitchLengthMm: number;
  gapLengthMm: number;
  strokeWidthMm: number;
  snapGridMm: number;
}

/**
 * Stitch actions
 */
export interface StitchActions {
  setStitchLengthMm: (length: number) => void;
  setGapLengthMm: (gap: number) => void;
  setStrokeWidthMm: (width: number) => void;
  setSnapGridMm: (grid: number) => void;
  loadStitchDefaults: (pattern: PatternV1) => void;
  resetStitchSettings: () => void;
}

/**
 * Combined stitch slice type
 */
export type StitchSlice = StitchStateData & StitchActions;

/**
 * Initial stitch state
 */
const initialStitchState: StitchStateData = {
  stitchLengthMm: DEFAULT_STITCH_LENGTH_MM,
  gapLengthMm: DEFAULT_GAP_LENGTH_MM,
  strokeWidthMm: DEFAULT_STROKE_WIDTH_MM,
  snapGridMm: DEFAULT_SNAP_GRID_MM,
};

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Create the stitch slice
 */
export const createStitchSlice: StateCreator<StitchSlice, [], [], StitchSlice> = (set) => ({
  ...initialStitchState,

  setStitchLengthMm: (length) =>
    set({
      stitchLengthMm: clamp(length, MIN_STITCH_LENGTH_MM, MAX_STITCH_LENGTH_MM),
    }),

  setGapLengthMm: (gap) =>
    set({
      // Gap must be positive, max at 2x stitch length
      gapLengthMm: Math.max(0.1, gap),
    }),

  setStrokeWidthMm: (width) =>
    set({
      strokeWidthMm: clamp(width, MIN_STROKE_WIDTH_MM, MAX_STROKE_WIDTH_MM),
    }),

  setSnapGridMm: (grid) =>
    set({
      // Snap grid must be positive
      snapGridMm: Math.max(0.1, grid),
    }),

  loadStitchDefaults: (pattern) =>
    set({
      stitchLengthMm: pattern.defaults.stitchLengthMm,
      gapLengthMm: pattern.defaults.gapLengthMm,
      strokeWidthMm: pattern.defaults.strokeWidthMm,
      snapGridMm: pattern.defaults.snapGridMm,
    }),

  resetStitchSettings: () => set(initialStitchState),
});
