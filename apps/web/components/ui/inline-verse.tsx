// Inline Verse Component
// Subtle, natural integration of verses into content flow
// Follows Atomic Design - Molecule component

'use client';

import { useEffect, useState } from 'react';
import { Text } from './typography';
import { getVerseForContext, type HomePageVerse } from '@/lib/data/home-page-verses';
import { cn } from '@/lib/utils/cn';

interface InlineVerseProps {
  context: HomePageVerse['context'];
  className?: string;
  style?: 'quote' | 'divider' | 'inline';
}

export function InlineVerse({ 
  context, 
  className,
  style = 'quote'
}: InlineVerseProps) {
  const [verse, setVerse] = useState<HomePageVerse | undefined>(undefined);

  useEffect(() => {
    const contextVerse = getVerseForContext(context);
    setVerse(contextVerse);
  }, [context]);

  if (!verse) return null;

  if (style === 'divider') {
    return (
      <div className={cn('my-12 md:my-16 text-center', className)}>
        <div className="max-w-3xl mx-auto">
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

  if (style === 'inline') {
    return (
      <div className={cn('my-6', className)}>
        <Text className="text-base md:text-lg text-gray-700 italic leading-relaxed">
          "{verse.text}" <span className="text-sm text-gray-600 not-italic">— {verse.source}</span>
        </Text>
      </div>
    );
  }

  // Default: quote style
  return (
    <div className={cn('my-8 md:my-12', className)}>
      <div className="max-w-2xl mx-auto border-l-4 border-gray-300 pl-6 py-2">
        {verse.arabic && (
          <Text className="text-xl md:text-2xl font-arabic text-gray-900 mb-3 leading-relaxed text-right">
            {verse.arabic}
          </Text>
        )}
        <Text className="text-base md:text-lg text-gray-700 italic leading-relaxed mb-2">
          "{verse.text}"
        </Text>
        <Text className="text-sm text-gray-600 font-medium">
          — {verse.source}
        </Text>
      </div>
    </div>
  );
}
