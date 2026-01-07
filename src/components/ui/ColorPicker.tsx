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
          <label htmlFor={colorId} className={`text-xs text-gray-400 flex-shrink-0 ${labelWidth}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={colorId}
          type="color"
          aria-label={label || 'Color picker'}
          className={`
            w-12 h-8 border border-gray-600 rounded cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-gray-900
            ${className || ''}
          `}
          {...props}
        />
      </div>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';
