/**
 * SVG Service Facade
 * Unified interface for all SVG operations
 */

import type { Result, ViewBox } from '../../types';
import { ok } from '../../types';

import { svgParser } from './SvgParser';
import { svgSerializer } from './SvgSerializer';
import { svgTransformer, type ThreadStyleOptions } from './SvgTransformer';
import { svgValidator, type ValidationError, type ValidationResult } from './SvgValidator';

// Re-export individual services and types
export { SvgParser, svgParser } from './SvgParser';
export type { ParsedSvg } from './SvgParser';
export { SvgValidator, svgValidator, ALLOWED_TAGS, ALLOWED_ATTRIBUTES } from './SvgValidator';
export type { ValidationError, ValidationResult, ValidationErrorType } from './SvgValidator';
export { SvgTransformer, svgTransformer } from './SvgTransformer';
export type { ThreadStyleOptions } from './SvgTransformer';
export { SvgSerializer, svgSerializer } from './SvgSerializer';
export type { SerializeOptions } from './SvgSerializer';

/**
 * Unified SVG Service providing a facade over all SVG operations
 */
export class SvgService {
  private parser = svgParser;
  private validator = svgValidator;
  private transformer = svgTransformer;
  private serializer = svgSerializer;

  // ============================================================================
  // PARSING
  // ============================================================================

  /**
   * Parse an SVG string
   */
  parse(svgString: string) {
    return this.parser.parse(svgString);
  }

  /**
   * Extract viewBox from SVG string
   */
  extractViewBox(svgString: string): ViewBox | null {
    return this.parser.extractViewBox(svgString);
  }

  /**
   * Parse a viewBox string
   */
  parseViewBox(viewBoxString: string): ViewBox | null {
    return this.parser.parseViewBox(viewBoxString);
  }

  /**
   * Format a viewBox object as string
   */
  formatViewBox(viewBox: ViewBox): string {
    return this.parser.formatViewBox(viewBox);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate an SVG string
   */
  validate(svgString: string): Result<void, ValidationError> {
    return this.validator.validate(svgString);
  }

  /**
   * Full validation with warnings
   */
  validateFull(svgString: string): ValidationResult {
    return this.validator.validateFull(svgString);
  }

  /**
   * Sanitize an SVG string
   */
  sanitize(svgString: string): string {
    return this.validator.sanitize(svgString);
  }

  /**
   * Quick validity check
   */
  isValid(svgString: string): boolean {
    return this.validator.isValid(svgString);
  }

  // ============================================================================
  // TRANSFORMATION
  // ============================================================================

  /**
   * Mirror SVG horizontally
   */
  mirrorHorizontal(svgString: string, viewBox: ViewBox): Result<string> {
    return this.transformer.mirrorHorizontal(svgString, viewBox);
  }

  /**
   * Mirror SVG vertically
   */
  mirrorVertical(svgString: string, viewBox: ViewBox): Result<string> {
    return this.transformer.mirrorVertical(svgString, viewBox);
  }

  /**
   * Rotate SVG 90 degrees clockwise
   */
  rotate90(svgString: string, viewBox: ViewBox): Result<string> {
    return this.transformer.rotate90(svgString, viewBox);
  }

  /**
   * Snap coordinates to grid
   */
  snapToGrid(svgString: string, viewBox: ViewBox, gridSizeMm: number): Result<string> {
    return this.transformer.snapToGrid(svgString, viewBox, gridSizeMm);
  }

  /**
   * Apply thread styling
   */
  applyThreadStyle(
    svgString: string,
    viewBox: ViewBox,
    options: ThreadStyleOptions
  ): Result<string> {
    return this.transformer.applyThreadStyle(svgString, viewBox, options);
  }

  /**
   * Reset thread style
   */
  resetThreadStyle(svgString: string): Result<string> {
    return this.transformer.resetThreadStyle(svgString);
  }

  /**
   * Set viewBox on SVG
   */
  setViewBox(svgString: string, viewBox: ViewBox): Result<string> {
    return this.transformer.setViewBox(svgString, viewBox);
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  /**
   * Create an empty SVG with viewBox
   */
  createEmptySvg(viewBox: ViewBox): string {
    return this.serializer.createEmptySvg(viewBox);
  }

  /**
   * Create SVG wrapper with content
   */
  createSvgWrapper(viewBox: ViewBox, content: string): string {
    return this.serializer.createSvgWrapper(viewBox, content);
  }

  // ============================================================================
  // COMBINED OPERATIONS
  // ============================================================================

  /**
   * Validate and sanitize SVG in one operation
   */
  validateAndSanitize(svgString: string): Result<string> {
    const validation = this.validateFull(svgString);

    if (validation.errors.length > 0) {
      // If there are errors, try sanitizing first
      const sanitized = this.sanitize(svgString);
      const revalidation = this.validateFull(sanitized);

      if (revalidation.errors.length > 0) {
        return {
          success: false,
          error: new Error(revalidation.errors.map((e) => e.message).join('; ')),
        };
      }

      return ok(sanitized);
    }

    return ok(svgString);
  }

  /**
   * Parse, validate, and extract viewBox
   */
  parseAndValidate(svgString: string): Result<{ svg: string; viewBox: ViewBox }> {
    const validation = this.validate(svgString);
    if (!validation.success) {
      return { success: false, error: new Error(validation.error.message) };
    }

    const viewBox = this.extractViewBox(svgString);
    if (!viewBox) {
      return { success: false, error: new Error('SVG has no valid viewBox') };
    }

    return ok({ svg: svgString, viewBox });
  }
}

// Singleton instance for convenience
export const svgService = new SvgService();
