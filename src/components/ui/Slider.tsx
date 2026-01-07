import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelWidth?: string;
  displayValue?: string | number;
  suffix?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    { label, labelWidth = 'w-20', displayValue, suffix, className, id: providedId, ...props },
    ref
  ) => {
    const generatedId = useId();
    const sliderId = providedId || generatedId;

    return (
      <div className="flex items-center gap-2">
        {label && (
          <label htmlFor={sliderId} className={`text-xs text-gray-400 flex-shrink-0 ${labelWidth}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          className={`
            flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-400
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-400
            [&::-webkit-slider-thumb]:cursor-pointer
            ${className || ''}
          `}
          {...props}
        />
        {displayValue !== undefined && (
          <span className="text-xs text-gray-400 w-12 text-right">
            {displayValue}
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';
