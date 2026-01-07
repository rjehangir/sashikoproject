import { forwardRef, type SelectHTMLAttributes, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  labelWidth?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, labelWidth = 'w-20', options, error, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;

    return (
      <div className="flex items-center gap-2">
        {label && (
          <label htmlFor={selectId} className={`text-xs text-gray-400 flex-shrink-0 ${labelWidth}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-describedby={error ? `${selectId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={`
            text-xs bg-gray-700 text-gray-200 border rounded px-2 py-1
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
            ${error ? 'border-rose-500' : 'border-gray-600'}
            ${className || ''}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={`${selectId}-error`} className="text-xs text-rose-400" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
