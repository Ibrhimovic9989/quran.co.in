// Card Component
// Reusable card component

import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-lg p-6 shadow-sm',
        onClick && 'cursor-pointer hover:border-line hover:shadow-md transition-all',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
