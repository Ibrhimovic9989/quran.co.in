// Surah Card Component
// Displays a surah in card format

import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import type { SurahInfo } from '@/types/quran-api';

interface SurahCardProps {
  surah: SurahInfo & { surahNo: number };
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  // Determine gradient based on surah number for visual variety
  const gradients = [
    'from-blue-50 to-blue-100/30',
    'from-emerald-50 to-emerald-100/30',
    'from-purple-50 to-purple-100/30',
    'from-amber-50 to-amber-100/30',
  ];
  const gradient = gradients[surah.surahNo % gradients.length];

  return (
    <Link href={`/quran/${surah.surahNo}`}>
      <Card 
        className={cn(
          "relative overflow-hidden border border-gray-200 hover:border-gray-300",
          "transition-all duration-300 ease-in-out hover:shadow-lg md:hover:shadow-xl hover:-translate-y-0.5 md:hover:-translate-y-1",
          `bg-gradient-to-br ${gradient}`,
          "group/card cursor-pointer",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <span className="text-gray-800 text-xs md:text-base font-bold bg-white/80 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md shadow-sm">
                {surah.surahNo}
              </span>
              <Heading level={4} className="mb-0 text-gray-900 font-bold text-sm md:text-lg group-hover/card:text-gray-800 transition-colors duration-300">
                {surah.surahNameTranslation}
              </Heading>
            </div>
            <Text className="text-gray-900 text-lg md:text-2xl mb-2 md:mb-4 font-arabic font-semibold leading-tight md:leading-relaxed">
              {surah.surahNameArabic}
            </Text>
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-700 font-medium">
              <span>{surah.totalAyah} Ayahs</span>
              <span className="text-gray-400">•</span>
              <span>{surah.revelationPlace}</span>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none" />
      </Card>
    </Link>
  );
}
