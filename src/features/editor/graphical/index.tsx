import { useEffect, useRef, useState, useCallback } from 'react';

import { useDrawing, useViewBox, type Line } from '../../../hooks';
import { useAppStore } from '../../../store';

import { Canvas } from './Canvas';
import { DrawingLine } from './DrawingLine';
import { EditorHeader } from './EditorHeader';
import { GridOverlay } from './GridOverlay';
import { LineRenderer } from './LineRenderer';

export function GraphicalEditor() {
  const {
    svgContent,
    viewBox,
    setSvgContent,
    setViewBox,
    snapGridMm,
    strokeWidthMm,
    activeTool,
    gridPadding,
    gridCols,
    gridRows,
    setGridCols,
    setGridRows,
  } = useAppStore((state) => ({
    svgContent: state.svgContent,
    viewBox: state.viewBox,
    setSvgContent: state.setSvgContent,
    setViewBox: state.setViewBox,
    snapGridMm: state.snapGridMm,
    strokeWidthMm: state.strokeWidthMm,
    activeTool: state.activeTool,
    gridPadding: state.gridPadding,
    gridCols: state.gridCols,
    gridRows: state.gridRows,
    setGridCols: state.setGridCols,
    setGridRows: state.setGridRows,
  }));

  const canvasRef = useRef<SVGSVGElement>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Parse viewBox
  const viewBoxDimensions = useViewBox(viewBox);
  const viewBoxWidth = viewBoxDimensions?.width ?? 10;
  const viewBoxHeight = viewBoxDimensions?.height ?? 10;

  // Sync grid dimensions from viewBox on initial load
  useEffect(() => {
    if (viewBoxDimensions) {
      if (viewBoxDimensions.width !== gridCols) {
        setGridCols(viewBoxDimensions.width);
      }
      if (viewBoxDimensions.height !== gridRows) {
        setGridRows(viewBoxDimensions.height);
      }
    }
    // Only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle grid dimension changes from the settings panel
  const handleGridDimensionsChange = useCallback(
    (cols: number, rows: number) => {
      const newViewBox = `0 0 ${cols} ${rows}`;
      setViewBox(newViewBox);
    },
    [setViewBox]
  );

  // Convert lines to SVG and update store
  const updateSvgFromLines = useCallback(
    (updatedLines: Line[]) => {
      const linesSvg = updatedLines
        .map(
          (line) =>
            `  <line x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}" stroke="white" stroke-width="${strokeWidthMm.toFixed(2)}"/>`
        )
        .join('\n');
      const newSvg = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n${linesSvg}\n</svg>`;
      setSvgContent(newSvg);
    },
    [viewBox, setSvgContent, strokeWidthMm]
  );

  const {
    lines,
    resetLines,
    isDrawing,
    currentLine,
    selectedLine,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDrawing(canvasRef, {
    snapToGrid,
    snapGridMm,
    viewBoxWidth,
    viewBoxHeight,
    activeTool,
    onLinesChange: updateSvgFromLines,
  });

  // Parse SVG content to extract lines on initial load
  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (svg) {
        const extractedLines: Line[] = [];
        const lineElements = svg.querySelectorAll('line');
        lineElements.forEach((lineEl, index) => {
          extractedLines.push({
            id: `line-${index}`,
            x1: parseFloat(lineEl.getAttribute('x1') || '0'),
            y1: parseFloat(lineEl.getAttribute('y1') || '0'),
            x2: parseFloat(lineEl.getAttribute('x2') || '0'),
            y2: parseFloat(lineEl.getAttribute('y2') || '0'),
          });
        });
        resetLines(extractedLines);
      }
    } catch (error) {
      console.error('Error parsing SVG:', error);
    }
    // Only run on initial mount or when svgContent changes from external source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <EditorHeader
        snapToGrid={snapToGrid}
        onSnapChange={setSnapToGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onGridDimensionsChange={handleGridDimensionsChange}
      />
      <Canvas
        ref={canvasRef}
        width={viewBoxWidth}
        height={viewBoxHeight}
        padding={gridPadding}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
      >
        <GridOverlay width={viewBoxWidth} height={viewBoxHeight} padding={gridPadding} />
        <LineRenderer lines={lines} selectedLine={selectedLine} strokeWidth={strokeWidthMm} />
        {isDrawing && currentLine && <DrawingLine line={currentLine} strokeWidth={strokeWidthMm} />}
      </Canvas>
    </div>
  );
}
