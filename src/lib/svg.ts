/**
 * SVG Utilities
 *
 * @deprecated This module is maintained for backward compatibility.
 * Use the new service layer instead:
 *
 *   import { svgService } from '../services';
 *   // or for individual services:
 *   import { svgParser, svgValidator, svgTransformer } from '../services';
 */

import { svgService, type ThreadStyleOptions } from '../services';

// Re-export constants for backward compatibility
export { ALLOWED_TAGS, ALLOWED_ATTRIBUTES } from '../services';

/**
 * @deprecated Use svgService.sanitize instead
 */
export function sanitizeSvg(svgString: string): string {
  return svgService.sanitize(svgString);
}

/**
 * @deprecated Use svgService.validateFull instead
 */
export function validateSvgStructure(svgString: string): { valid: boolean; error?: string } {
  const result = svgService.validate(svgString);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.message };
}

/**
 * @deprecated Use svgService.extractViewBox instead
 */
export function extractViewBox(svgString: string): string | null {
  const viewBox = svgService.extractViewBox(svgString);
  return viewBox ? svgService.formatViewBox(viewBox) : null;
}

/**
 * @deprecated Use svgService.applyThreadStyle instead
 */
export function applyThreadStyle(
  svgString: string,
  options: {
    strokeColor: string;
    strokeWidthMm: number;
    stitchLengthMm: number;
    gapLengthMm: number;
    viewBox: string;
  }
): string {
  const parsedViewBox = svgService.parseViewBox(options.viewBox);
  if (!parsedViewBox) return svgString;

  const threadOptions: ThreadStyleOptions = {
    strokeColor: options.strokeColor,
    strokeWidthMm: options.strokeWidthMm,
    stitchLengthMm: options.stitchLengthMm,
    gapLengthMm: options.gapLengthMm,
  };

  const result = svgService.applyThreadStyle(svgString, parsedViewBox, threadOptions);
  return result.success ? result.data : svgString;
}

/**
 * @deprecated Use svgService.mirrorHorizontal instead
 */
export function mirrorHorizontal(svgString: string, viewBox: string): string {
  const parsedViewBox = svgService.parseViewBox(viewBox);
  if (!parsedViewBox) return svgString;

  const result = svgService.mirrorHorizontal(svgString, parsedViewBox);
  return result.success ? result.data : svgString;
}

/**
 * @deprecated Use svgService.mirrorVertical instead
 */
export function mirrorVertical(svgString: string, viewBox: string): string {
  const parsedViewBox = svgService.parseViewBox(viewBox);
  if (!parsedViewBox) return svgString;

  const result = svgService.mirrorVertical(svgString, parsedViewBox);
  return result.success ? result.data : svgString;
}

/**
 * @deprecated Use svgService.rotate90 instead
 */
export function rotate90(svgString: string, viewBox: string): string {
  const parsedViewBox = svgService.parseViewBox(viewBox);
  if (!parsedViewBox) return svgString;

  const result = svgService.rotate90(svgString, parsedViewBox);
  return result.success ? result.data : svgString;
}

/**
 * @deprecated Use svgService.snapToGrid instead
 */
export function snapToGrid(svgString: string, viewBox: string, snapGridMm: number): string {
  const parsedViewBox = svgService.parseViewBox(viewBox);
  if (!parsedViewBox) return svgString;

  const result = svgService.snapToGrid(svgString, parsedViewBox, snapGridMm);
  return result.success ? result.data : svgString;
}
