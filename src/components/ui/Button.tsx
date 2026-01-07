import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-300 text-gray-800 hover:bg-blue-400',
        secondary: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        danger: 'bg-rose-300 text-gray-800 hover:bg-rose-400',
        ghost: 'hover:bg-gray-700 text-gray-300',
        pink: 'bg-pink-300 text-gray-800 hover:bg-pink-400',
        purple: 'bg-purple-300 text-gray-800 hover:bg-purple-400',
        violet: 'bg-violet-300 text-gray-800 hover:bg-violet-400',
        cyan: 'bg-cyan-300 text-gray-800 hover:bg-cyan-400',
        slate: 'bg-slate-300 text-gray-800 hover:bg-slate-400',
        fuchsia: 'bg-fuchsia-300 text-gray-800 hover:bg-fuchsia-400',
        emerald: 'bg-emerald-300 text-gray-800 hover:bg-emerald-400',
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
