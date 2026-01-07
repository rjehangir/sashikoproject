/**
 * Unit and measurement types
 * All internal values are stored in millimeters
 */

/** Supported display units */
export type Unit = 'mm' | 'in';

/** Mode for defining pattern size */
export type SizeMode = 'tile-size' | 'final-size';

/** Standard paper sizes for export */
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';

/** Dimensions in a specific unit (defaults to mm internally) */
export interface Dimensions {
  width: number;
  height: number;
}

/** Paper dimensions with size name */
export interface PaperDimensions extends Dimensions {
  name: PaperSize;
}

/** Size configuration for patterns */
export interface SizeConfig {
  /** Display unit for UI */
  unit: Unit;
  /** How size is defined */
  sizeMode: SizeMode;
  /** Tile size in mm */
  tileSizeMm: number;
  /** Number of rows */
  rows: number;
  /** Number of columns */
  cols: number;
  /** Row offset (0-1, percentage of tile width) */
  rowOffset: number;
  /** Final size in mm, when using final-size mode */
  finalSizeMm: Dimensions | null;
}

/** Stitch parameters for rendering */
export interface StitchConfig {
  /** Length of each stitch in mm */
  stitchLengthMm: number;
  /** Gap between stitches in mm */
  gapLengthMm: number;
  /** Stroke width in mm */
  strokeWidthMm: number;
  /** Grid snap interval in mm */
  snapGridMm: number;
}
