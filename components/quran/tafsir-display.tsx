// Tafsir Display Component
// Displays tafsir (commentary) for an ayah

import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import type { TafsirResponse } from '@/types/quran-api';

interface TafsirDisplayProps {
  tafsir: TafsirResponse;
  className?: string;
}

export function TafsirDisplay({ tafsir, className }: TafsirDisplayProps) {
  return (
    <div className={className}>
      <Heading level={3} className="mb-4">
        Tafsir (Commentary)
      </Heading>
      <div className="space-y-4">
        {tafsir.tafsirs.map((tafsirItem, index) => (
          <Card key={index}>
            <div className="mb-2">
              <Heading level={4} className="mb-1">
                {tafsirItem.author}
              </Heading>
              {tafsirItem.groupVerse && (
                <Text className="text-sm text-gray-400 italic">
                  {tafsirItem.groupVerse}
                </Text>
              )}
            </div>
            <div
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{
                __html: tafsirItem.content
                  .replace(/\n/g, '<br />')
                  .replace(/## (.*)/g, '<h2 class="text-white text-xl font-semibold mt-4 mb-2">$1</h2>')
                  .replace(/### (.*)/g, '<h3 class="text-white text-lg font-semibold mt-3 mb-1">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'),
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
