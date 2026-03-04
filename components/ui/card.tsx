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
        'bg-gray-900 border border-gray-800 rounded-lg p-6',
        onClick && 'cursor-pointer hover:border-gray-700 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
