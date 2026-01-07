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
        className="flex-1 overflow-hidden bg-cream-200 dark:bg-charcoal-900"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="application"
        aria-label="Pattern drawing canvas. Use mouse to draw lines, Delete or Backspace to remove selected lines. Ctrl+Z to undo, Ctrl+Shift+Z to redo."
      >
        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
          <svg
            ref={ref}
            viewBox={viewBox}
            className="max-w-full max-h-full rounded shadow-warm"
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
            }}
          >
            {/* Extended drawing area background - slightly darker than main area */}
            <rect
              x={-padding}
              y={-padding}
              width={width + padding * 2}
              height={height + padding * 2}
              className="fill-cream-300 dark:fill-charcoal-800"
            />
            {/* Main tile area background - cloth-like cream color */}
            <rect x="0" y="0" width={width} height={height} fill="#f5f5dc" />
            {children}
          </svg>
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';
