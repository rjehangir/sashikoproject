/**
 * PDF Export Utilities
 *
 * @deprecated This module is maintained for backward compatibility.
 * Use the new service layer instead:
 *
 *   import { pdfService } from '../services';
 *   // or directly:
 *   import { pdfExporter, exportToPdf } from '../services';
 */

import { pdfService } from '../services';
import type { Unit, PaperSize } from '../types';

/**
 * Legacy export options interface
 * @deprecated Use PatternExportOptions from '../services' instead
 */
interface LegacyPatternExportOptions {
  svgContent: string;
  viewBox: string;
  tileSizeMm: number;
  rows: number;
  cols: number;
  rowOffset: number;
  finalSizeMm: { width: number; height: number } | null;
  sizeMode: 'tile-size' | 'final-size';
  paperSize: PaperSize;
  unit: Unit;
  backgroundColor: string;
  threadColor: string;
  strokeWidthMm: number;
  stitchLengthMm: number;
  gapLengthMm: number;
  patternName: string;
  patternId: string;
  marginMm?: number;
}

/**
 * @deprecated Use pdfService.exportPattern instead
 */
export async function exportToPdf(options: LegacyPatternExportOptions): Promise<Uint8Array> {
  return pdfService.exportPattern({
    svgContent: options.svgContent,
    viewBox: options.viewBox,
    tileSizeMm: options.tileSizeMm,
    rows: options.rows,
    cols: options.cols,
    rowOffset: options.rowOffset,
    finalSizeMm: options.finalSizeMm,
    sizeMode: options.sizeMode,
    paperSize: options.paperSize,
    unit: options.unit,
    backgroundColor: options.backgroundColor,
    threadColor: options.threadColor,
    strokeWidthMm: options.strokeWidthMm,
    stitchLengthMm: options.stitchLengthMm,
    gapLengthMm: options.gapLengthMm,
    patternName: options.patternName,
    patternId: options.patternId,
    ...(options.marginMm !== undefined && { marginMm: options.marginMm }),
  });
}

// Re-export types for backward compatibility
export type { LegacyPatternExportOptions as PatternExportOptions };
