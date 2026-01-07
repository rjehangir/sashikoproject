import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = providedId || generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={`flex items-center gap-2 text-xs text-charcoal-600 dark:text-cream-300 cursor-pointer ${className || ''}`}
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="
            w-4 h-4 rounded border-cream-300 dark:border-charcoal-600 
            bg-cream-100 dark:bg-charcoal-700 
            text-indigo-600 dark:text-indigo-400
            focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 
            focus:ring-offset-cream-50 dark:focus:ring-offset-charcoal-900
          "
          {...props}
        />
        {label}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
