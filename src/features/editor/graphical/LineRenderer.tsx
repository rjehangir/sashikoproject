import type { Line } from '../../../hooks/useDrawing';

interface LineRendererProps {
  lines: Line[];
  selectedLine: string | null;
  strokeWidth: number;
  strokeColor?: string;
}

export function LineRenderer({
  lines,
  selectedLine,
  strokeWidth,
  strokeColor = '#334e68',
}: LineRendererProps) {
  // Scale handle size relative to stroke width
  const handleRadius = Math.max(0.2, strokeWidth * 0.5);

  // Selection highlight color (indigo for selection)
  const selectionColor = '#6366f1';

  // Separate lines so selected line renders last (on top)
  const nonSelectedLines = lines.filter((line) => line.id !== selectedLine);
  const selectedLineData = lines.find((line) => line.id === selectedLine);
  const orderedLines = selectedLineData
    ? [...nonSelectedLines, selectedLineData]
    : nonSelectedLines;

  return (
    <>
      {orderedLines.map((line) => {
        const isSelected = selectedLine === line.id;
        return (
          <g key={line.id}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={isSelected ? selectionColor : strokeColor}
              strokeWidth={isSelected ? strokeWidth * 1.3 : strokeWidth}
              strokeLinecap="round"
            />
            {/* Start handle */}
            <circle
              cx={line.x1}
              cy={line.y1}
              r={handleRadius}
              fill={isSelected ? selectionColor : strokeColor}
              className="cursor-pointer"
              aria-label={`Start point of line ${line.id}`}
            />
            {/* End handle */}
            <circle
              cx={line.x2}
              cy={line.y2}
              r={handleRadius}
              fill={isSelected ? selectionColor : strokeColor}
              className="cursor-pointer"
              aria-label={`End point of line ${line.id}`}
            />
          </g>
        );
      })}
    </>
  );
}
