// Surah Card Component
// Displays a surah in card format

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import type { SurahInfo } from '@/types/quran-api';
import { getRevelationInfo, PERIOD_LABELS, PERIOD_COLORS, PERIOD_DESCRIPTIONS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';

interface SurahCardProps {
  surah: SurahInfo & { surahNo: number };
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  const [loading, setLoading] = useState(false);
  const revelation = getRevelationInfo(surah.surahNo);

  // Determine gradient based on surah number for visual variety
  const gradients = [
    'from-blue-50 to-blue-100/30',
    'from-emerald-50 to-emerald-100/30',
    'from-purple-50 to-purple-100/30',
    'from-amber-50 to-amber-100/30',
  ];
  const gradient = gradients[surah.surahNo % gradients.length];

  return (
    <Link href={`/quran/${surah.surahNo}`} onClick={() => setLoading(true)}>
      <Card
        className={cn(
          "relative overflow-hidden border border-gray-200 hover:border-gray-300",
          "transition-all duration-300 ease-in-out hover:shadow-lg md:hover:shadow-xl hover:-translate-y-0.5 md:hover:-translate-y-1",
          `bg-gradient-to-br ${gradient}`,
          "group/card cursor-pointer",
          loading && "opacity-70",
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
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs text-gray-700 font-medium">
              <span>{surah.totalAyah} Ayahs</span>
              <span className="text-gray-400">•</span>
              <span>{surah.revelationPlace}</span>
              {revelation && (
                <>
                  <span className="text-gray-400">•</span>
                  <span
                    title={`${PERIOD_DESCRIPTIONS[revelation.period]}\n\n${APPROXIMATION_NOTE}`}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-medium cursor-help',
                      PERIOD_COLORS[revelation.period].badge
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PERIOD_COLORS[revelation.period].dot)} />
                    {PERIOD_LABELS[revelation.period]}
                  </span>
                  <span title={APPROXIMATION_NOTE} className="text-gray-500 text-[10px] md:text-xs cursor-help">{revelation.yearCE} CE*</span>
                </>
              )}
            </div>
          </div>

          {loading && (
            <div className="shrink-0 ml-2 flex items-center">
              <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none" />
      </Card>
    </Link>
  );
}
