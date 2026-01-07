/**
 * Application constants
 * Centralizes magic numbers and configuration values
 */

// ============================================================================
// MEASUREMENT CONSTANTS
// ============================================================================

/** Millimeters per inch */
export const MM_PER_INCH = 25.4;

/** Points per inch (for PDF) */
export const POINTS_PER_INCH = 72;

// ============================================================================
// DEFAULT VALUES - TILE & GRID
// ============================================================================

/** Default tile size in mm */
export const DEFAULT_TILE_SIZE_MM = 10;

/** Default number of rows */
export const DEFAULT_ROWS = 4;

/** Default number of columns */
export const DEFAULT_COLS = 4;

/** Default row offset (0 = no offset, 0.5 = brick pattern) */
export const DEFAULT_ROW_OFFSET = 0;

// ============================================================================
// DEFAULT VALUES - STITCH
// ============================================================================

/** Default stitch length in mm */
export const DEFAULT_STITCH_LENGTH_MM = 3;

/** Default gap between stitches in mm */
export const DEFAULT_GAP_LENGTH_MM = 1.5;

/** Default stroke width in mm */
export const DEFAULT_STROKE_WIDTH_MM = 0.6;

/** Default snap grid interval in mm */
export const DEFAULT_SNAP_GRID_MM = 1;

// ============================================================================
// DEFAULT VALUES - COLORS
// ============================================================================

/** Default background color (cream/cloth-like - traditional sashiko fabric) */
export const DEFAULT_BACKGROUND_COLOR = '#f5f5dc';

/** Default thread color (indigo - traditional sashiko thread) */
export const DEFAULT_THREAD_COLOR = '#334e68';

/** Default grid color */
export const DEFAULT_GRID_COLOR = '#d9d3c7';

/** Default selection color */
export const DEFAULT_SELECTION_COLOR = '#334e68';

// ============================================================================
// DEFAULT VALUES - PREVIEW
// ============================================================================

/** Default preview DPI */
export const DEFAULT_PREVIEW_DPI = 96;

// ============================================================================
// LIMITS & CONSTRAINTS
// ============================================================================

/** Minimum tile size in mm */
export const MIN_TILE_SIZE_MM = 1;

/** Maximum tile size in mm */
export const MAX_TILE_SIZE_MM = 100;

/** Minimum rows */
export const MIN_ROWS = 1;

/** Maximum rows */
export const MAX_ROWS = 50;

/** Minimum columns */
export const MIN_COLS = 1;

/** Maximum columns */
export const MAX_COLS = 50;

/** Minimum stitch length in mm */
export const MIN_STITCH_LENGTH_MM = 0.5;

/** Maximum stitch length in mm */
export const MAX_STITCH_LENGTH_MM = 20;

/** Minimum stroke width in mm */
export const MIN_STROKE_WIDTH_MM = 0.1;

/** Maximum stroke width in mm */
export const MAX_STROKE_WIDTH_MM = 5;

// ============================================================================
// UNDO/REDO
// ============================================================================

/** Maximum undo history length */
export const MAX_HISTORY_LENGTH = 50;

// ============================================================================
// SVG DEFAULTS
// ============================================================================

/** Default viewBox dimensions */
export const DEFAULT_VIEWBOX_SIZE = 10;
