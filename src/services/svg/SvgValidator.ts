/**
 * SVG Validator Service
 * Handles validation and sanitization of SVG content
 */

import DOMPurify from 'dompurify';

import type { Result, AllowedSvgElement } from '../../types';
import { ok, err } from '../../types';

/**
 * Allowed SVG tags for security
 */
export const ALLOWED_TAGS: AllowedSvgElement[] = [
  'svg',
  'g',
  'path',
  'line',
  'polyline',
  'polygon',
  'circle',
  'rect',
];

/**
 * Allowed SVG attributes for security
 */
export const ALLOWED_ATTRIBUTES = [
  'd',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'points',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'viewBox',
  'fill',
  'stroke',
  'stroke-width',
  'transform',
  'opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'xmlns',
  'id',
  'class',
] as const;

/**
 * Validation error types
 */
export type ValidationErrorType =
  | 'syntax'
  | 'no_svg'
  | 'disallowed_tag'
  | 'disallowed_attribute'
  | 'event_handler';

/**
 * Validation error details
 */
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  element?: string;
  attribute?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * SVG Validator - validates and sanitizes SVG content
 */
export class SvgValidator {
  private parser = new DOMParser();

  /**
   * Sanitize an SVG string, removing disallowed elements and attributes
   */
  sanitize(svgString: string): string {
    return DOMPurify.sanitize(svgString, {
      ALLOWED_TAGS: ALLOWED_TAGS as unknown as string[],
      ALLOWED_ATTR: ALLOWED_ATTRIBUTES as unknown as string[],
      KEEP_CONTENT: true,
      IN_PLACE: false,
    });
  }

  /**
   * Validate an SVG string without sanitizing
   */
  validate(svgString: string): Result<void, ValidationError> {
    try {
      const doc = this.parser.parseFromString(svgString, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        return err({
          type: 'syntax',
          message: 'Invalid SVG syntax',
        });
      }

      // Check for SVG element
      const svg = doc.querySelector('svg');
      if (!svg) {
        return err({
          type: 'no_svg',
          message: 'No SVG element found',
        });
      }

      // Walk DOM and validate elements
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT);
      let node: Node | null;

      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          // Check tag
          if (!ALLOWED_TAGS.includes(tagName as AllowedSvgElement)) {
            return err({
              type: 'disallowed_tag',
              message: `Disallowed tag: ${tagName}`,
              element: tagName,
            });
          }

          // Check attributes using Array.from to avoid index access issues
          const attrs = Array.from(element.attributes);
          for (const attr of attrs) {
            const attrName = attr.name.toLowerCase();

            // Check for event handlers
            if (attrName.startsWith('on')) {
              return err({
                type: 'event_handler',
                message: `Event handlers not allowed: ${attrName}`,
                element: tagName,
                attribute: attrName,
              });
            }

            // Check allowed attributes
            if (!ALLOWED_ATTRIBUTES.includes(attrName as (typeof ALLOWED_ATTRIBUTES)[number])) {
              return err({
                type: 'disallowed_attribute',
                message: `Disallowed attribute: ${attrName} on ${tagName}`,
                element: tagName,
                attribute: attrName,
              });
            }
          }
        }
      }

      return ok(undefined);
    } catch (error) {
      return err({
        type: 'syntax',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Full validation returning detailed results
   */
  validateFull(svgString: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const doc = this.parser.parseFromString(svgString, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        errors.push({
          type: 'syntax',
          message: 'Invalid SVG syntax',
        });
        return { valid: false, errors, warnings };
      }

      // Check for SVG element
      const svg = doc.querySelector('svg');
      if (!svg) {
        errors.push({
          type: 'no_svg',
          message: 'No SVG element found',
        });
        return { valid: false, errors, warnings };
      }

      // Check viewBox
      if (!svg.getAttribute('viewBox')) {
        warnings.push('SVG has no viewBox attribute');
      }

      // Walk DOM and validate elements
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT);
      let node: Node | null;

      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          // Check tag
          if (!ALLOWED_TAGS.includes(tagName as AllowedSvgElement)) {
            errors.push({
              type: 'disallowed_tag',
              message: `Disallowed tag: ${tagName}`,
              element: tagName,
            });
          }

          // Check attributes using Array.from to avoid index access issues
          const attrs = Array.from(element.attributes);
          for (const attr of attrs) {
            const attrName = attr.name.toLowerCase();

            if (attrName.startsWith('on')) {
              errors.push({
                type: 'event_handler',
                message: `Event handlers not allowed: ${attrName}`,
                element: tagName,
                attribute: attrName,
              });
            } else if (
              !ALLOWED_ATTRIBUTES.includes(attrName as (typeof ALLOWED_ATTRIBUTES)[number])
            ) {
              errors.push({
                type: 'disallowed_attribute',
                message: `Disallowed attribute: ${attrName} on ${tagName}`,
                element: tagName,
                attribute: attrName,
              });
            }
          }
        }
      }

      return { valid: errors.length === 0, errors, warnings };
    } catch (error) {
      errors.push({
        type: 'syntax',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Check if an SVG string is valid (quick check)
   */
  isValid(svgString: string): boolean {
    const result = this.validate(svgString);
    return result.success;
  }
}

// Singleton instance
export const svgValidator = new SvgValidator();
