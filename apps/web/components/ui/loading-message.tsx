// Loading Message Component
// Displays meaningful Islamic content during loading states
// Follows Atomic Design - Molecule component

'use client';

import { useState } from 'react';
import { Text, Heading } from './typography';
import { getRandomLoadingMessage, type LoadingMessage } from '@/lib/data/loading-messages';
import { BookOpen, Heart, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingMessageProps {
  className?: string;
  showIcon?: boolean;
}

const typeIcons = {
  quran: BookOpen,
  istighfar: Heart,
  dua: Sparkles,
  reminder: Lightbulb,
};

// Pastel tints carry the category; the ink stays quiet.
const typeColors = {
  quran: 'bg-tint-sky text-accent-strong',
  istighfar: 'bg-tint-sage text-accent-strong',
  dua: 'bg-tint-lavender text-ink-soft',
  reminder: 'bg-tint-sun text-gold-text',
};

export function LoadingMessage({ className, showIcon = true }: LoadingMessageProps) {
  const [message] = useState<LoadingMessage>(() => getRandomLoadingMessage());

  const Icon = typeIcons[message.type];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center max-w-2xl mx-auto px-4", className)}>
      {showIcon && Icon && (
        <div className={cn('grid h-11 w-11 place-items-center rounded-full', typeColors[message.type])}>
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
      )}
      <div className="space-y-2">
        <Text className="text-[15px] md:text-base leading-[1.75] text-ink-soft">
          "{message.text}"
        </Text>
        <Text className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          — {message.source}
        </Text>
      </div>
    </div>
  );
}
