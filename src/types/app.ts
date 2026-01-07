/**
 * Legacy AppState type - maintained for backwards compatibility
 * Components should migrate to using the new store slice types
 * @deprecated Use slice types from src/store instead
 */

import type { PatternV1 } from './pattern';
import type { Unit, SizeMode, Dimensions } from './units';

import type { EditorMode, PreviewScaleMode } from './index';

// Re-export for backwards compatibility
export type { Unit, SizeMode, EditorMode };
export type { PaperSize } from './units';

/**
 * @deprecated Use the new store slice types instead
 */
export interface AppState {
  // Pattern data
  patternId: string | null;
  patternName: string;
  patternAuthor: string;
  patternLicense: string;
  patternNotes: string;
  svgContent: string;
  viewBox: string;

  // Editor settings
  editorMode: EditorMode;

  // Display settings
  backgroundColor: string;
  threadColor: string;
  showGrid: boolean;
  previewDpi: number;
  previewScaleMode: PreviewScaleMode;

  // Size settings
  unit: Unit;
  sizeMode: SizeMode;
  tileSizeMm: number;
  rows: number;
  cols: number;
  rowOffset: number;
  finalSizeMm: Dimensions | null;

  // Stitch defaults
  stitchLengthMm: number;
  gapLengthMm: number;
  strokeWidthMm: number;
  snapGridMm: number;

  // Actions
  setEditorMode: (mode: EditorMode) => void;
  setSvgContent: (content: string) => void;
  setViewBox: (viewBox: string) => void;
  setBackgroundColor: (color: string) => void;
  setThreadColor: (color: string) => void;
  setShowGrid: (show: boolean) => void;
  setPreviewScaleMode: (mode: PreviewScaleMode) => void;
  setUnit: (unit: Unit) => void;
  setSizeMode: (mode: SizeMode) => void;
  setTileSizeMm: (size: number) => void;
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setRowOffset: (offset: number) => void;
  setFinalSizeMm: (size: Dimensions | null) => void;
  setStitchLengthMm: (length: number) => void;
  setGapLengthMm: (length: number) => void;
  setStrokeWidthMm: (width: number) => void;
  setSnapGridMm: (grid: number) => void;
  loadPattern: (pattern: PatternV1) => void;
  resetPattern: () => void;
}
