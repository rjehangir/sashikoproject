import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useViewBox, parseViewBoxString } from '../useViewBox';

describe('useViewBox', () => {
  it('should parse valid viewBox string', () => {
    const { result } = renderHook(() => useViewBox('0 0 100 200'));

    expect(result.current).toEqual({
      minX: 0,
      minY: 0,
      width: 100,
      height: 200,
    });
  });

  it('should parse viewBox with decimal values', () => {
    const { result } = renderHook(() => useViewBox('0.5 1.5 50.5 100.5'));

    expect(result.current).toEqual({
      minX: 0.5,
      minY: 1.5,
      width: 50.5,
      height: 100.5,
    });
  });

  it('should parse viewBox with negative minX and minY', () => {
    const { result } = renderHook(() => useViewBox('-10 -20 100 200'));

    expect(result.current).toEqual({
      minX: -10,
      minY: -20,
      width: 100,
      height: 200,
    });
  });

  it('should return null for invalid viewBox', () => {
    const { result } = renderHook(() => useViewBox('invalid'));
    expect(result.current).toBeNull();
  });

  it('should return null for empty string', () => {
    const { result } = renderHook(() => useViewBox(''));
    expect(result.current).toBeNull();
  });

  it('should return null for incomplete viewBox', () => {
    const { result } = renderHook(() => useViewBox('0 0 100'));
    expect(result.current).toBeNull();
  });

  it('should memoize result for same input', () => {
    const { result, rerender } = renderHook(({ viewBox }) => useViewBox(viewBox), {
      initialProps: { viewBox: '0 0 10 10' },
    });

    const first = result.current;
    rerender({ viewBox: '0 0 10 10' });
    expect(result.current).toBe(first);
  });

  it('should update result when input changes', () => {
    const { result, rerender } = renderHook(({ viewBox }) => useViewBox(viewBox), {
      initialProps: { viewBox: '0 0 10 10' },
    });

    expect(result.current).toEqual({ minX: 0, minY: 0, width: 10, height: 10 });

    rerender({ viewBox: '0 0 20 20' });
    expect(result.current).toEqual({ minX: 0, minY: 0, width: 20, height: 20 });
  });

  it('should handle extra whitespace', () => {
    const { result } = renderHook(() => useViewBox('  0   0   100   200  '));

    expect(result.current).toEqual({
      minX: 0,
      minY: 0,
      width: 100,
      height: 200,
    });
  });
});

describe('parseViewBoxString', () => {
  it('should parse valid viewBox string', () => {
    expect(parseViewBoxString('0 0 100 200')).toEqual({
      minX: 0,
      minY: 0,
      width: 100,
      height: 200,
    });
  });

  it('should return null for invalid input', () => {
    expect(parseViewBoxString('invalid')).toBeNull();
    expect(parseViewBoxString('')).toBeNull();
  });

  it('should parse negative values', () => {
    expect(parseViewBoxString('-5 -10 100 200')).toEqual({
      minX: -5,
      minY: -10,
      width: 100,
      height: 200,
    });
  });

  it('should parse decimal values', () => {
    expect(parseViewBoxString('0.5 1.5 10.5 20.5')).toEqual({
      minX: 0.5,
      minY: 1.5,
      width: 10.5,
      height: 20.5,
    });
  });
});
