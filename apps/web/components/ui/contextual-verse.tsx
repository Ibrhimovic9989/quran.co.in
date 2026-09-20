// Contextual Verse Component
// Displays relevant Quranic verses and reminders contextually
// Follows Atomic Design - Molecule component

'use client';

import { useEffect, useState } from 'react';
import { Text, Heading } from './typography';
import { getVerseForContext, type HomePageVerse } from '@/lib/data/home-page-verses';
import { BookOpen, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ContextualVerseProps {
  context: HomePageVerse['context'];
  className?: string;
  variant?: 'subtle' | 'prominent' | 'minimal';
  showIcon?: boolean;
}

const typeIcons = {
  quran: BookOpen,
  hadith: Sparkles,
  reminder: Lightbulb,
};

const variantStyles = {
  subtle: 'bg-surface border border-line',
  prominent: 'bg-tint-sky border border-line',
  minimal: 'bg-transparent border-0',
};

export function ContextualVerse({ 
  context, 
  className,
  variant = 'subtle',
  showIcon = true 
}: ContextualVerseProps) {
  const [verse, setVerse] = useState<HomePageVerse | undefined>(undefined);

  useEffect(() => {
    // Get a random verse for this context
    const contextVerse = getVerseForContext(context);
    setVerse(contextVerse);
  }, [context]);

  if (!verse) return null;

  const Icon = typeIcons[verse.type];

  return (
    <div className={cn(
      'rounded-2xl p-4 md:p-6 transition-all duration-300',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start gap-4">
        {showIcon && Icon && (
          <div className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full',
            variant === 'prominent'
              ? 'bg-surface text-accent'
              : 'bg-accent-soft text-accent-strong'
          )}>
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          {verse.arabic && (
            <Text className="text-right text-lg md:text-xl font-arabic leading-relaxed text-ink">
              {verse.arabic}
            </Text>
          )}
          
          <Text className={cn(
            'leading-[1.75]',
            variant === 'prominent'
              ? 'text-ink text-[15px] md:text-base'
              : 'text-ink-soft text-[13px] md:text-[15px]'
          )}>
            "{verse.text}"
          </Text>
          
          <Text className={cn(
            'text-[11px] font-medium uppercase tracking-[0.14em]',
            variant === 'prominent'
              ? 'text-accent-strong'
              : 'text-ink-muted'
          )}>
            — {verse.source}
          </Text>
        </div>
      </div>
    </div>
  );
}
