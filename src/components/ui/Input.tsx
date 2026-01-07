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
          <label htmlFor={inputId} className={`text-xs text-gray-400 flex-shrink-0 ${labelWidth}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={`
            w-full text-xs bg-gray-700 text-gray-200 border rounded px-2 py-1
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
            ${error ? 'border-rose-500' : 'border-gray-600'}
            ${className || ''}
          `}
          {...props}
        />
        {suffix && <span className="text-xs text-gray-400 flex-shrink-0">{suffix}</span>}
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-rose-400" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
