import { ColorPicker, Checkbox } from '../../../components/ui';
import { useAppStore } from '../../../store';

export function ColorSection() {
  const {
    backgroundColor,
    threadColor,
    showGrid,
    setBackgroundColor,
    setThreadColor,
    setShowGrid,
  } = useAppStore((state) => ({
    backgroundColor: state.backgroundColor,
    threadColor: state.threadColor,
    showGrid: state.showGrid,
    setBackgroundColor: state.setBackgroundColor,
    setThreadColor: state.setThreadColor,
    setShowGrid: state.setShowGrid,
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Colors</h3>
      <div className="space-y-2">
        <ColorPicker
          label="Background:"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
        <ColorPicker
          label="Thread:"
          value={threadColor}
          onChange={(e) => setThreadColor(e.target.value)}
        />
        <Checkbox
          label="Show Grid"
          checked={showGrid}
          onChange={(e) => setShowGrid(e.target.checked)}
        />
      </div>
    </div>
  );
}
