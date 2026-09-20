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
    <Component className={cn('text-ink', className)}>{children}</Component>
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
  const baseClasses = 'font-heading text-ink font-semibold tracking-[-0.025em]';
  const levelClasses = {
    1: 'text-3xl md:text-4xl leading-tight',
    2: 'text-2xl md:text-3xl leading-tight',
    3: 'text-xl leading-snug',
    4: 'text-lg leading-snug',
    5: 'text-base leading-snug',
    6: 'text-sm leading-snug',
  };

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <HeadingTag className={cn(baseClasses, levelClasses[level], className)}>
      {children}
    </HeadingTag>
  );
}
