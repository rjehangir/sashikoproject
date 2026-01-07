import { useCallback, useState } from 'react';

import { importPattern, createPatternFromSvg, exportPattern } from '../lib/patterns';
import { useAppStore } from '../store';

interface UseFileImportReturn {
  importJson: () => void;
  importSvg: () => void;
  exportJson: () => void;
  isImporting: boolean;
  error: Error | null;
  clearError: () => void;
}

/**
 * Hook to handle file import and export functionality
 */
export function useFileImport(): UseFileImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            const pattern = importPattern(text);
            if (pattern) {
              useAppStore.getState().loadPattern(pattern);
            } else {
              setError(new Error('Failed to parse pattern file'));
            }
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Import failed'));
          } finally {
            setIsImporting(false);
          }
        };
        reader.onerror = () => {
          setError(new Error('Failed to read file'));
          setIsImporting(false);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const importSvg = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            useAppStore.getState().setSvgContent(text);
            // Try to extract viewBox
            const vbMatch = text.match(/viewBox=["']([^"']+)["']/);
            if (vbMatch?.[1]) {
              useAppStore.getState().setViewBox(vbMatch[1]);
            }
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Import failed'));
          } finally {
            setIsImporting(false);
          }
        };
        reader.onerror = () => {
          setError(new Error('Failed to read file'));
          setIsImporting(false);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const exportJson = useCallback(() => {
    try {
      const state = useAppStore.getState();
      const {
        svgContent,
        viewBox,
        stitchLengthMm,
        gapLengthMm,
        strokeWidthMm,
        snapGridMm,
        patternId,
        patternName,
        patternAuthor,
      } = state;

      const pattern = createPatternFromSvg(
        svgContent,
        viewBox,
        {
          stitchLengthMm,
          gapLengthMm,
          strokeWidthMm,
          snapGridMm,
        },
        {
          id: patternId || 'untitled-pattern',
          name: patternName,
          author: patternAuthor,
          license: 'CC BY 4.0',
        }
      );
      const json = exportPattern(pattern);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pattern.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Export failed'));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { importJson, importSvg, exportJson, isImporting, error, clearError };
}
