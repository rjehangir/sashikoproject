/**
 * PDF Renderer Service
 * Handles rendering SVG elements to PDF pages
 */

import { PDFPage, rgb } from 'pdf-lib';

import { parseColor, type RGB } from '../../utils/color';
import { mmToPoints } from '../../utils/units';
import { svgParser } from '../svg/SvgParser';

import { pathParser } from './PathParser';

/**
 * Options for rendering a tile to PDF
 */
export interface TileRenderOptions {
  /** ViewBox width in viewBox units */
  viewBoxWidth: number;
  /** ViewBox height in viewBox units */
  viewBoxHeight: number;
  /** Scale factor (mm per viewBox unit) */
  scale: number;
  /** X offset in points */
  offsetX: number;
  /** Y offset in points */
  offsetY: number;
  /** Stroke color */
  strokeColor: RGB;
  /** Stroke width in points */
  strokeWidthPt: number;
  /** Dash length in points */
  dashLengthPt: number;
  /** Gap length in points */
  gapLengthPt: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * PDF Renderer - draws SVG elements to PDF pages
 */
export class PdfRenderer {
  /**
   * Draw an SVG tile to a PDF page
   */
  async drawTile(page: PDFPage, svgContent: string, options: TileRenderOptions): Promise<void> {
    const parsed = svgParser.parse(svgContent);
    if (!parsed.success) return;

    const elements = parsed.data.svgElement.querySelectorAll(
      'path, line, polyline, polygon, circle, rect'
    );

    for (const element of elements) {
      if (element instanceof Element) {
        await this.drawElement(page, element, options);
      }
    }
  }

  /**
   * Draw a single SVG element
   * NOTE: For print-friendly output, we ALWAYS use options.strokeColor (black)
   * instead of the element's stroke attribute. This ensures visibility on white paper.
   */
  private async drawElement(
    page: PDFPage,
    element: Element,
    options: TileRenderOptions
  ): Promise<void> {
    const tagName = element.tagName.toLowerCase();

    // Always use the passed stroke color for print-friendly output
    // This ensures black lines on white background regardless of SVG styling
    const color = options.strokeColor;

    // Get fill color if any (fills are preserved as-is)
    const fill = element.getAttribute('fill') || 'none';
    const fillColor = fill !== 'none' && fill !== 'transparent' ? parseColor(fill) : null;

    switch (tagName) {
      case 'line':
        this.drawLine(page, element, options, color);
        break;
      case 'rect':
        this.drawRect(page, element, options, color, fillColor);
        break;
      case 'polyline':
        this.drawPolyline(page, element, options, color, false);
        break;
      case 'polygon':
        this.drawPolyline(page, element, options, color, true);
        break;
      case 'path':
        this.drawPath(page, element, options, color);
        break;
      case 'circle':
        // Note: pdf-lib doesn't have drawCircle, circles are approximated
        this.drawCircleApprox(page, element, options, color);
        break;
    }
  }

  /**
   * Draw a line element
   */
  private drawLine(page: PDFPage, element: Element, options: TileRenderOptions, color: RGB): void {
    const x1 = parseFloat(element.getAttribute('x1') || '0');
    const y1 = parseFloat(element.getAttribute('y1') || '0');
    const x2 = parseFloat(element.getAttribute('x2') || '0');
    const y2 = parseFloat(element.getAttribute('y2') || '0');

    const startX = options.offsetX + mmToPoints(x1 * options.scale);
    const startY = options.offsetY + mmToPoints((options.viewBoxHeight - y1) * options.scale);
    const endX = options.offsetX + mmToPoints(x2 * options.scale);
    const endY = options.offsetY + mmToPoints((options.viewBoxHeight - y2) * options.scale);

    page.drawLine({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      thickness: options.strokeWidthPt,
      color: rgb(color.r, color.g, color.b),
      dashArray: [options.dashLengthPt, options.gapLengthPt],
    });
  }

