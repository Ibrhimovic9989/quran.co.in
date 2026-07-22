// Typography Components
// Reusable text components

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export function Text({ children, className, as: Component = 'p' }: TextProps) {
  return (
    <Component className={cn('text-white', className)}>{children}</Component>
  );
}

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({
  children,
  className,
  level = 2,
}: HeadingProps) {
  const baseClasses = 'text-white font-semibold';
  const levelClasses = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base',
  };

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <HeadingTag className={cn(baseClasses, levelClasses[level], className)}>
      {children}
    </HeadingTag>
  );
}
