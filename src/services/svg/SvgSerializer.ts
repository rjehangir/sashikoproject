/**
 * SVG Serializer Service
 * Handles serialization of SVG elements back to strings
 */

import type { ViewBox } from '../../types';

/**
 * Options for SVG serialization
 */
export interface SerializeOptions {
  /** Include XML declaration */
  includeXmlDeclaration?: boolean;
  /** Minify output (remove whitespace) */
  minify?: boolean;
  /** Pretty print with indentation */
  prettyPrint?: boolean;
  /** Indentation string (default: 2 spaces) */
  indent?: string;
}

/**
 * SVG Serializer - converts DOM elements back to SVG strings
 */
export class SvgSerializer {
  private serializer = new XMLSerializer();

  /**
   * Serialize a document to an SVG string
   */
  serialize(doc: Document, options: SerializeOptions = {}): string {
    let output = this.serializer.serializeToString(doc);

    if (options.minify) {
      output = this.minify(output);
    } else if (options.prettyPrint) {
      output = this.prettyPrint(output, options.indent);
    }

    if (options.includeXmlDeclaration) {
      output = '<?xml version="1.0" encoding="UTF-8"?>\n' + output;
    }

    return output;
  }

  /**
   * Serialize an SVG element to a string
   */
  serializeElement(element: Element, options: SerializeOptions = {}): string {
    let output = this.serializer.serializeToString(element);

    if (options.minify) {
      output = this.minify(output);
    } else if (options.prettyPrint) {
      output = this.prettyPrint(output, options.indent);
    }

    return output;
  }

  /**
   * Create a minimal SVG wrapper
   */
  createSvgWrapper(viewBox: ViewBox, content: string): string {
    return `<svg viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" xmlns="http://www.w3.org/2000/svg">
${content}
</svg>`;
  }

  /**
   * Create an empty SVG with viewBox
   */
  createEmptySvg(viewBox: ViewBox): string {
    return `<svg viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  /**
   * Minify SVG by removing unnecessary whitespace
   */
  private minify(svg: string): string {
    return svg
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/\s*([=<>])\s*/g, '$1')
      .trim();
  }

  /**
   * Pretty print SVG with indentation
   */
  private prettyPrint(svg: string, indent: string = '  '): string {
    // Simple pretty print - split on tags and indent
    let formatted = '';
    let indentLevel = 0;

    svg.replace(/(<[^>]+>)/g, (match, tag) => {
      const isClosing = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>');

      if (isClosing) {
        indentLevel--;
      }

      formatted += indent.repeat(Math.max(0, indentLevel)) + tag + '\n';

      if (!isClosing && !isSelfClosing) {
        indentLevel++;
      }

      return match;
    });

    return formatted.trim();
  }
}

// Singleton instance
export const svgSerializer = new SvgSerializer();
