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
        className={`flex items-center gap-2 text-xs text-gray-400 cursor-pointer ${className || ''}`}
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="
            w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-400
            focus:ring-2 focus:ring-blue-400 focus:ring-offset-gray-900
          "
          {...props}
        />
        {label}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
