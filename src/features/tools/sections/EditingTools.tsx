import { Button } from '../../../components/ui';
import { useSvgTransform } from '../../../hooks';

export function EditingTools() {
  const { mirrorH, mirrorV, rotate, snap } = useSvgTransform();

  return (
    <div>
      <h3 className="text-sm font-semibold text-charcoal-700 dark:text-cream-200 mb-2">
        Editing Tools
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={mirrorH}
          aria-label="Mirror pattern horizontally"
        >
          Mirror H
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={mirrorV}
          aria-label="Mirror pattern vertically"
        >
          Mirror V
        </Button>
        <Button variant="primary" size="md" onClick={rotate} aria-label="Rotate pattern 90 degrees">
          Rotate 90°
        </Button>
        <Button variant="secondary" size="md" onClick={snap} aria-label="Snap pattern to grid">
          Snap Grid
        </Button>
      </div>
    </div>
  );
}
