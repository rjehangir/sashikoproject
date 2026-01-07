/**
 * Unit conversion utilities
 * All internal values are stored in millimeters
 */

import { MM_PER_INCH, POINTS_PER_INCH } from '../config/constants';
import type { Unit, Dimensions } from '../types';

/**
 * Convert millimeters to inches
 */
export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/**
 * Convert inches to millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

/**
 * Convert millimeters to points (for PDF)
 * 1 inch = 72 points, 1 inch = 25.4mm
 */
export function mmToPoints(mm: number): number {
  return (mm * POINTS_PER_INCH) / MM_PER_INCH;
}

/**
 * Convert points to millimeters
 */
export function pointsToMm(points: number): number {
  return (points * MM_PER_INCH) / POINTS_PER_INCH;
}

/**
 * Convert between display units (mm and inches)
 */
export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === 'mm' && to === 'in') return mmToInches(value);
  if (from === 'in' && to === 'mm') return inchesToMm(value);
  return value;
}

/**
 * Convert dimensions between units
 */
export function convertDimensions(dimensions: Dimensions, from: Unit, to: Unit): Dimensions {
  return {
    width: convert(dimensions.width, from, to),
    height: convert(dimensions.height, from, to),
  };
}

/**
 * Format a value with its unit for display
 */
export function formatWithUnit(value: number, unit: Unit, decimals: number = 1): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Parse a value with optional unit suffix
 * Returns value in mm
 */
export function parseValueWithUnit(value: string, defaultUnit: Unit = 'mm'): number | null {
  const trimmed = value.trim().toLowerCase();

  // Check for explicit unit
  const inchMatch = trimmed.match(/^([\d.]+)\s*(in|inch|inches|")$/);
  if (inchMatch && inchMatch[1]) {
    const num = parseFloat(inchMatch[1]);
    return isNaN(num) ? null : inchesToMm(num);
  }

  const mmMatch = trimmed.match(/^([\d.]+)\s*(mm|millimeters?)$/);
  if (mmMatch && mmMatch[1]) {
    const num = parseFloat(mmMatch[1]);
    return isNaN(num) ? null : num;
  }

  // No unit specified, use default
  const num = parseFloat(trimmed);
  if (isNaN(num)) return null;

  return defaultUnit === 'in' ? inchesToMm(num) : num;
}

/**
 * Round to a specific number of decimal places
 */
export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Snap a value to a grid
 */
export function snapToGridValue(value: number, gridSize: number): number {
  if (gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}
