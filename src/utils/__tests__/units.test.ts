import { describe, it, expect } from 'vitest';

import {
  mmToInches,
  inchesToMm,
  mmToPoints,
  pointsToMm,
  convert,
  convertDimensions,
  formatWithUnit,
  parseValueWithUnit,
  roundToDecimals,
  snapToGridValue,
} from '../units';

describe('units', () => {
  describe('mmToInches', () => {
    it('should convert mm to inches correctly', () => {
      expect(mmToInches(25.4)).toBeCloseTo(1, 5);
      expect(mmToInches(50.8)).toBeCloseTo(2, 5);
      expect(mmToInches(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(mmToInches(-25.4)).toBeCloseTo(-1, 5);
    });
  });

  describe('inchesToMm', () => {
    it('should convert inches to mm correctly', () => {
      expect(inchesToMm(1)).toBeCloseTo(25.4, 5);
      expect(inchesToMm(2)).toBeCloseTo(50.8, 5);
      expect(inchesToMm(0)).toBe(0);
    });

    it('should be inverse of mmToInches', () => {
      expect(inchesToMm(mmToInches(100))).toBeCloseTo(100, 5);
      expect(mmToInches(inchesToMm(5))).toBeCloseTo(5, 5);
    });
  });

  describe('mmToPoints', () => {
    it('should convert mm to points correctly', () => {
      // 25.4mm = 1 inch = 72 points
      expect(mmToPoints(25.4)).toBeCloseTo(72, 5);
    });

    it('should handle zero', () => {
      expect(mmToPoints(0)).toBe(0);
    });
  });

  describe('pointsToMm', () => {
    it('should convert points to mm correctly', () => {
      expect(pointsToMm(72)).toBeCloseTo(25.4, 5);
    });

    it('should be inverse of mmToPoints', () => {
      expect(pointsToMm(mmToPoints(50))).toBeCloseTo(50, 5);
      expect(mmToPoints(pointsToMm(100))).toBeCloseTo(100, 5);
    });
  });

  describe('convert', () => {
    it('should return same value for same units', () => {
      expect(convert(10, 'mm', 'mm')).toBe(10);
      expect(convert(10, 'in', 'in')).toBe(10);
    });

    it('should convert mm to in', () => {
      expect(convert(25.4, 'mm', 'in')).toBeCloseTo(1, 5);
    });

    it('should convert in to mm', () => {
      expect(convert(1, 'in', 'mm')).toBeCloseTo(25.4, 5);
    });
  });

  describe('convertDimensions', () => {
    it('should convert both width and height', () => {
      const dimensions = { width: 25.4, height: 50.8 };
      const result = convertDimensions(dimensions, 'mm', 'in');

      expect(result.width).toBeCloseTo(1, 5);
      expect(result.height).toBeCloseTo(2, 5);
    });

    it('should return same dimensions for same units', () => {
      const dimensions = { width: 100, height: 200 };
      const result = convertDimensions(dimensions, 'mm', 'mm');

      expect(result).toEqual(dimensions);
    });
  });

  describe('formatWithUnit', () => {
    it('should format value with unit', () => {
      expect(formatWithUnit(10, 'mm')).toBe('10.0 mm');
      expect(formatWithUnit(2.5, 'in')).toBe('2.5 in');
    });

    it('should respect decimal places', () => {
      expect(formatWithUnit(10.123, 'mm', 2)).toBe('10.12 mm');
      expect(formatWithUnit(10.126, 'mm', 2)).toBe('10.13 mm');
    });

    it('should default to 1 decimal place', () => {
      expect(formatWithUnit(10.56, 'mm')).toBe('10.6 mm');
    });
  });

  describe('parseValueWithUnit', () => {
    it('should parse value with mm unit', () => {
      expect(parseValueWithUnit('10mm')).toBe(10);
      expect(parseValueWithUnit('10 mm')).toBe(10);
      expect(parseValueWithUnit('10 millimeters')).toBe(10);
    });

    it('should parse value with inch unit', () => {
      expect(parseValueWithUnit('1in')).toBeCloseTo(25.4, 5);
      expect(parseValueWithUnit('1 inch')).toBeCloseTo(25.4, 5);
      expect(parseValueWithUnit('1 inches')).toBeCloseTo(25.4, 5);
      expect(parseValueWithUnit('1"')).toBeCloseTo(25.4, 5);
    });

    it('should use default unit when no unit specified', () => {
      expect(parseValueWithUnit('10', 'mm')).toBe(10);
      expect(parseValueWithUnit('1', 'in')).toBeCloseTo(25.4, 5);
    });

    it('should return null for invalid input', () => {
      expect(parseValueWithUnit('abc')).toBeNull();
      expect(parseValueWithUnit('')).toBeNull();
    });

    it('should handle decimal values', () => {
      expect(parseValueWithUnit('10.5mm')).toBe(10.5);
      expect(parseValueWithUnit('2.5 inches')).toBeCloseTo(63.5, 5);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimals(10.126, 2)).toBe(10.13);
      expect(roundToDecimals(10.124, 2)).toBe(10.12);
      expect(roundToDecimals(10.5, 0)).toBe(11);
    });

    it('should handle zero decimals', () => {
      expect(roundToDecimals(10.6, 0)).toBe(11);
      expect(roundToDecimals(10.4, 0)).toBe(10);
    });
  });

  describe('snapToGridValue', () => {
    it('should snap to grid', () => {
      expect(snapToGridValue(10.3, 1)).toBe(10);
      expect(snapToGridValue(10.6, 1)).toBe(11);
      expect(snapToGridValue(12.5, 5)).toBe(15);
    });

    it('should return original value when grid size is 0', () => {
      expect(snapToGridValue(10.3, 0)).toBe(10.3);
    });

    it('should return original value when grid size is negative', () => {
      expect(snapToGridValue(10.3, -1)).toBe(10.3);
    });

    it('should handle exact grid values', () => {
      expect(snapToGridValue(10, 5)).toBe(10);
      expect(snapToGridValue(15, 5)).toBe(15);
    });
  });
});
