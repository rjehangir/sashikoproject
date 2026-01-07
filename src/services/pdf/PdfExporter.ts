/**
 * PDF Exporter Service
 * Main export logic for generating pattern PDFs
 */

import { PDFDocument, rgb, PDFPage, PDFFont, StandardFonts } from 'pdf-lib';

import { PAPER_SIZES } from '../../config/paper';
import type { Unit, PaperSize, SizeMode, Dimensions } from '../../types';
import { mmToPoints } from '../../utils/units';

import { PdfRenderer, pdfRenderer } from './PdfRenderer';

/**
 * Options for exporting a pattern to PDF
 */
export interface PatternExportOptions {
  /** SVG content of the tile */
  svgContent: string;
  /** ViewBox string */
  viewBox: string;
  /** Tile size in mm */
  tileSizeMm: number;
  /** Number of tile rows */
  rows: number;
  /** Number of tile columns */
  cols: number;
  /** Row offset for staggered patterns (0-1) */
  rowOffset: number;
  /** Final size in mm (for final-size mode) */
  finalSizeMm: Dimensions | null;
  /** Size mode */
  sizeMode: SizeMode;
  /** Paper size */
  paperSize: PaperSize;
  /** Display unit */
  unit: Unit;
  /** Background color */
  backgroundColor: string;
  /** Thread/stroke color */
  threadColor: string;
  /** Stroke width in mm */
  strokeWidthMm: number;
  /** Stitch length in mm */
  stitchLengthMm: number;
  /** Gap length in mm */
  gapLengthMm: number;
  /** Pattern name for display */
  patternName: string;
  /** Pattern ID */
  patternId: string;
  /** Page margin in mm */
  marginMm?: number;
  /** Include calibration square */
  includeCalibration?: boolean;
  /** Include crop marks */
  includeCropMarks?: boolean;
  /** Include settings summary */
  includeSettingsSummary?: boolean;
}

/**
 * PDF Exporter - generates complete PDFs from pattern data
 */
export class PdfExporter {
  private renderer: PdfRenderer = pdfRenderer;

  /**
   * Export a pattern to PDF
   */
  async export(options: PatternExportOptions): Promise<Uint8Array> {
    const {
      svgContent,
      viewBox,
      tileSizeMm,
      rows,
      cols,
      rowOffset,
      finalSizeMm,
      sizeMode,
      paperSize,
      unit,
      backgroundColor,
      threadColor,
      strokeWidthMm,
      stitchLengthMm,
      gapLengthMm,
      patternName,
      marginMm = 10,
      includeCalibration = true,
      includeCropMarks = true,
      includeSettingsSummary = true,
    } = options;

    // Calculate dimensions
    const dims = this.calculateDimensions(sizeMode, tileSizeMm, rows, cols, rowOffset, finalSizeMm);

    // Parse viewBox
    const viewBoxData = this.parseViewBox(viewBox);
    if (!viewBoxData) {
      throw new Error('Invalid viewBox');
    }

    // Get paper dimensions
    const paper = PAPER_SIZES[paperSize];
    const pageWidthPt = mmToPoints(paper.width);
    const pageHeightPt = mmToPoints(paper.height);
    const marginPt = mmToPoints(marginMm);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw background
    await this.drawBackground(
      page,
      marginPt,
      dims.patternWidthMm,
      dims.patternHeightMm,
      backgroundColor
    );

    // Draw tiles
    await this.drawTiles(page, {
      svgContent,
      viewBoxData,
      actualTileSizeMm: dims.actualTileSizeMm,
      rows,
      cols,
      rowOffset,
      marginPt,
      threadColor,
      strokeWidthMm,
      stitchLengthMm,
      gapLengthMm,
    });

    // Draw calibration square
    if (includeCalibration) {
      await this.drawCalibrationSquare(page, font, marginPt, pageHeightPt);
    }

    // Draw settings summary
    if (includeSettingsSummary) {
      await this.drawSettingsSummary(page, font, {
        patternName,
        actualTileSizeMm: dims.actualTileSizeMm,
        rows,
        cols,
        patternWidthMm: dims.patternWidthMm,
        patternHeightMm: dims.patternHeightMm,
        unit,
        paperSize,
        marginPt,
        pageHeightPt,
      });
    }

    // Draw crop marks
    if (includeCropMarks) {
      await this.drawCropMarks(page, marginPt, dims.patternWidthMm, dims.patternHeightMm);
    }

    return pdfDoc.save();
  }

