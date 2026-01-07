import { useState, useCallback, type RefObject } from 'react';

import type { Tool } from '../types';

import { useHistory } from './useHistory';

export interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PartialLine {
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
}

interface DragState {
  lineId: string;
  point: 'start' | 'end' | 'line';
}

interface UseDrawingOptions {
  snapToGrid: boolean;
  snapGridMm: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  activeTool: Tool;
  onLinesChange: (lines: Line[]) => void;
}

interface UseDrawingReturn {
  lines: Line[];
  setLines: (lines: Line[]) => void;
  resetLines: (lines: Line[]) => void;
  isDrawing: boolean;
  currentLine: PartialLine | null;
  selectedLine: string | null;
  setSelectedLine: (id: string | null) => void;
  handleMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseUp: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Hook to handle line drawing interactions on an SVG canvas
 */
export function useDrawing(
  canvasRef: RefObject<SVGSVGElement | null>,
  options: UseDrawingOptions
): UseDrawingReturn {
  const { snapToGrid: enableSnap, snapGridMm, activeTool, onLinesChange } = options;

  // Use history for undo/redo support
  const {
    state: lines,
    setState: setLinesWithHistory,
    setStateWithoutHistory,
    commitChange,
    reset: resetLines,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Line[]>([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<PartialLine | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  // Wrapper to update lines and notify parent
  const setLines = useCallback(
    (newLines: Line[]) => {
      setLinesWithHistory(newLines);
      onLinesChange(newLines);
    },
    [setLinesWithHistory, onLinesChange]
  );

  const snapValue = useCallback(
    (value: number): number => {
      if (!enableSnap) return value;
      return Math.round(value / snapGridMm) * snapGridMm;
    },
    [enableSnap, snapGridMm]
  );

  const getPointFromEvent = useCallback(
    (e: React.MouseEvent<SVGSVGElement>, applySnap = true): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const svg = canvasRef.current;
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const svgPoint = point.matrixTransform(ctm.inverse());

      if (applySnap && enableSnap) {
        return { x: snapValue(svgPoint.x), y: snapValue(svgPoint.y) };
      }
      return { x: svgPoint.x, y: svgPoint.y };
    },
    [canvasRef, enableSnap, snapValue]
  );

  const distanceToLineSegment = useCallback(
    (point: { x: number; y: number }, line: Line): number => {
      const A = point.x - line.x1;
      const B = point.y - line.y1;
      const C = line.x2 - line.x1;
      const D = line.y2 - line.y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = line.x1;
        yy = line.y1;
      } else if (param > 1) {
        xx = line.x2;
        yy = line.y2;
      } else {
        xx = line.x1 + param * C;
        yy = line.y1 + param * D;
      }

      const dx = point.x - xx;
      const dy = point.y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  // Helper to check if a point hits a line's handles or body
  const checkLineHit = useCallback(
    (
      point: { x: number; y: number },
      line: Line
    ): { hit: boolean; dragPoint: 'start' | 'end' | 'line'; offset?: { x: number; y: number } } => {
      const handleSize = 0.5;
      const distToStart = Math.sqrt(
        Math.pow(point.x - line.x1, 2) + Math.pow(point.y - line.y1, 2)
      );
      const distToEnd = Math.sqrt(Math.pow(point.x - line.x2, 2) + Math.pow(point.y - line.y2, 2));
      const distToLine = distanceToLineSegment(point, line);

      if (distToStart < handleSize) {
        return { hit: true, dragPoint: 'start' };
      }
      if (distToEnd < handleSize) {
        return { hit: true, dragPoint: 'end' };
      }
      if (distToLine < 0.5) {
        const dx = point.x - (line.x1 + line.x2) / 2;
        const dy = point.y - (line.y1 + line.y2) / 2;
        return { hit: true, dragPoint: 'line', offset: { x: dx, y: dy } };
      }
      return { hit: false, dragPoint: 'start' };
    },
    [distanceToLineSegment]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getPointFromEvent(e);

      // Only allow line manipulation in select mode
      if (activeTool === 'select') {
        // PRIORITY: Check selected line first (it's rendered on top, so should be hit first)
        if (selectedLine) {
          const selectedLineData = lines.find((l) => l.id === selectedLine);
          if (selectedLineData) {
            const result = checkLineHit(point, selectedLineData);
            if (result.hit) {
              setDragging({ lineId: selectedLineData.id, point: result.dragPoint });
              if (result.offset) {
                setDragOffset(result.offset);
              }
              return;
            }
          }
        }

        // Check other lines
        for (const line of lines) {
          // Skip the selected line (already checked above)
          if (line.id === selectedLine) continue;

          const result = checkLineHit(point, line);
          if (result.hit) {
            setDragging({ lineId: line.id, point: result.dragPoint });
            setSelectedLine(line.id);
            if (result.offset) {
              setDragOffset(result.offset);
            }
            return;
          }
        }

        // Clicked on empty space in select mode, deselect
        setSelectedLine(null);
        return;
      }

      // In draw mode, start drawing a new line
      if (activeTool === 'draw') {
        setIsDrawing(true);
        setCurrentLine({ x1: point.x, y1: point.y });
        setSelectedLine(null);
      }
    },
    [getPointFromEvent, lines, selectedLine, checkLineHit, activeTool]
  );

  // Track lines during drag without adding to history
  const [linesBeforeDrag, setLinesBeforeDrag] = useState<Line[] | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const point = getPointFromEvent(e, dragging?.point !== 'line');

      if (dragging) {
        // Save initial state when starting drag
        if (linesBeforeDrag === null) {
          setLinesBeforeDrag(lines);
        }

        const updatedLines = lines.map((l) => {
          if (l.id !== dragging.lineId) return l;

          if (dragging.point === 'start') {
            return { ...l, x1: point.x, y1: point.y };
          } else if (dragging.point === 'end') {
            return { ...l, x2: point.x, y2: point.y };
          } else {
            // Moving the whole line
            const rawPoint = getPointFromEvent(e, false);
            const centerX = (l.x1 + l.x2) / 2;
            const centerY = (l.y1 + l.y2) / 2;
            const newCenterX = rawPoint.x - (dragOffset?.x || 0);
            const newCenterY = rawPoint.y - (dragOffset?.y || 0);
            let dx = newCenterX - centerX;
            let dy = newCenterY - centerY;

            if (enableSnap) {
              const newX1 = snapValue(l.x1 + dx);
              const newY1 = snapValue(l.y1 + dy);
              dx = newX1 - l.x1;
              dy = newY1 - l.y1;
            }

            return {
              ...l,
              x1: l.x1 + dx,
              y1: l.y1 + dy,
              x2: l.x2 + dx,
              y2: l.y2 + dy,
            };
          }
        });
        // Update without history during drag (we'll commit on mouse up)
        setStateWithoutHistory(updatedLines);
        onLinesChange(updatedLines);
      } else if (isDrawing && currentLine && activeTool === 'draw') {
        setCurrentLine({ ...currentLine, x2: point.x, y2: point.y });
      }
    },
    [
      dragging,
      dragOffset,
      isDrawing,
      currentLine,
      lines,
      linesBeforeDrag,
      enableSnap,
      activeTool,
      getPointFromEvent,
      snapValue,
      setStateWithoutHistory,
      onLinesChange,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isDrawing && currentLine && activeTool === 'draw') {
        const point = getPointFromEvent(e);
        // Only create line if it has some length
        const dx = point.x - currentLine.x1;
        const dy = point.y - currentLine.y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 0.1) {
          const newLine: Line = {
            id: `line-${Date.now()}`,
            x1: currentLine.x1,
            y1: currentLine.y1,
            x2: point.x,
            y2: point.y,
          };
          const updatedLines = [...lines, newLine];
          setLines(updatedLines);
        }
        setIsDrawing(false);
        setCurrentLine(null);
      }

      // If we were dragging, commit the change to history
      if (dragging && linesBeforeDrag !== null) {
        // Commit the drag: push pre-drag state to history, set current as present
        commitChange(linesBeforeDrag, lines);
        onLinesChange(lines);
        setLinesBeforeDrag(null);
      }
      setDragging(null);
      setDragOffset(null);
    },
    [
      isDrawing,
      currentLine,
      lines,
      activeTool,
      dragging,
      linesBeforeDrag,
      getPointFromEvent,
      setLines,
      commitChange,
      onLinesChange,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      if (
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
        (e.key === 'y' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete selected line
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLine) {
          const updatedLines = lines.filter((l) => l.id !== selectedLine);
          setLines(updatedLines);
          setSelectedLine(null);
        }
      }
    },
    [selectedLine, lines, setLines, undo, redo]
  );

  return {
    lines,
    setLines,
    resetLines,
    isDrawing,
    currentLine,
    selectedLine,
    setSelectedLine,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
