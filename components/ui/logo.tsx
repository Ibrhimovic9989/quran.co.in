// Logo Component
// Displays the Quran.co.in logo with different variants

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  variant?: 'full' | 'icon';
  dark?: boolean;
  className?: string;
  href?: string;
  showText?: boolean;
}

export function Logo({ 
  variant = 'full', 
  dark = false, 
  className,
  href = '/',
  showText = true
}: LogoProps) {
  const logoSrc = '/logo.png';

  const content = (
    <div className={cn('flex items-center', className)}>
      <img
        src={logoSrc}
        alt="Quran.co.in"
        className={cn(
          variant === 'icon'
            ? 'h-12 w-12 md:h-14 md:w-14'
            : 'h-12 w-auto md:h-14'
        )}
      />
      {!showText && variant === 'icon' && (
        <span className="ml-2 text-base md:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Quran.co.in
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
