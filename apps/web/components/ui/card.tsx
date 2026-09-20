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
        // Calm card: hairline border, generous radius, no shadow at rest
        'bg-surface border border-line rounded-2xl p-5',
        onClick && 'cursor-pointer transition-all hover:border-accent/30 hover:shadow-card',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
