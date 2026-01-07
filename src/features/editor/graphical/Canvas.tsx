import { forwardRef, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';

interface CanvasProps {
  width: number;
  height: number;
  /** Grid padding - extra grid squares beyond the viewBox */
  padding?: number;
  children: ReactNode;
  onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseUp: (e: MouseEvent<SVGSVGElement>) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(
  (
    { width, height, padding = 0, children, onMouseDown, onMouseMove, onMouseUp, onKeyDown },
    ref
  ) => {
    // Calculate viewBox with padding
    const viewBoxX = -padding - 0.5;
    const viewBoxY = -padding - 0.5;
    const viewBoxWidth = width + padding * 2 + 1;
    const viewBoxHeight = height + padding * 2 + 1;
    const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

    return (
      <div
        className="flex-1 overflow-hidden"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="application"
        aria-label="Pattern drawing canvas. Use mouse to draw lines, Delete or Backspace to remove selected lines. Ctrl+Z to undo, Ctrl+Shift+Z to redo."
      >
        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
          <svg
            ref={ref}
            viewBox={viewBox}
            className="max-w-full max-h-full rounded"
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            role="img"
            aria-label="Pattern drawing area"
            style={{
              width: '100%',
              height: '100%',
              minWidth: '300px',
              minHeight: '300px',
              backgroundColor: '#111827',
            }}
          >
            {/* Extended drawing area background */}
            <rect
              x={-padding}
              y={-padding}
              width={width + padding * 2}
              height={height + padding * 2}
              fill="#0f172a"
            />
            {/* Main tile area background */}
            <rect x="0" y="0" width={width} height={height} fill="#1f2937" />
            {children}
          </svg>
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';
