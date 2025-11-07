'use client';

import React from 'react';

interface HydrationSafeWrapperProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  [key: string]: any;
}

export function HydrationSafeWrapper({
  children,
  as: Component = 'div',
  className = '',
  ...props
}: HydrationSafeWrapperProps) {
  return (
    <Component
      className={className}
      suppressHydrationWarning={true}
      {...props}
    >
      {children}
    </Component>
  );
}

// Common wrapper components for frequently used patterns
export function SafeContainer({ children, className = '', ...props }: HydrationSafeWrapperProps) {
  return (
    <HydrationSafeWrapper className={className} {...props}>
      {children}
    </HydrationSafeWrapper>
  );
}

export function SafeCard({ children, className = '', ...props }: HydrationSafeWrapperProps) {
  return (
    <HydrationSafeWrapper
      className={`bg-white p-6 rounded-lg shadow ${className}`}
      {...props}
    >
      {children}
    </HydrationSafeWrapper>
  );
}

export function SafeGrid({ children, className = '', ...props }: HydrationSafeWrapperProps) {
  return (
    <HydrationSafeWrapper
      className={`grid ${className}`}
      {...props}
    >
      {children}
    </HydrationSafeWrapper>
  );
}