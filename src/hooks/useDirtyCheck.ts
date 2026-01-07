/**
 * useDirtyCheck hook
 * Tracks whether the current pattern has unsaved changes
 */

import { useCallback, useEffect, useRef } from 'react';

import { useAppStore } from '../store';

/**
 * Hook to track if the current pattern has unsaved changes
 */
export function useDirtyCheck() {
  const svgContent = useAppStore((state) => state.svgContent);
  const patternName = useAppStore((state) => state.patternName);
  const lastSavedState = useAppStore((state) => state.lastSavedState);
  const setLastSavedState = useAppStore((state) => state.setLastSavedState);

  // Keep a reference to initial state
  const initialStateRef = useRef<{ svgContent: string; patternName: string } | null>(null);

  // Set initial state on first render
  useEffect(() => {
    if (!initialStateRef.current) {
      initialStateRef.current = { svgContent, patternName };
    }
  }, [svgContent, patternName]);

  /**
   * Check if current state differs from last saved/loaded state
   */
  const isDirty = useCallback(() => {
    // If we have a tracked last saved state, compare against it
    if (lastSavedState) {
      return svgContent !== lastSavedState.svgContent || patternName !== lastSavedState.patternName;
    }

    // Otherwise, compare against initial state
    if (initialStateRef.current) {
      return (
        svgContent !== initialStateRef.current.svgContent ||
        patternName !== initialStateRef.current.patternName
      );
    }

    // If no reference state, consider dirty if there's meaningful content
    return svgContent.includes('<path') || svgContent.includes('<line');
  }, [svgContent, patternName, lastSavedState]);

  /**
   * Mark current state as saved (not dirty)
   */
  const markAsSaved = useCallback(() => {
    setLastSavedState({ svgContent, patternName });
    initialStateRef.current = { svgContent, patternName };
  }, [svgContent, patternName, setLastSavedState]);

  /**
   * Reset dirty tracking (e.g., after loading a new pattern)
   */
  const resetDirtyTracking = useCallback(() => {
    setLastSavedState({ svgContent, patternName });
    initialStateRef.current = { svgContent, patternName };
  }, [svgContent, patternName, setLastSavedState]);

  return {
    isDirty: isDirty(),
    markAsSaved,
    resetDirtyTracking,
  };
}
