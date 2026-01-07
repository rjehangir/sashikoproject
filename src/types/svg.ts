/**
 * SVG-related types
 * Defines types for SVG parsing, manipulation, and rendering
 */

/**
 * Parsed SVG viewBox
 */
export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * Allowed SVG element types (security constraint)
 */
export type AllowedSvgElement =
  | 'svg'
  | 'g'
  | 'path'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'circle'
  | 'rect';

/**
 * SVG line element data
 */
export interface SvgLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

/**
 * SVG path element data
 */
export interface SvgPath {
  id: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

/**
 * SVG circle element data
 */
export interface SvgCircle {
  id: string;
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

/**
 * SVG rect element data
 */
export interface SvgRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

/**
 * Union of all SVG element data types
 */
export type SvgElement = SvgLine | SvgPath | SvgCircle | SvgRect;

/**
 * Parse a viewBox string into a ViewBox object
 */
export function parseViewBox(viewBoxString: string): ViewBox | null {
  const parts = viewBoxString.trim().split(/\s+/);
  if (parts.length !== 4) return null;

  const values = parts.map(Number);
  if (values.some((v) => Number.isNaN(v))) return null;

  const [minX, minY, width, height] = values as [number, number, number, number];
  return { minX, minY, width, height };
}

/**
 * Format a ViewBox object as a string
 */
export function formatViewBox(viewBox: ViewBox): string {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;
}

/**
 * Create a default viewBox
 */
export function createDefaultViewBox(width: number = 10, height: number = 10): ViewBox {
  return { minX: 0, minY: 0, width, height };
}
