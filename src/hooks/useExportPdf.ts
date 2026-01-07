import { useCallback, useState } from 'react';

import { exportToPdf } from '../lib/pdf';
import { useAppStore } from '../store';
import type { PaperSize } from '../types';

interface ExportPdfOptions {
  paperSize?: PaperSize;
}

interface UseExportPdfReturn {
  exportPdf: (options?: ExportPdfOptions) => Promise<void>;
  isExporting: boolean;
  error: Error | null;
  clearError: () => void;
}

/**
 * Hook to handle PDF export functionality
 */
export function useExportPdf(): UseExportPdfReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportPdf = useCallback(async (options: ExportPdfOptions = {}) => {
    setIsExporting(true);
    setError(null);

    try {
      const state = useAppStore.getState();
      const {
        svgContent,
        viewBox,
        tileSizeMm,
        rows,
        cols,
        rowOffset,
        finalSizeMm,
        sizeMode,
        unit,
        backgroundColor,
        threadColor,
        strokeWidthMm,
        stitchLengthMm,
        gapLengthMm,
        patternName,
        patternId,
      } = state;

      const paperSize = options.paperSize || 'A4';

      const pdfBytes = await exportToPdf({
        svgContent,
        viewBox,
        tileSizeMm,
        rows,
        cols,
        rowOffset,
        finalSizeMm,
        sizeMode,
        paperSize,
        unit,
        backgroundColor,
        threadColor,
        strokeWidthMm,
        stitchLengthMm,
        gapLengthMm,
        patternName,
        patternId: patternId || 'untitled',
      });

      // Download the PDF
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patternId || 'pattern'}-${rows}x${cols}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error('Export failed');
      setError(errorInstance);
      console.error('Error exporting PDF:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { exportPdf, isExporting, error, clearError };
}
