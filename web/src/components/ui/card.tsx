import * as React from 'react';
import { cn } from '@/lib/utils';

// Komponen Card utama
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl bg-card border border-border p-6',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

// Header kartu
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 pb-4', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

// Judul kartu
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props}>
      {children}
    </h3>
  ),
);
CardTitle.displayName = 'CardTitle';

// Deskripsi kartu
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-foreground-muted', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

// Konten kartu
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
