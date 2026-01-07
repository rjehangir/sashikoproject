/**
 * Default state values for the application
 * Used by store slices to initialize state
 */

import * as constants from './constants';

// ============================================================================
// DEFAULT SVG CONTENT
// ============================================================================

/**
 * Default SVG content for a new pattern (simple triangle)
 */
export const DEFAULT_SVG_CONTENT = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
  <line x1="2" y1="2.4" x2="8" y2="2.4" stroke="white" stroke-width="0.6"/>
  <line x1="8" y1="2.4" x2="5" y2="7.6" stroke="white" stroke-width="0.6"/>
  <line x1="5" y1="7.6" x2="2" y2="2.4" stroke="white" stroke-width="0.6"/>
</svg>`;

/**
 * Default viewBox string
 */
export const DEFAULT_VIEW_BOX = '0 0 10 10';

// ============================================================================
// PATTERN DEFAULTS
// ============================================================================

/**
 * Create default pattern state values
 */
export function createDefaultPatternState() {
  return {
    patternId: null as string | null,
    patternName: 'Untitled Pattern',
    patternAuthor: '',
    patternLicense: 'CC BY 4.0',
    patternNotes: '',
    svgContent: DEFAULT_SVG_CONTENT,
    viewBox: DEFAULT_VIEW_BOX,
  } as const;
}

// ============================================================================
// EDITOR DEFAULTS
// ============================================================================

/**
 * Create default editor state values
 */
export function createDefaultEditorState() {
  return {
    editorMode: 'graphical' as const,
    activeTool: 'select' as const,
    selectedElementId: null as string | null,
    isDrawing: false,
    snapToGrid: true,
  } as const;
}

// ============================================================================
// DISPLAY DEFAULTS
// ============================================================================

/**
 * Create default display state values
 */
export function createDefaultDisplayState() {
  return {
    backgroundColor: constants.DEFAULT_BACKGROUND_COLOR,
    threadColor: constants.DEFAULT_THREAD_COLOR,
    showGrid: false,
    previewDpi: constants.DEFAULT_PREVIEW_DPI,
    previewScaleMode: 'fit' as const,
  } as const;
}

// ============================================================================
// SIZE DEFAULTS
// ============================================================================

/**
 * Create default size state values
 */
export function createDefaultSizeState() {
  return {
    unit: 'mm' as const,
    sizeMode: 'tile-size' as const,
    tileSizeMm: constants.DEFAULT_TILE_SIZE_MM,
    rows: constants.DEFAULT_ROWS,
    cols: constants.DEFAULT_COLS,
    rowOffset: constants.DEFAULT_ROW_OFFSET,
    finalSizeMm: null as { width: number; height: number } | null,
  } as const;
}

// ============================================================================
// STITCH DEFAULTS
// ============================================================================

/**
 * Create default stitch state values
 */
export function createDefaultStitchState() {
  return {
    stitchLengthMm: constants.DEFAULT_STITCH_LENGTH_MM,
    gapLengthMm: constants.DEFAULT_GAP_LENGTH_MM,
    strokeWidthMm: constants.DEFAULT_STROKE_WIDTH_MM,
    snapGridMm: constants.DEFAULT_SNAP_GRID_MM,
  } as const;
}
