import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-lg bg-background-secondary border border-border px-4 py-2.5 text-sm text-foreground',
        'placeholder:text-foreground-muted',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export { Input };
