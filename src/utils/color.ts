/**
 * Color parsing utilities
 * Handles conversion between different color formats
 */

/**
 * RGB color with values normalized to 0-1 range
 */
export interface RGB {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
}

/**
 * Parse a hex color string (#RRGGBB) to RGB
 */
export function parseHexColor(hex: string): RGB | null {
  const match = hex.match(/^#([0-9A-Fa-f]{6})$/);
  if (!match || !match[1]) return null;
  const hexStr = match[1];
  return {
    r: parseInt(hexStr.slice(0, 2), 16) / 255,
    g: parseInt(hexStr.slice(2, 4), 16) / 255,
    b: parseInt(hexStr.slice(4, 6), 16) / 255,
  };
}

/**
 * Parse a short hex color string (#RGB) to RGB
 */
export function parseHexColorShort(hex: string): RGB | null {
  const match = hex.match(/^#([0-9A-Fa-f]{3})$/);
  if (!match || !match[1]) return null;
  const hexStr = match[1];
  const r = hexStr[0];
  const g = hexStr[1];
  const b = hexStr[2];
  if (!r || !g || !b) return null;
  return {
    r: parseInt(r + r, 16) / 255,
    g: parseInt(g + g, 16) / 255,
    b: parseInt(b + b, 16) / 255,
  };
}

/**
 * Parse an rgb() color string to RGB
 */
export function parseRgbColor(rgb: string): RGB | null {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match || !match[1] || !match[2] || !match[3]) return null;
  return {
    r: parseInt(match[1], 10) / 255,
    g: parseInt(match[2], 10) / 255,
    b: parseInt(match[3], 10) / 255,
  };
}

/**
 * Parse an rgba() color string to RGB (alpha is ignored)
 */
export function parseRgbaColor(rgba: string): RGB | null {
  const match = rgba.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/);
  if (!match || !match[1] || !match[2] || !match[3]) return null;
  return {
    r: parseInt(match[1], 10) / 255,
    g: parseInt(match[2], 10) / 255,
    b: parseInt(match[3], 10) / 255,
  };
}

/**
 * Parse any supported color format to RGB
 * Returns white as fallback if parsing fails
 */
export function parseColor(color: string): RGB {
  const trimmed = color.trim();
  return (
    parseHexColor(trimmed) ??
    parseHexColorShort(trimmed) ??
    parseRgbColor(trimmed) ??
    parseRgbaColor(trimmed) ?? { r: 1, g: 1, b: 1 }
  );
}

/**
 * Convert RGB to hex color string
 */
export function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r * 255)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(rgb.g * 255)
    .toString(16)
    .padStart(2, '0');
  const b = Math.round(rgb.b * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Clamp RGB values to valid range
 */
export function clampRgb(rgb: RGB): RGB {
  return {
    r: Math.max(0, Math.min(1, rgb.r)),
    g: Math.max(0, Math.min(1, rgb.g)),
    b: Math.max(0, Math.min(1, rgb.b)),
  };
}
