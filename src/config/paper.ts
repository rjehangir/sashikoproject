/**
 * Paper size definitions for export
 * All dimensions are in millimeters
 */

import type { PaperSize, Dimensions } from '../types';

/**
 * Paper dimensions by size
 */
export const PAPER_SIZES: Record<PaperSize, Dimensions> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
} as const;

/**
 * Get paper dimensions, optionally in landscape orientation
 */
export function getPaperDimensions(size: PaperSize, landscape: boolean = false): Dimensions {
  const dimensions = PAPER_SIZES[size];

  if (landscape) {
    return {
      width: dimensions.height,
      height: dimensions.width,
    };
  }

  return dimensions;
}

/**
 * Get all available paper sizes
 */
export function getAvailablePaperSizes(): PaperSize[] {
  return Object.keys(PAPER_SIZES) as PaperSize[];
}

/**
 * Default paper size
 */
export const DEFAULT_PAPER_SIZE: PaperSize = 'A4';

/**
 * Default page margins in mm
 */
export const DEFAULT_PAGE_MARGINS = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
} as const;

export type PageMargins = typeof DEFAULT_PAGE_MARGINS;
