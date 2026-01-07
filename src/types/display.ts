/**
 * Display and preview types
 * Defines types for visual rendering settings
 */

/** Preview scale mode */
export type PreviewScaleMode = 'fit' | 'real-size';

/** Display settings for rendering */
export interface DisplayState {
  /** Background color (hex) */
  backgroundColor: string;
  /** Thread/stitch color (hex) */
  threadColor: string;
  /** Show grid overlay */
  showGrid: boolean;
  /** Preview DPI for real-size rendering */
  previewDpi: number;
  /** How to scale the preview */
  previewScaleMode: PreviewScaleMode;
}

/** Color configuration */
export interface ColorConfig {
  /** Background color */
  background: string;
  /** Primary thread color */
  thread: string;
  /** Grid color */
  grid: string;
  /** Selection highlight color */
  selection: string;
}

/** Grid display options */
export interface GridConfig {
  /** Whether grid is visible */
  visible: boolean;
  /** Grid spacing in mm */
  spacingMm: number;
  /** Grid line color */
  color: string;
  /** Grid line opacity (0-1) */
  opacity: number;
}

/** Export format options */
export type ExportFormat = 'svg' | 'pdf' | 'png';

/** Export settings */
export interface ExportConfig {
  /** Export format */
  format: ExportFormat;
  /** DPI for raster exports */
  dpi: number;
  /** Include background */
  includeBackground: boolean;
  /** Paper size for PDF */
  paperSize: import('./units').PaperSize;
  /** Landscape orientation */
  landscape: boolean;
}
