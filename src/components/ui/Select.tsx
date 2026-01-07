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
          <label
            htmlFor={selectId}
            className={`text-xs text-charcoal-500 dark:text-cream-400 flex-shrink-0 ${labelWidth}`}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-describedby={error ? `${selectId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={`
            text-xs bg-cream-100 text-charcoal-900 border rounded px-2 py-1
            dark:bg-charcoal-700 dark:text-cream-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
            ${error ? 'border-terracotta-500' : 'border-cream-300 dark:border-charcoal-600'}
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
          <span
            id={`${selectId}-error`}
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
Select.displayName = 'Select';