  /**
   * Calculate pattern dimensions
   */
  private calculateDimensions(
    sizeMode: SizeMode,
    tileSizeMm: number,
    rows: number,
    cols: number,
    rowOffset: number,
    finalSizeMm: Dimensions | null
  ) {
    let actualTileSizeMm: number;
    let patternWidthMm: number;
    let patternHeightMm: number;

    if (sizeMode === 'final-size' && finalSizeMm) {
      patternWidthMm = finalSizeMm.width;
      patternHeightMm = finalSizeMm.height;
      actualTileSizeMm = Math.min(patternWidthMm / cols, patternHeightMm / rows);
    } else {
      actualTileSizeMm = tileSizeMm;
      patternWidthMm = actualTileSizeMm * cols + (rowOffset > 0 ? actualTileSizeMm * rowOffset : 0);
      patternHeightMm = actualTileSizeMm * rows;
    }

    return { actualTileSizeMm, patternWidthMm, patternHeightMm };
  }

  /**
   * Parse viewBox string
   */
  private parseViewBox(viewBox: string): { width: number; height: number } | null {
    const match = viewBox.match(
      /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
    );
    if (!match || match[3] === undefined || match[4] === undefined) return null;
    return {
      width: parseFloat(match[3]),
      height: parseFloat(match[4]),
    };
  }

  /**
   * Draw pattern background
   * Always uses white for print-friendly output
   */
  private async drawBackground(
    page: PDFPage,
    marginPt: number,
    patternWidthMm: number,
    patternHeightMm: number,
    _backgroundColor: string
  ): Promise<void> {
    // Always use white background for print-friendly PDFs
    page.drawRectangle({
      x: marginPt,
      y: marginPt,
      width: mmToPoints(patternWidthMm),
      height: mmToPoints(patternHeightMm),
      color: rgb(1, 1, 1),
    });
  }

  /**
   * Draw all pattern tiles
   * Always uses black stroke color for print-friendly output
   */
  private async drawTiles(
    page: PDFPage,
    opts: {
      svgContent: string;
      viewBoxData: { width: number; height: number };
      actualTileSizeMm: number;
      rows: number;
      cols: number;
      rowOffset: number;
      marginPt: number;
      threadColor: string;
      strokeWidthMm: number;
      stitchLengthMm: number;
      gapLengthMm: number;
    }
  ): Promise<void> {
    const {
      svgContent,
      viewBoxData,
      actualTileSizeMm,
      rows,
      cols,
      rowOffset,
      marginPt,
      strokeWidthMm,
      stitchLengthMm,
      gapLengthMm,
    } = opts;

    const scale = actualTileSizeMm / viewBoxData.width;
    // Always use black for print-friendly PDFs
    const strokeColorRgb = { r: 0, g: 0, b: 0 };
    const strokeWidthPt = mmToPoints(strokeWidthMm);
    const dashLengthPt = mmToPoints(stitchLengthMm);
    const gapLengthPt = mmToPoints(gapLengthMm);

    for (let row = 0; row < rows; row++) {
      const rowOffsetMm = rowOffset > 0 && row % 2 === 1 ? actualTileSizeMm * rowOffset : 0;

      for (let col = 0; col < cols; col++) {
        const offsetX = col * actualTileSizeMm + rowOffsetMm;
        const offsetY = (rows - 1 - row) * actualTileSizeMm;

        await this.renderer.drawTile(page, svgContent, {
          viewBoxWidth: viewBoxData.width,
          viewBoxHeight: viewBoxData.height,
          scale,
          offsetX: marginPt + mmToPoints(offsetX),
          offsetY: marginPt + mmToPoints(offsetY),
          strokeColor: strokeColorRgb,
          strokeWidthPt,
          dashLengthPt,
          gapLengthPt,
        });
      }
    }
  }

