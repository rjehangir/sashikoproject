/**
 * SVG Transformer Service
 * Handles SVG transformations: mirror, rotate, snap, thread styling
 */

import type { Result, ViewBox } from '../../types';
import { ok } from '../../types';

import { SvgParser } from './SvgParser';

/**
 * Thread style options for applying stitch appearance
 */
export interface ThreadStyleOptions {
  strokeColor: string;
  strokeWidthMm: number;
  stitchLengthMm: number;
  gapLengthMm: number;
}

/**
 * SVG Transformer - applies transformations to SVG content
 */
export class SvgTransformer {
  private parser = new SvgParser();

  /**
   * Mirror SVG horizontally
   */
  mirrorHorizontal(svgString: string, viewBox: ViewBox): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;
    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect, g');

    elements.forEach((el) => {
      if (el instanceof Element) {
        const transform = el.getAttribute('transform') || '';
        const newTransform = `scale(-1, 1) translate(${-viewBox.width}, 0) ${transform}`.trim();
        el.setAttribute('transform', newTransform);
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Mirror SVG vertically
   */
  mirrorVertical(svgString: string, viewBox: ViewBox): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;
    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect, g');

    elements.forEach((el) => {
      if (el instanceof Element) {
        const transform = el.getAttribute('transform') || '';
        const newTransform = `scale(1, -1) translate(0, ${-viewBox.height}) ${transform}`.trim();
        el.setAttribute('transform', newTransform);
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Rotate SVG 90 degrees clockwise
   */
  rotate90(svgString: string, viewBox: ViewBox): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;
    const centerX = viewBox.width / 2;
    const centerY = viewBox.height / 2;

    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect, g');

    elements.forEach((el) => {
      if (el instanceof Element) {
        const transform = el.getAttribute('transform') || '';
        const newTransform =
          `translate(${centerX}, ${centerY}) rotate(90) translate(${-centerX}, ${-centerY}) ${transform}`.trim();
        el.setAttribute('transform', newTransform);
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Snap all coordinates to a grid
   */
  snapToGrid(svgString: string, viewBox: ViewBox, gridSizeMm: number): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;

    // Calculate snap grid in viewBox units
    const scale = viewBox.width / 100; // Assume 100mm reference
    const snapGrid = gridSizeMm / scale;

    if (snapGrid <= 0) {
      return ok(svgString);
    }

    const snap = (value: number): number => {
      return Math.round(value / snapGrid) * snapGrid;
    };

    const elements = svg.querySelectorAll('*');

    elements.forEach((el) => {
      if (el instanceof Element) {
        // Snap numeric attributes
        const numericAttrs = ['x', 'y', 'cx', 'cy', 'r', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];

        for (const attr of numericAttrs) {
          const value = el.getAttribute(attr);
          if (value) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              el.setAttribute(attr, snap(num).toFixed(3));
            }
          }
        }

        // Snap path data (simplified - M, L, H, V only)
        if (el.tagName === 'path') {
          const d = el.getAttribute('d');
          if (d) {
            const snapped = d.replace(
              /([MLHV])\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,
              (match, cmd, x, y) => {
                const numX = parseFloat(x);
                const numY = parseFloat(y);
                if (!isNaN(numX) && !isNaN(numY)) {
                  return `${cmd} ${snap(numX).toFixed(3)} ${snap(numY).toFixed(3)}`;
                }
                return match;
              }
            );
            el.setAttribute('d', snapped);
          }
        }

        // Snap polyline/polygon points
        if (el.tagName === 'polyline' || el.tagName === 'polygon') {
          const points = el.getAttribute('points');
          if (points) {
            const snapped = points.replace(
              /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,
              (match, x, y) => {
                const numX = parseFloat(x);
                const numY = parseFloat(y);
                if (!isNaN(numX) && !isNaN(numY)) {
                  return `${snap(numX).toFixed(3)},${snap(numY).toFixed(3)}`;
                }
                return match;
              }
            );
            el.setAttribute('points', snapped);
          }
        }
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Apply thread style to SVG elements
   */
  applyThreadStyle(
    svgString: string,
    _viewBox: ViewBox,
    options: ThreadStyleOptions
  ): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;
    const { strokeColor, strokeWidthMm, stitchLengthMm, gapLengthMm } = options;

    // Convert to viewBox units (assuming viewBox represents mm)
    const strokeWidth = strokeWidthMm.toFixed(2);
    const dashLength = stitchLengthMm.toFixed(2);
    const gapLength = gapLengthMm.toFixed(2);

    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect');

    elements.forEach((el) => {
      if (el instanceof Element) {
        el.setAttribute('stroke', strokeColor);
        el.setAttribute('stroke-width', strokeWidth);
        el.setAttribute('stroke-dasharray', `${dashLength} ${gapLength}`);
        el.setAttribute('stroke-linecap', 'round');

        // Preserve fill if set, otherwise set to none
        if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
          el.setAttribute('fill', 'none');
        }
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Reset thread style (remove dash array, reset colors)
   */
  resetThreadStyle(svgString: string): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;

    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect');

    elements.forEach((el) => {
      if (el instanceof Element) {
        el.removeAttribute('stroke-dasharray');
        el.removeAttribute('stroke-linecap');
      }
    });

    return ok(this.parser.serialize(doc));
  }

  /**
   * Set viewBox on SVG
   */
  setViewBox(svgString: string, viewBox: ViewBox): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;

    const { document: doc, svgElement: svg } = parsed.data;
    svg.setAttribute('viewBox', this.parser.formatViewBox(viewBox));

    return ok(this.parser.serialize(doc));
  }
}

// Singleton instance
export const svgTransformer = new SvgTransformer();
