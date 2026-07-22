// Tafsir Display Component
// Displays tafsir (commentary) for an ayah with author selector
// Improved typography, Arabic text handling, and content formatting

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Select } from '@/components/ui/atoms';
import { TafsirContent } from './tafsir-content';
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
      {/* Header Section - Gestalt: Grouped together (Proximity) */}
      <div className="mb-6">
        <Heading level={3} className="mb-4">
          Tafsir (Commentary)
        </Heading>

        {/* Author Selector - Using Select atom */}
        {tafsir.tafsirs.length > 1 && (
          <div className="mb-4">
            <Select
              value={selectedAuthor || ''}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              options={tafsir.tafsirs.map((tafsirItem) => ({
                value: tafsirItem.author,
                label: tafsirItem.author,
              }))}
              className="max-w-md"
            />
          </div>
        )}
      </div>

      {/* Selected Tafsir Content */}
      <Card className="overflow-hidden">
        {/* Author Header Section */}
        <div className="mb-6 pb-4 border-b border-gray-800">
          <Heading level={4} className="mb-2 text-white">
            {selectedTafsir.author}
          </Heading>
          {selectedTafsir.groupVerse && (
            <Text className="text-sm text-gray-400 italic leading-relaxed">
              {selectedTafsir.groupVerse}
            </Text>
          )}
        </div>

        {/* Tafsir Content - Improved formatting */}
        <div className="prose prose-invert max-w-none">
          <TafsirContent 
            content={selectedTafsir.content}
            className="text-base leading-relaxed"
          />
        </div>
      </Card>
    </div>
  );
}
