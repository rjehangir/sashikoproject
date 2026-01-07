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
          <label
            htmlFor={sliderId}
            className={`text-xs text-charcoal-500 dark:text-cream-400 flex-shrink-0 ${labelWidth}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          className={`
            flex-1 h-2 bg-cream-200 dark:bg-charcoal-700 rounded-lg appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-indigo-600
            [&::-webkit-slider-thumb]:dark:bg-indigo-400
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:hover:bg-indigo-700
            [&::-webkit-slider-thumb]:dark:hover:bg-indigo-300
            ${className || ''}
          `}
          {...props}
        />
        {displayValue !== undefined && (
          <span className="text-xs text-charcoal-500 dark:text-cream-400 w-12 text-right">
            {displayValue}
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';
