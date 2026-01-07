import { useMemo } from 'react';

export interface ViewBoxDimensions {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * Parses a viewBox string and returns the dimensions.
 * Returns null if the viewBox string is invalid.
 */
export function useViewBox(viewBoxString: string): ViewBoxDimensions | null {
  return useMemo(() => {
    const match = viewBoxString.match(
      /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
    );
    if (!match || match.length < 5) return null;
    const [, minXStr, minYStr, widthStr, heightStr] = match;
    if (!minXStr || !minYStr || !widthStr || !heightStr) return null;
    return {
      minX: parseFloat(minXStr),
      minY: parseFloat(minYStr),
      width: parseFloat(widthStr),
      height: parseFloat(heightStr),
    };
  }, [viewBoxString]);
}

/**
 * Parse viewBox string without memoization (for use in callbacks)
 */
export function parseViewBoxString(viewBoxString: string): ViewBoxDimensions | null {
  const match = viewBoxString.match(
    /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
  );
  if (!match || match.length < 5) return null;
  const [, minXStr, minYStr, widthStr, heightStr] = match;
  if (!minXStr || !minYStr || !widthStr || !heightStr) return null;
  return {
    minX: parseFloat(minXStr),
    minY: parseFloat(minYStr),
    width: parseFloat(widthStr),
    height: parseFloat(heightStr),
  };
}
