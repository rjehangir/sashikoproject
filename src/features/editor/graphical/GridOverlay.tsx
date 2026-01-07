interface GridOverlayProps {
  width: number;
  height: number;
  /** Number of grid squares beyond the viewBox boundary */
  padding?: number;
}

export function GridOverlay({ width, height, padding = 0 }: GridOverlayProps) {
  const startX = -padding;
  const endX = width + padding;
  const startY = -padding;
  const endY = height + padding;

  const verticalLines = Math.floor(endX - startX) + 1;
  const horizontalLines = Math.floor(endY - startY) + 1;

  return (
    <>
      {/* Extended grid - vertical lines */}
      {Array.from({ length: verticalLines }).map((_, i) => {
        const x = startX + i;
        const isInsideBounds = x >= 0 && x <= width;
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={startY}
            x2={x}
            y2={endY}
            stroke={isInsideBounds ? '#374151' : '#1f2937'}
            strokeWidth="0.05"
          />
        );
      })}
      {/* Extended grid - horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, i) => {
        const y = startY + i;
        const isInsideBounds = y >= 0 && y <= height;
        return (
          <line
            key={`h-${i}`}
            x1={startX}
            y1={y}
            x2={endX}
            y2={y}
            stroke={isInsideBounds ? '#374151' : '#1f2937'}
            strokeWidth="0.05"
          />
        );
      })}
      {/* ViewBox boundary - dashed rectangle to show tile bounds */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="#6366f1"
        strokeWidth="0.1"
        strokeDasharray="0.5 0.3"
        aria-label="Tile boundary"
      />
    </>
  );
}
