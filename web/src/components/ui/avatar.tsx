import * as React from 'react';
import { cn } from '@/lib/utils';

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof avatarSizes;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = '', fallback, size = 'md', className, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setHasError(false);
    }, [src]);

    const showImage = src && !hasError;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full overflow-hidden bg-background-tertiary flex items-center justify-center shrink-0',
          avatarSizes[size],
          className,
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="text-foreground-muted font-medium select-none">
            {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

export { Avatar, avatarSizes };
