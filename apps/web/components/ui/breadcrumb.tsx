// Breadcrumb Navigation Component

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm text-muted', className)}>
      <Link
        href="/"
        className="flex items-center text-muted hover:text-ink-soft transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-ink-soft transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-soft font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
