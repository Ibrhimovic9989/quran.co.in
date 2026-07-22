// Section Divider Component
// Natural section transitions with contextual verses
// Follows Atomic Design - Molecule component

'use client';

import { useEffect, useState } from 'react';
import { Text } from './typography';
import { getVerseForContext, type HomePageVerse } from '@/lib/data/home-page-verses';
import { cn } from '@/lib/utils/cn';

interface SectionDividerProps {
  context: HomePageVerse['context'];
  className?: string;
}

export function SectionDivider({ context, className }: SectionDividerProps) {
  const [verse, setVerse] = useState<HomePageVerse | undefined>(undefined);

  useEffect(() => {
    const contextVerse = getVerseForContext(context);
    setVerse(contextVerse);
  }, [context]);

  if (!verse) return null;

  return (
    <div className={cn('py-12 md:py-16 text-center border-t border-b border-gray-200 my-12 md:my-16', className)}>
      <div className="max-w-3xl mx-auto px-4">
        {verse.arabic && (
          <Text className="text-2xl md:text-3xl font-arabic text-gray-900 mb-4 leading-relaxed">
            {verse.arabic}
          </Text>
        )}
        <Text className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-2">
          "{verse.text}"
        </Text>
        <Text className="text-sm text-gray-600 font-medium">
          — {verse.source}
        </Text>
      </div>
    </div>
  );
}
