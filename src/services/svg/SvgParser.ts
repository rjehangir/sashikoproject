/**
 * SVG Parser Service
 * Handles parsing SVG strings into DOM documents
 */

import type { Result, ViewBox } from '../../types';
import { ok, err } from '../../types';

/**
 * Parsed SVG document with extracted metadata
 */
export interface ParsedSvg {
  document: Document;
  svgElement: SVGSVGElement;
  viewBox: ViewBox | null;
}

/**
 * SVG Parser - converts SVG strings to DOM and extracts metadata
 */
export class SvgParser {
  private parser = new DOMParser();
  private serializer = new XMLSerializer();

  /**
   * Parse an SVG string into a document
   */
  parse(svgString: string): Result<ParsedSvg> {
    try {
      const doc = this.parser.parseFromString(svgString, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        const errorText = parseError.textContent || 'Unknown parse error';
        return err(new Error(`Invalid SVG syntax: ${errorText}`));
      }

      // Find SVG element
      const svg = doc.querySelector('svg');
      if (!svg) {
        return err(new Error('No SVG element found'));
      }

      // Extract viewBox if present
      const viewBoxAttr = svg.getAttribute('viewBox');
      const viewBox = viewBoxAttr ? this.parseViewBox(viewBoxAttr) : null;

      return ok({
        document: doc,
        svgElement: svg as SVGSVGElement,
        viewBox,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('SVG parse failed'));
    }
  }

  /**
   * Serialize a document back to an SVG string
   */
  serialize(doc: Document): string {
    return this.serializer.serializeToString(doc);
  }

  /**
   * Serialize just the SVG element
   */
  serializeSvg(svg: SVGSVGElement): string {
    return this.serializer.serializeToString(svg);
  }

  /**
   * Parse a viewBox string into a ViewBox object
   */
  parseViewBox(viewBoxString: string): ViewBox | null {
    const match = viewBoxString.match(
      /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
    );
    if (!match || !match[1] || !match[2] || !match[3] || !match[4]) return null;

    return {
      minX: parseFloat(match[1]),
      minY: parseFloat(match[2]),
      width: parseFloat(match[3]),
      height: parseFloat(match[4]),
    };
  }

  /**
   * Format a ViewBox object as a string
   */
  formatViewBox(viewBox: ViewBox): string {
    return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;
  }

  /**
   * Extract viewBox from an SVG string without full parsing
   */
  extractViewBox(svgString: string): ViewBox | null {
    const result = this.parse(svgString);
    if (!result.success) return null;
    return result.data.viewBox;
  }
}

// Singleton instance
export const svgParser = new SvgParser();
