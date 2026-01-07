import { Button } from '../../../components/ui';
import { useExportPdf, useFileImport } from '../../../hooks';

interface ExportSectionProps {
  onShowLibrary: () => void;
}

export function ExportSection({ onShowLibrary }: ExportSectionProps) {
  const { exportPdf, isExporting } = useExportPdf();
  const { importJson, importSvg, exportJson } = useFileImport();

  return (
    <div>
      <h3 className="text-sm font-semibold text-charcoal-700 dark:text-cream-200 mb-2">
        Export/Import
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => exportPdf()}
          disabled={isExporting}
          aria-label="Export pattern as PDF"
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={exportJson}
          aria-label="Export pattern as JSON"
        >
          Export JSON
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={importJson}
          aria-label="Import pattern from JSON file"
        >
          Import JSON
        </Button>
        <Button variant="secondary" size="md" onClick={importSvg} aria-label="Import SVG file">
          Import SVG
        </Button>
        <Button variant="ghost" size="md" onClick={onShowLibrary} aria-label="Open pattern library">
          Library
        </Button>
      </div>
    </div>
  );
}
