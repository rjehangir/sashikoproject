import { describe, it, expect } from 'vitest';

import { mmToInches, inchesToMm, mmToPoints, convert } from '../units';

describe('units', () => {
  it('converts mm to inches correctly', () => {
    expect(mmToInches(25.4)).toBeCloseTo(1, 5);
    expect(mmToInches(50.8)).toBeCloseTo(2, 5);
  });

  it('converts inches to mm correctly', () => {
    expect(inchesToMm(1)).toBeCloseTo(25.4, 5);
    expect(inchesToMm(2)).toBeCloseTo(50.8, 5);
  });

  it('converts mm to points correctly', () => {
    expect(mmToPoints(25.4)).toBeCloseTo(72, 5);
  });

  it('converts between units', () => {
    expect(convert(25.4, 'mm', 'in')).toBeCloseTo(1, 5);
    expect(convert(1, 'in', 'mm')).toBeCloseTo(25.4, 5);
    expect(convert(10, 'mm', 'mm')).toBe(10);
  });
});
