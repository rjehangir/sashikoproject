/**
 * Size slice - manages pattern dimensions and tiling
 * Handles tile size, rows, cols, and offset settings
 */

import type { StateCreator } from 'zustand';

import {
  DEFAULT_TILE_SIZE_MM,
  DEFAULT_ROWS,
  DEFAULT_COLS,
  DEFAULT_ROW_OFFSET,
  MIN_TILE_SIZE_MM,
  MAX_TILE_SIZE_MM,
  MIN_ROWS,
  MAX_ROWS,
  MIN_COLS,
  MAX_COLS,
} from '../../config/constants';
import type { Unit, SizeMode, Dimensions } from '../../types';

/**
 * Size state shape
 */
export interface SizeStateData {
  unit: Unit;
  sizeMode: SizeMode;
  tileSizeMm: number;
  rows: number;
  cols: number;
  rowOffset: number;
  finalSizeMm: Dimensions | null;
}

/**
 * Size actions
 */
export interface SizeActions {
  setUnit: (unit: Unit) => void;
  setSizeMode: (mode: SizeMode) => void;
  setTileSizeMm: (size: number) => void;
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setRowOffset: (offset: number) => void;
  setFinalSizeMm: (size: Dimensions | null) => void;
  resetSizeSettings: () => void;
}

/**
 * Combined size slice type
 */
export type SizeSlice = SizeStateData & SizeActions;

/**
 * Initial size state
 */
const initialSizeState: SizeStateData = {
  unit: 'mm',
  sizeMode: 'tile-size',
  tileSizeMm: DEFAULT_TILE_SIZE_MM,
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  rowOffset: DEFAULT_ROW_OFFSET,
  finalSizeMm: null,
};

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Create the size slice
 */
export const createSizeSlice: StateCreator<SizeSlice, [], [], SizeSlice> = (set) => ({
  ...initialSizeState,

  setUnit: (unit) => set({ unit }),

  setSizeMode: (mode) => set({ sizeMode: mode }),

  setTileSizeMm: (size) =>
    set({
      tileSizeMm: clamp(size, MIN_TILE_SIZE_MM, MAX_TILE_SIZE_MM),
    }),

  setRows: (rows) =>
    set({
      rows: clamp(Math.round(rows), MIN_ROWS, MAX_ROWS),
    }),

  setCols: (cols) =>
    set({
      cols: clamp(Math.round(cols), MIN_COLS, MAX_COLS),
    }),

  setRowOffset: (offset) =>
    set({
      // Row offset is a ratio between 0 and 1
      rowOffset: clamp(offset, 0, 1),
    }),

  setFinalSizeMm: (size) => set({ finalSizeMm: size }),

  resetSizeSettings: () => set(initialSizeState),
});
