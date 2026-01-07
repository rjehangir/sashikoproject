import type { PartialLine } from '../../../hooks/useDrawing';

interface DrawingLineProps {
  line: PartialLine;
  strokeWidth: number;
}

export function DrawingLine({ line, strokeWidth }: DrawingLineProps) {
  if (line.x2 === undefined || line.y2 === undefined) {
    return null;
  }

  return (
    <line
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      stroke="#60a5fa"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={0.8}
      aria-hidden="true"
    />
  );
}
