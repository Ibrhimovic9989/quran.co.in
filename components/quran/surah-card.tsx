// Surah Card Component
// Displays a surah in card format

import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import Link from 'next/link';
import type { SurahInfo } from '@/types/quran-api';

interface SurahCardProps {
  surah: SurahInfo & { surahNo: number };
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  return (
    <Link href={`/quran/${surah.surahNo}`}>
      <Card className={className}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-400 text-sm font-mono">
                {surah.surahNo}
              </span>
              <Heading level={4} className="mb-0">
                {surah.surahNameTranslation}
              </Heading>
            </div>
            <Text className="text-gray-300 text-lg mb-2">
              {surah.surahNameArabic}
            </Text>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{surah.totalAyah} Ayahs</span>
              <span>•</span>
              <span>{surah.revelationPlace}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
