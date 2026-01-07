import { Input } from '../../../components/ui';
import { useAppStore } from '../../../store';

export function StitchSection() {
  const {
    stitchLengthMm,
    gapLengthMm,
    strokeWidthMm,
    setStitchLengthMm,
    setGapLengthMm,
    setStrokeWidthMm,
  } = useAppStore((state) => ({
    stitchLengthMm: state.stitchLengthMm,
    gapLengthMm: state.gapLengthMm,
    strokeWidthMm: state.strokeWidthMm,
    setStitchLengthMm: state.setStitchLengthMm,
    setGapLengthMm: state.setGapLengthMm,
    setStrokeWidthMm: state.setStrokeWidthMm,
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Stitch Settings</h3>
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Stitch:"
          type="number"
          value={stitchLengthMm.toFixed(1)}
          onChange={(e) => setStitchLengthMm(parseFloat(e.target.value) || 0)}
          step={0.1}
          min={0.1}
          suffix="mm"
          className="w-16"
        />
        <Input
          label="Gap:"
          type="number"
          value={gapLengthMm.toFixed(1)}
          onChange={(e) => setGapLengthMm(parseFloat(e.target.value) || 0)}
          step={0.1}
          min={0.1}
          suffix="mm"
          className="w-16"
        />
        <Input
          label="Width:"
          type="number"
          value={strokeWidthMm.toFixed(1)}
          onChange={(e) => setStrokeWidthMm(parseFloat(e.target.value) || 0)}
          step={0.1}
          min={0.1}
          suffix="mm"
          className="w-16"
        />
      </div>
    </div>
  );
}
