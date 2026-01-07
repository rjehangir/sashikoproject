import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 dark:focus-visible:ring-offset-charcoal-900 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary action - indigo
        primary:
          'bg-indigo-700 text-cream-50 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500',
        // Secondary action - neutral
        secondary:
          'bg-cream-200 text-charcoal-800 hover:bg-cream-300 dark:bg-charcoal-700 dark:text-cream-200 dark:hover:bg-charcoal-600',
        // Danger/destructive action - terracotta
        danger:
          'bg-terracotta-400 text-cream-50 hover:bg-terracotta-500 dark:bg-terracotta-400 dark:hover:bg-terracotta-300',
        // Success action - sage
        success:
          'bg-sage-500 text-cream-50 hover:bg-sage-600 dark:bg-sage-400 dark:hover:bg-sage-500',
        // Ghost - transparent until hover
        ghost:
          'text-charcoal-700 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-charcoal-700',
        // Outline - border only
        outline:
          'border-2 border-indigo-700 text-indigo-700 hover:bg-indigo-700 hover:text-cream-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-cream-50',
        // Subtle variants using the palette
        violet:
          'bg-indigo-200 text-indigo-900 hover:bg-indigo-300 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800',
        slate:
          'bg-charcoal-400 text-cream-50 hover:bg-charcoal-500 dark:bg-charcoal-600 dark:hover:bg-charcoal-500',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { buttonVariants };
