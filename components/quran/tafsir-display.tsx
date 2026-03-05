// Tafsir Display Component
// Displays tafsir (commentary) for an ayah with author selector

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import type { TafsirResponse } from '@/types/quran-api';

interface TafsirDisplayProps {
  tafsir: TafsirResponse;
  className?: string;
}

export function TafsirDisplay({ tafsir, className }: TafsirDisplayProps) {
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(
    tafsir.tafsirs.length > 0 ? tafsir.tafsirs[0].author : null
  );

  const selectedTafsir = tafsir.tafsirs.find((t) => t.author === selectedAuthor) || tafsir.tafsirs[0];

  if (!selectedTafsir) return null;

  return (
    <div className={className}>
      <Heading level={3} className="mb-4">
        Tafsir (Commentary)
      </Heading>

      {/* Author Selector */}
      {tafsir.tafsirs.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedAuthor || ''}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-white"
          >
            {tafsir.tafsirs.map((tafsirItem, index) => (
              <option key={index} value={tafsirItem.author}>
                {tafsirItem.author}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Tafsir */}
      <Card>
        <div className="mb-2">
          <Heading level={4} className="mb-1">
            {selectedTafsir.author}
          </Heading>
          {selectedTafsir.groupVerse && (
            <Text className="text-sm text-gray-400 italic">
              {selectedTafsir.groupVerse}
            </Text>
          )}
        </div>
        <div
          className="prose prose-invert max-w-none text-gray-300"
          dangerouslySetInnerHTML={{
            __html: selectedTafsir.content
              .replace(/\n/g, '<br />')
              .replace(/## (.*)/g, '<h2 class="text-white text-xl font-semibold mt-4 mb-2">$1</h2>')
              .replace(/### (.*)/g, '<h3 class="text-white text-lg font-semibold mt-3 mb-1">$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'),
          }}
        />
      </Card>
    </div>
  );
}
