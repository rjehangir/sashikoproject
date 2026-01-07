/**
 * PDF Service Facade
 * Unified interface for PDF export operations
 */

import { PathParser, pathParser } from './PathParser';
import { pdfExporter, type PatternExportOptions } from './PdfExporter';
import { PdfRenderer, pdfRenderer } from './PdfRenderer';

// Re-export services and types
export { PdfExporter, pdfExporter } from './PdfExporter';
export type { PatternExportOptions } from './PdfExporter';
export { PdfRenderer, pdfRenderer } from './PdfRenderer';
export type { TileRenderOptions } from './PdfRenderer';
export { PathParser, pathParser } from './PathParser';
export type { PathCommand, PathCommandType } from './PathParser';

/**
 * PDF Service - facade for all PDF operations
 */
export class PdfService {
  private exporter = pdfExporter;
  private renderer = pdfRenderer;
  private pathParser = pathParser;

  /**
   * Export a pattern to PDF
   */
  async exportPattern(options: PatternExportOptions): Promise<Uint8Array> {
    return this.exporter.export(options);
  }

  /**
   * Get the path parser for advanced operations
   */
  getPathParser(): PathParser {
    return this.pathParser;
  }

  /**
   * Get the renderer for custom rendering
   */
  getRenderer(): PdfRenderer {
    return this.renderer;
  }
}

// Singleton instance
export const pdfService = new PdfService();

/**
 * Convenience function for backward compatibility
 * @deprecated Use pdfService.exportPattern instead
 */
export async function exportToPdf(options: PatternExportOptions): Promise<Uint8Array> {
  return pdfService.exportPattern(options);
}
