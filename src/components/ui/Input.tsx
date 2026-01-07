import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelWidth?: string;
  suffix?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelWidth = 'w-20', suffix, error, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;

    return (
      <div className="flex items-center gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-xs text-charcoal-500 dark:text-cream-400 flex-shrink-0 ${labelWidth}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={`
            w-full text-xs bg-cream-100 text-charcoal-900 border rounded px-2 py-1
            dark:bg-charcoal-700 dark:text-cream-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
            ${error ? 'border-terracotta-500' : 'border-cream-300 dark:border-charcoal-600'}
            ${className || ''}
          `}
          {...props}
        />
        {suffix && (
          <span className="text-xs text-charcoal-500 dark:text-cream-400 flex-shrink-0">
            {suffix}
          </span>
        )}
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-xs text-terracotta-500 dark:text-terracotta-300"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
