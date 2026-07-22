'use client';

import { BookOpenText, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type SurahDisplayMode = 'verse' | 'reading';

interface SurahViewModeToggleProps {
  mode: SurahDisplayMode;
  onModeChange: (mode: SurahDisplayMode) => void;
  className?: string;
}

const modes: Array<{
  id: SurahDisplayMode;
  label: string;
  icon: typeof Rows3;
}> = [
  {
    id: 'verse',
    label: 'Verse by Verse',
    icon: Rows3,
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: BookOpenText,
  },
];

export function SurahViewModeToggle({
  mode,
  onModeChange,
  className,
}: SurahViewModeToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-2xl border border-gray-200 bg-gray-100/90 p-1 shadow-sm',
        className
      )}
      role="tablist"
      aria-label="Surah display mode"
    >
      {modes.map((item) => {
        const Icon = item.icon;
        const isActive = mode === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors md:gap-2 md:px-4 md:text-sm',
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