  /**
   * Draw calibration square
   */
  private async drawCalibrationSquare(
    page: PDFPage,
    font: PDFFont,
    marginPt: number,
    pageHeightPt: number
  ): Promise<void> {
    const calSizePt = mmToPoints(50);
    const calX = marginPt;
    const calY = pageHeightPt - marginPt - calSizePt - 20;

    page.drawRectangle({
      x: calX,
      y: calY,
      width: calSizePt,
      height: calSizePt,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawText('This square should measure 50mm', {
      x: calX,
      y: calY - 12,
      size: 10,
      font,
    });
  }

  /**
   * Draw settings summary
   */
  private async drawSettingsSummary(
    page: PDFPage,
    font: PDFFont,
    opts: {
      patternName: string;
      actualTileSizeMm: number;
      rows: number;
      cols: number;
      patternWidthMm: number;
      patternHeightMm: number;
      unit: Unit;
      paperSize: PaperSize;
      marginPt: number;
      pageHeightPt: number;
    }
  ): Promise<void> {
    const {
      patternName,
      actualTileSizeMm,
      rows,
      cols,
      patternWidthMm,
      patternHeightMm,
      unit,
      paperSize,
      marginPt,
      pageHeightPt,
    } = opts;

    const calSizePt = mmToPoints(50);
    const summaryY = pageHeightPt - marginPt - calSizePt - 60;

    const lines = [
      `Pattern: ${patternName}`,
      `Tile Size: ${actualTileSizeMm.toFixed(2)} ${unit}`,
      `Tiles: ${rows} × ${cols}`,
      `Final Size: ${patternWidthMm.toFixed(2)} × ${patternHeightMm.toFixed(2)} ${unit}`,
      `Paper: ${paperSize}`,
    ];

    let currentY = summaryY;
    for (const line of lines) {
      page.drawText(line, {
        x: marginPt,
        y: currentY,
        size: 9,
        font,
      });
      currentY -= 12;
    }
  }

  /**
   * Draw crop marks
   */
  private async drawCropMarks(
    page: PDFPage,
    marginPt: number,
    patternWidthMm: number,
    patternHeightMm: number
  ): Promise<void> {
    const cropMarkLengthMm = 5;
    const cropMarkWidth = 0.5;
    const patternX = marginPt;
    const patternY = marginPt;
    const patternW = mmToPoints(patternWidthMm);
    const patternH = mmToPoints(patternHeightMm);
    const cropMarkLengthPt = mmToPoints(cropMarkLengthMm);

    const corners = [
      // Top-left
      [
        {
          start: { x: patternX, y: patternY + patternH },
          end: { x: patternX, y: patternY + patternH + cropMarkLengthPt },
        },
        {
          start: { x: patternX, y: patternY + patternH },
          end: { x: patternX + cropMarkLengthPt, y: patternY + patternH },
        },
      ],
      // Top-right
      [
        {
          start: { x: patternX + patternW, y: patternY + patternH },
          end: { x: patternX + patternW, y: patternY + patternH + cropMarkLengthPt },
        },
        {
          start: { x: patternX + patternW, y: patternY + patternH },
          end: { x: patternX + patternW - cropMarkLengthPt, y: patternY + patternH },
        },
      ],
      // Bottom-left
      [
        {
          start: { x: patternX, y: patternY },
          end: { x: patternX, y: patternY - cropMarkLengthPt },
        },
        {
          start: { x: patternX, y: patternY },
          end: { x: patternX + cropMarkLengthPt, y: patternY },
        },
      ],
      // Bottom-right
      [
        {
          start: { x: patternX + patternW, y: patternY },
          end: { x: patternX + patternW, y: patternY - cropMarkLengthPt },
        },
        {
          start: { x: patternX + patternW, y: patternY },
          end: { x: patternX + patternW - cropMarkLengthPt, y: patternY },
        },
      ],
    ];

    for (const corner of corners) {
      for (const line of corner) {
        page.drawLine({
          ...line,
          thickness: cropMarkWidth,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}

// Singleton instance
export const pdfExporter = new PdfExporter();
