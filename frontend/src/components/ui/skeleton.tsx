import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
}

const variantStyles = {
  text: 'rounded',
  circle: 'rounded-full',
  rectangle: 'rounded-lg',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantStyles[variant]} ${className}`}
        style={{
          width: width || (variant === 'circle' ? '40px' : '100%'),
          height: height || (variant === 'text' ? '16px' : variant === 'circle' ? '40px' : '200px'),
          ...style,
        }}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
