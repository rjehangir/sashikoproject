import { useState, useCallback } from 'react';

/**
 * Return type for the useHistory hook
 */
export interface UseHistoryReturn<T> {
  /** Current state value */
  state: T;
  /** Update state and push current to history */
  setState: (newState: T) => void;
  /** Update state without adding to history (for intermediate updates like dragging) */
  setStateWithoutHistory: (newState: T) => void;
  /** Commit a change to history: pushes originalState to past and sets newState as present */
  commitChange: (originalState: T, newState: T) => void;
  /** Undo to previous state */
  undo: () => void;
  /** Redo to next state */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Clear all history */
  clear: () => void;
  /** Reset to a specific state, clearing all history */
  reset: (newState: T) => void;
}

/**
 * Generic undo/redo history hook
 *
 * @param initialState - Initial state value
 * @param maxHistory - Maximum number of history entries to keep (default: 50)
 * @returns History state and controls
 *
 * @example
 * const { state: lines, setState: setLines, undo, redo, canUndo, canRedo } = useHistory<Line[]>([]);
 */
export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const setState = useCallback(
    (newState: T) => {
      setPast((prev) => [...prev.slice(-(maxHistory - 1)), present]);
      setPresent(newState);
      setFuture([]); // Clear redo stack on new action
    },
    [present, maxHistory]
  );

  // Update state without adding to history (for intermediate drag updates)
  const setStateWithoutHistory = useCallback((newState: T) => {
    setPresent(newState);
  }, []);

  // Commit a change: push original to history and set new as present
  const commitChange = useCallback(
    (originalState: T, newState: T) => {
      setPast((prev) => [...prev.slice(-(maxHistory - 1)), originalState]);
      setPresent(newState);
      setFuture([]); // Clear redo stack on new action
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    if (previous === undefined) return;

    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    if (next === undefined) return;

    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, present]);
    setPresent(next);
  }, [future, present]);

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  const reset = useCallback((newState: T) => {
    setPast([]);
    setPresent(newState);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState,
    setStateWithoutHistory,
    commitChange,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clear,
    reset,
  };
}
