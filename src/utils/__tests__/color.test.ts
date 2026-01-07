import { describe, it, expect } from 'vitest';

import {
  parseColor,
  parseHexColor,
  parseHexColorShort,
  parseRgbColor,
  parseRgbaColor,
  rgbToHex,
  clampRgb,
} from '../color';

describe('color utils', () => {
  describe('parseHexColor', () => {
    it('should parse 6-digit hex', () => {
      expect(parseHexColor('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseHexColor('#00ff00')).toEqual({ r: 0, g: 1, b: 0 });
      expect(parseHexColor('#0000ff')).toEqual({ r: 0, g: 0, b: 1 });
    });

    it('should parse uppercase hex', () => {
      expect(parseHexColor('#FF0000')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseHexColor('#FFFFFF')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should parse mixed case hex', () => {
      expect(parseHexColor('#FfFfFf')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should parse black and white', () => {
      expect(parseHexColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseHexColor('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should return null for invalid hex', () => {
      expect(parseHexColor('#fff')).toBeNull(); // 3-digit not supported by this function
      expect(parseHexColor('red')).toBeNull();
      expect(parseHexColor('#gg0000')).toBeNull(); // Invalid characters
      expect(parseHexColor('ff0000')).toBeNull(); // Missing #
    });
  });

  describe('parseHexColorShort', () => {
    it('should parse 3-digit hex', () => {
      expect(parseHexColorShort('#fff')).toEqual({ r: 1, g: 1, b: 1 });
      expect(parseHexColorShort('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseHexColorShort('#f00')).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('should return null for 6-digit hex', () => {
      expect(parseHexColorShort('#ff0000')).toBeNull();
    });
  });

  describe('parseRgbColor', () => {
    it('should parse rgb() format', () => {
      expect(parseRgbColor('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseRgbColor('rgb(0, 128, 255)')).toEqual({
        r: 0,
        g: 128 / 255,
        b: 1,
      });
    });

    it('should handle no spaces', () => {
      expect(parseRgbColor('rgb(255,0,0)')).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('should handle extra spaces', () => {
      expect(parseRgbColor('rgb(  255  ,  0  ,  0  )')).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('should return null for invalid format', () => {
      expect(parseRgbColor('rgb(255, 0)')).toBeNull(); // Missing value
      expect(parseRgbColor('rgba(255, 0, 0, 1)')).toBeNull(); // Wrong function name
    });
  });

  describe('parseRgbaColor', () => {
    it('should parse rgba() format', () => {
      expect(parseRgbaColor('rgba(255, 0, 0, 1)')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseRgbaColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should ignore alpha value', () => {
      const result1 = parseRgbaColor('rgba(128, 128, 128, 0)');
      const result2 = parseRgbaColor('rgba(128, 128, 128, 1)');
      expect(result1).toEqual(result2);
    });
  });

  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should parse short hex colors', () => {
      expect(parseColor('#fff')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should parse rgb colors', () => {
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse rgba colors', () => {
      expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('should default to white for unknown formats', () => {
      expect(parseColor('unknown')).toEqual({ r: 1, g: 1, b: 1 });
      expect(parseColor('red')).toEqual({ r: 1, g: 1, b: 1 }); // Named colors not supported
    });

    it('should handle whitespace', () => {
      expect(parseColor('  #ffffff  ')).toEqual({ r: 1, g: 1, b: 1 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 1, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 1 })).toBe('#0000ff');
    });

    it('should handle black and white', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe('#ffffff');
    });

    it('should round intermediate values', () => {
      expect(rgbToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
    });
  });

  describe('clampRgb', () => {
    it('should clamp values above 1', () => {
      expect(clampRgb({ r: 1.5, g: 2, b: 100 })).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should clamp values below 0', () => {
      expect(clampRgb({ r: -0.5, g: -1, b: -100 })).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should not change valid values', () => {
      expect(clampRgb({ r: 0.5, g: 0.25, b: 0.75 })).toEqual({ r: 0.5, g: 0.25, b: 0.75 });
    });

    it('should handle boundary values', () => {
      expect(clampRgb({ r: 0, g: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 });
      expect(clampRgb({ r: 1, g: 1, b: 1 })).toEqual({ r: 1, g: 1, b: 1 });
    });
  });
});
