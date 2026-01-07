import { useCallback } from 'react';

import { mirrorHorizontal, mirrorVertical, rotate90, snapToGrid } from '../lib/svg';
import { useAppStore } from '../store';

interface UseSvgTransformReturn {
  mirrorH: () => void;
  mirrorV: () => void;
  rotate: () => void;
  snap: () => void;
}

/**
 * Hook to handle SVG transformation operations
 */
export function useSvgTransform(): UseSvgTransformReturn {
  const mirrorH = useCallback(() => {
    const { svgContent, viewBox, setSvgContent } = useAppStore.getState();
    const mirrored = mirrorHorizontal(svgContent, viewBox);
    setSvgContent(mirrored);
  }, []);

  const mirrorV = useCallback(() => {
    const { svgContent, viewBox, setSvgContent } = useAppStore.getState();
    const mirrored = mirrorVertical(svgContent, viewBox);
    setSvgContent(mirrored);
  }, []);

  const rotate = useCallback(() => {
    const { svgContent, viewBox, setSvgContent } = useAppStore.getState();
    const rotated = rotate90(svgContent, viewBox);
    setSvgContent(rotated);
  }, []);

  const snap = useCallback(() => {
    const { svgContent, viewBox, snapGridMm, setSvgContent } = useAppStore.getState();
    const snapped = snapToGrid(svgContent, viewBox, snapGridMm);
    setSvgContent(snapped);
  }, []);

  return { mirrorH, mirrorV, rotate, snap };
}
