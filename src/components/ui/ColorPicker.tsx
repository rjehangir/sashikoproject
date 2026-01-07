import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelWidth?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, labelWidth = 'w-20', className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const colorId = providedId || generatedId;

    return (
      <div className="flex items-center gap-2">
        {label && (
          <label
            htmlFor={colorId}
            className={`text-xs text-charcoal-500 dark:text-cream-400 flex-shrink-0 ${labelWidth}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={colorId}
          type="color"
          aria-label={label || 'Color picker'}
          className={`
            w-12 h-8 border border-cream-300 dark:border-charcoal-600 rounded cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-cream-50 dark:focus:ring-offset-charcoal-900
            ${className || ''}
          `}
          {...props}
        />
      </div>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';
