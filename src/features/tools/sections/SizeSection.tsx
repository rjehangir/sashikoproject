import { Input, Select } from '../../../components/ui';
import { convert } from '../../../lib/units';
import { useAppStore } from '../../../store';

const unitOptions = [
  { value: 'mm', label: 'mm' },
  { value: 'in', label: 'in' },
];

const modeOptions = [
  { value: 'tile-size', label: 'Tile Size' },
  { value: 'final-size', label: 'Final Size' },
];

export function SizeSection() {
  const {
    unit,
    sizeMode,
    tileSizeMm,
    rows,
    cols,
    rowOffset,
    finalSizeMm,
    setUnit,
    setSizeMode,
    setTileSizeMm,
    setRows,
    setCols,
    setRowOffset,
    setFinalSizeMm,
  } = useAppStore((state) => ({
    unit: state.unit,
    sizeMode: state.sizeMode,
    tileSizeMm: state.tileSizeMm,
    rows: state.rows,
    cols: state.cols,
    rowOffset: state.rowOffset,
    finalSizeMm: state.finalSizeMm,
    setUnit: state.setUnit,
    setSizeMode: state.setSizeMode,
    setTileSizeMm: state.setTileSizeMm,
    setRows: state.setRows,
    setCols: state.setCols,
    setRowOffset: state.setRowOffset,
    setFinalSizeMm: state.setFinalSizeMm,
  }));

  const tileSizeDisplay = unit === 'mm' ? tileSizeMm : convert(tileSizeMm, 'mm', 'in');
  const finalSizeDisplay = finalSizeMm
    ? {
        width: unit === 'mm' ? finalSizeMm.width : convert(finalSizeMm.width, 'mm', 'in'),
        height: unit === 'mm' ? finalSizeMm.height : convert(finalSizeMm.height, 'mm', 'in'),
      }
    : null;

  const handleModeChange = (value: string) => {
    const newMode = value as 'tile-size' | 'final-size';
    setSizeMode(newMode);
    if (newMode === 'final-size' && !finalSizeMm) {
      const width = tileSizeMm * cols;
      const height = tileSizeMm * rows;
      setFinalSizeMm({ width, height });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Size</h3>
      <div className="space-y-2">
        <Select
          label="Unit:"
          options={unitOptions}
          value={unit}
          onChange={(e) => setUnit(e.target.value as 'mm' | 'in')}
        />
        <Select
          label="Mode:"
          options={modeOptions}
          value={sizeMode}
          onChange={(e) => handleModeChange(e.target.value)}
        />
        {sizeMode === 'tile-size' ? (
          <Input
            label="Tile Size:"
            type="number"
            value={tileSizeDisplay.toFixed(1)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                setTileSizeMm(unit === 'mm' ? val : convert(val, 'in', 'mm'));
              }
            }}
            step="0.1"
            suffix={unit}
            className="w-20"
          />
        ) : (
          <>
            <Input
              label="Width:"
              type="number"
              value={finalSizeDisplay?.width.toFixed(1) || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && finalSizeMm) {
                  setFinalSizeMm({
                    width: unit === 'mm' ? val : convert(val, 'in', 'mm'),
                    height: finalSizeMm.height,
                  });
                }
              }}
              step="0.1"
              suffix={unit}
              className="w-20"
            />
            <Input
              label="Height:"
              type="number"
              value={finalSizeDisplay?.height.toFixed(1) || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && finalSizeMm) {
                  setFinalSizeMm({
                    width: finalSizeMm.width,
                    height: unit === 'mm' ? val : convert(val, 'in', 'mm'),
                  });
                }
              }}
              step="0.1"
              suffix={unit}
              className="w-20"
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <Input
            label="Rows:"
            type="number"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            min={1}
            className="w-16"
          />
          <Input
            label="Cols:"
            labelWidth="w-auto"
            type="number"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
            min={1}
            className="w-16"
          />
        </div>
        <Input
          label="Row Offset:"
          type="number"
          value={(rowOffset * 100).toFixed(0)}
          onChange={(e) => setRowOffset((parseFloat(e.target.value) || 0) / 100)}
          min={0}
          max={100}
          step={5}
          suffix="%"
          className="w-16"
        />
      </div>
    </div>
  );
}
