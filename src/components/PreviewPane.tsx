import { useMemo } from 'react';

import { useExportPdf, useViewBox } from '../hooks';
import { applyThreadStyle } from '../lib/svg';
import { useAppStore } from '../store';

import { Button, Select } from './ui';

const scaleOptions = [
  { value: 'fit', label: 'Zoom to Fit' },
  { value: 'real-size', label: 'Real Size' },
];

export default function PreviewPane() {
  const {
    svgContent,
    viewBox,
    backgroundColor,
    threadColor,
    showGrid,
    tileSizeMm,
    rows,
    cols,
    rowOffset,
    unit,
    sizeMode,
    finalSizeMm,
    stitchLengthMm,
    gapLengthMm,
    strokeWidthMm,
    previewDpi,
    previewScaleMode,
    setPreviewScaleMode,
  } = useAppStore();

  const { exportPdf, isExporting } = useExportPdf();

  // Parse viewBox
  const viewBoxDimensions = useViewBox(viewBox);
  const viewBoxWidth = viewBoxDimensions?.width ?? 10;

  // Calculate actual tile size
  const actualTileSizeMm = useMemo(() => {
    if (sizeMode === 'final-size' && finalSizeMm) {
      return Math.min(finalSizeMm.width / cols, finalSizeMm.height / rows);
    }
    return tileSizeMm;
  }, [sizeMode, finalSizeMm, cols, rows, tileSizeMm]);

  // Calculate pattern dimensions (bounding box)
  const patternWidthMm = useMemo(() => {
    if (sizeMode === 'final-size' && finalSizeMm) {
      return finalSizeMm.width;
    }
    return actualTileSizeMm * cols + (rowOffset > 0 ? actualTileSizeMm * rowOffset : 0);
  }, [sizeMode, finalSizeMm, actualTileSizeMm, cols, rowOffset]);

  const patternHeightMm = useMemo(() => {
    if (sizeMode === 'final-size' && finalSizeMm) {
      return finalSizeMm.height;
    }
    return actualTileSizeMm * rows;
  }, [sizeMode, finalSizeMm, actualTileSizeMm, rows]);

  // Convert to pixels for preview
  const pixelsPerMm = previewDpi / 25.4;
  const tileSizePx = actualTileSizeMm * pixelsPerMm;
  const patternWidthPx = patternWidthMm * pixelsPerMm;
  const patternHeightPx = patternHeightMm * pixelsPerMm;

  // Apply thread styling to SVG
  const styledSvg = useMemo(() => {
    try {
      return applyThreadStyle(svgContent, {
        strokeColor: threadColor,
        strokeWidthMm,
        stitchLengthMm,
        gapLengthMm,
        viewBox,
      });
    } catch {
      return svgContent;
    }
  }, [svgContent, threadColor, strokeWidthMm, stitchLengthMm, gapLengthMm, viewBox]);

  // Parse and prepare tile content
  const tileContent = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(styledSvg, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return null;

      const innerHtml = Array.from(svg.children)
        .map((child) => new XMLSerializer().serializeToString(child))
        .join('');

      return innerHtml;
    } catch {
      return null;
    }
  }, [styledSvg]);

  // Scale factor from viewBox to tile pixels
  const tileScale = tileSizePx / viewBoxWidth;

  return (
    <div className="flex flex-col h-full bg-cream-50 text-charcoal-900 dark:bg-charcoal-900 dark:text-cream-100">
      <div className="px-4 py-2 border-b border-cream-200 bg-cream-100 dark:border-charcoal-700 dark:bg-charcoal-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900 dark:text-cream-50">
              Live Preview
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-cream-400">
              {patternWidthMm.toFixed(1)} × {patternHeightMm.toFixed(1)} {unit} ({rows} × {cols}{' '}
              tiles, {actualTileSizeMm.toFixed(1)} {unit} each)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              label="Scale:"
              options={scaleOptions}
              value={previewScaleMode}
              onChange={(e) => setPreviewScaleMode(e.target.value as 'fit' | 'real-size')}
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => exportPdf()}
              disabled={isExporting}
              aria-label="Export pattern as PDF"
            >
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-4 flex items-center justify-center bg-cream-200 dark:bg-charcoal-900"
        role="img"
        aria-label={`Preview of ${rows} by ${cols} tile pattern at ${patternWidthMm.toFixed(1)} by ${patternHeightMm.toFixed(1)} ${unit}`}
      >
        <div
          className="shadow-lg"
          style={
            previewScaleMode === 'fit'
              ? { maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%' }
              : { width: `${patternWidthPx}px`, height: `${patternHeightPx}px` }
          }
        >
          <svg
            width={previewScaleMode === 'real-size' ? patternWidthPx : undefined}
            height={previewScaleMode === 'real-size' ? patternHeightPx : undefined}
            viewBox={`0 0 ${patternWidthPx} ${patternHeightPx}`}
            preserveAspectRatio={previewScaleMode === 'fit' ? 'xMidYMid meet' : 'none'}
            style={{
              backgroundColor,
              width: previewScaleMode === 'fit' ? '100%' : undefined,
              height: previewScaleMode === 'fit' ? '100%' : undefined,
              maxWidth: previewScaleMode === 'fit' ? '100%' : undefined,
              maxHeight: previewScaleMode === 'fit' ? '100%' : undefined,
            }}
          >
            <defs>
              {showGrid && (
                <pattern
                  id="gridPattern"
                  patternUnits="userSpaceOnUse"
                  width={tileSizePx}
                  height={tileSizePx}
                >
                  <rect
                    width={tileSizePx}
                    height={tileSizePx}
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={tileSizePx / 2}
                    y1="0"
                    x2={tileSizePx / 2}
                    y2={tileSizePx}
                    stroke="#ddd"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="0"
                    y1={tileSizePx / 2}
                    x2={tileSizePx}
                    y2={tileSizePx / 2}
                    stroke="#ddd"
                    strokeWidth="0.5"
                  />
                </pattern>
              )}
            </defs>
            <rect width={patternWidthPx} height={patternHeightPx} fill={backgroundColor} />
            {/* Render tiles with row offset */}
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const rowOffsetPx = rowOffset > 0 && rowIndex % 2 === 1 ? tileSizePx * rowOffset : 0;
              const y = rowIndex * tileSizePx;

              return Array.from({ length: cols }).map((_, colIndex) => {
                const x = colIndex * tileSizePx + rowOffsetPx;

                return (
                  <g key={`tile-${rowIndex}-${colIndex}`} transform={`translate(${x}, ${y})`}>
                    {showGrid && (
                      <rect
                        width={tileSizePx}
                        height={tileSizePx}
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="0.5"
                      />
                    )}
                    <g
                      transform={`scale(${tileScale})`}
                      dangerouslySetInnerHTML={{ __html: tileContent || '' }}
                    />
                  </g>
                );
              });
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
