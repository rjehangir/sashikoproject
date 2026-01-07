/**
 * Unit conversion utilities
 *
 * @deprecated This module is maintained for backward compatibility.
 * Use the new utilities instead:
 *
 *   import { mmToInches, inchesToMm, mmToPoints, ... } from '../utils';
 *
 * All internal values are stored in millimeters
 */

import type { Unit, Dimensions } from '../types';
import {
  mmToInches as _mmToInches,
  inchesToMm as _inchesToMm,
  mmToPoints as _mmToPoints,
  pointsToMm as _pointsToMm,
  convert as _convert,
  convertDimensions as _convertDimensions,
  formatWithUnit as _formatWithUnit,
} from '../utils';

// Re-export Unit type for convenience
export type { Unit };

/**
 * Convert millimeters to inches
 * @deprecated Use mmToInches from '../utils' instead
 */
export function mmToInches(mm: number): number {
  return _mmToInches(mm);
}

/**
 * Convert inches to millimeters
 * @deprecated Use inchesToMm from '../utils' instead
 */
export function inchesToMm(inches: number): number {
  return _inchesToMm(inches);
}

/**
 * Convert millimeters to points (for PDF)
 * @deprecated Use mmToPoints from '../utils' instead
 */
export function mmToPoints(mm: number): number {
  return _mmToPoints(mm);
}

/**
 * Convert points to millimeters
 * @deprecated Use pointsToMm from '../utils' instead
 */
export function pointsToMm(points: number): number {
  return _pointsToMm(points);
}

/**
 * Convert between units
 * @deprecated Use convert from '../utils' instead
 */
export function convert(value: number, from: Unit, to: Unit): number {
  return _convert(value, from, to);
}

/**
 * Convert dimensions between units
 * @deprecated Use convertDimensions from '../utils' instead
 */
export function convertDimensions(dimensions: Dimensions, from: Unit, to: Unit): Dimensions {
  return _convertDimensions(dimensions, from, to);
}

/**
 * Format a value with its unit for display
 * @deprecated Use formatWithUnit from '../utils' instead
 */
export function formatWithUnit(value: number, unit: Unit, decimals: number = 1): string {
  return _formatWithUnit(value, unit, decimals);
}
