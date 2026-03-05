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
  subtle: 'bg-gray-50 border border-gray-200',
  prominent: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
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
      'rounded-lg p-4 md:p-6 transition-all duration-300',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start gap-4">
        {showIcon && Icon && (
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            variant === 'prominent' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          {verse.arabic && (
            <Text className="text-right text-lg md:text-xl font-arabic leading-relaxed text-gray-900">
              {verse.arabic}
            </Text>
          )}
          
          <Text className={cn(
            'leading-relaxed',
            variant === 'prominent' 
              ? 'text-gray-800 text-base md:text-lg italic' 
              : 'text-gray-700 text-sm md:text-base'
          )}>
            "{verse.text}"
          </Text>
          
          <Text className={cn(
            'text-xs md:text-sm font-medium',
            variant === 'prominent' 
              ? 'text-blue-700' 
              : 'text-gray-600'
          )}>
            — {verse.source}
          </Text>
        </div>
      </div>
    </div>
  );
}