  /**
   * Draw a rect element
   */
  private drawRect(
    page: PDFPage,
    element: Element,
    options: TileRenderOptions,
    color: RGB,
    fillColor: RGB | null
  ): void {
    const x = parseFloat(element.getAttribute('x') || '0');
    const y = parseFloat(element.getAttribute('y') || '0');
    const width = parseFloat(element.getAttribute('width') || '0');
    const height = parseFloat(element.getAttribute('height') || '0');

    const rectX = options.offsetX + mmToPoints(x * options.scale);
    const rectY =
      options.offsetY + mmToPoints((options.viewBoxHeight - y - height) * options.scale);
    const rectW = mmToPoints(width * options.scale);
    const rectH = mmToPoints(height * options.scale);

    // Draw fill if present
    if (fillColor) {
      page.drawRectangle({
        x: rectX,
        y: rectY,
        width: rectW,
        height: rectH,
        color: rgb(fillColor.r, fillColor.g, fillColor.b),
        borderOpacity: 0,
      });
    }

    // Draw stroke
    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectW,
      height: rectH,
      borderColor: rgb(color.r, color.g, color.b),
      borderWidth: options.strokeWidthPt,
      borderDashArray: [options.dashLengthPt, options.gapLengthPt],
    });
  }

  /**
   * Draw a polyline or polygon element
   */
  private drawPolyline(
    page: PDFPage,
    element: Element,
    options: TileRenderOptions,
    color: RGB,
    closed: boolean
  ): void {
    const points = element.getAttribute('points');
    if (!points) return;

    const coords = points
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat);
    const pathPoints: Point[] = [];

    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x !== undefined && y !== undefined && !isNaN(x) && !isNaN(y)) {
        pathPoints.push({
          x: options.offsetX + mmToPoints(x * options.scale),
          y: options.offsetY + mmToPoints((options.viewBoxHeight - y) * options.scale),
        });
      }
    }

    if (pathPoints.length < 2) return;

    // Draw connected lines
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      if (start && end) {
        page.drawLine({
          start,
          end,
          thickness: options.strokeWidthPt,
          color: rgb(color.r, color.g, color.b),
          dashArray: [options.dashLengthPt, options.gapLengthPt],
        });
      }
    }

    // Close polygon
    if (closed && pathPoints.length >= 3) {
      const start = pathPoints[pathPoints.length - 1];
      const end = pathPoints[0];
      if (start && end) {
        page.drawLine({
          start,
          end,
          thickness: options.strokeWidthPt,
          color: rgb(color.r, color.g, color.b),
          dashArray: [options.dashLengthPt, options.gapLengthPt],
        });
      }
    }
  }

  /**
   * Draw a path element
   */
  private drawPath(page: PDFPage, element: Element, options: TileRenderOptions, color: RGB): void {
    const d = element.getAttribute('d');
    if (!d) return;

    const commands = pathParser.parse(d);
    if (commands.length === 0) return;

    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    for (const cmd of commands) {
      const type = cmd.type.toUpperCase();

      if (type === 'M') {
        currentX = cmd.x ?? 0;
        currentY = cmd.y ?? 0;
        startX = currentX;
        startY = currentY;
      } else if (type === 'L') {
        this.drawLineSegment(page, currentX, currentY, cmd.x ?? 0, cmd.y ?? 0, options, color);
        currentX = cmd.x ?? 0;
        currentY = cmd.y ?? 0;
      } else if (type === 'H') {
        const newX = cmd.x ?? 0;
        this.drawLineSegment(page, currentX, currentY, newX, currentY, options, color);
        currentX = newX;
      } else if (type === 'V') {
        const newY = cmd.y ?? 0;
        this.drawLineSegment(page, currentX, currentY, currentX, newY, options, color);
        currentY = newY;
      } else if (type === 'Z') {
        this.drawLineSegment(page, currentX, currentY, startX, startY, options, color);
        currentX = startX;
        currentY = startY;
      }
      // Note: C, S, Q, T, A commands are not yet implemented
      // They would require bezier curve approximation
    }
  }

  /**
   * Draw a line segment with coordinate transformation
   */
  private drawLineSegment(
    page: PDFPage,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: TileRenderOptions,
    color: RGB
  ): void {
    const fromX = options.offsetX + mmToPoints(x1 * options.scale);
    const fromY = options.offsetY + mmToPoints((options.viewBoxHeight - y1) * options.scale);
    const toX = options.offsetX + mmToPoints(x2 * options.scale);
    const toY = options.offsetY + mmToPoints((options.viewBoxHeight - y2) * options.scale);

    page.drawLine({
      start: { x: fromX, y: fromY },
      end: { x: toX, y: toY },
      thickness: options.strokeWidthPt,
      color: rgb(color.r, color.g, color.b),
      dashArray: [options.dashLengthPt, options.gapLengthPt],
    });
  }

  /**
   * Draw a circle approximated as a polygon
   * Note: This is a limitation - pdf-lib doesn't have drawCircle with dash
   */
  private drawCircleApprox(
    page: PDFPage,
    element: Element,
    options: TileRenderOptions,
    color: RGB
  ): void {
    const cx = parseFloat(element.getAttribute('cx') || '0');
    const cy = parseFloat(element.getAttribute('cy') || '0');
    const r = parseFloat(element.getAttribute('r') || '0');

    // Approximate circle with 24 segments
    const segments = 24;
    const points: Point[] = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push({
        x: options.offsetX + mmToPoints(x * options.scale),
        y: options.offsetY + mmToPoints((options.viewBoxHeight - y) * options.scale),
      });
    }

    // Draw as connected lines
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (start && end) {
        page.drawLine({
          start,
          end,
          thickness: options.strokeWidthPt,
          color: rgb(color.r, color.g, color.b),
          dashArray: [options.dashLengthPt, options.gapLengthPt],
        });
      }
    }
  }
}

// Singleton instance
export const pdfRenderer = new PdfRenderer();
