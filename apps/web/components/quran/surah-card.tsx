// Surah Card Component
// One unified, calm card: gold medallion number, English identity,
// and the surah name in the authentic mushaf script as the focal point.

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import type { SurahInfo } from '@/types/quran-api';
import { getRevelationInfo, PERIOD_LABELS, PERIOD_DESCRIPTIONS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';

interface SurahCardProps {
  surah: SurahInfo & { surahNo: number };
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  const [loading, setLoading] = useState(false);
  const revelation = getRevelationInfo(surah.surahNo);

  return (
    <Link
      href={`/quran/${surah.surahNo}`}
      scroll={false}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setLoading(true);
      }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border border-line bg-surface shadow-card',
          'transition-all duration-300 ease-in-out hover:border-gold/50 hover:shadow-card-hover hover:-translate-y-0.5',
          'group/card cursor-pointer',
          loading && 'opacity-70',
          className
        )}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Gold diamond medallion */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
            <span className="absolute inset-0 rotate-45 rounded-[0.6rem] border border-gold/60 bg-gold-soft/30 transition-colors duration-300 group-hover/card:bg-gold-soft/60" />
            <span className="relative text-sm font-semibold text-gold-text md:text-base">
              {surah.surahNo}
            </span>
          </div>

          {/* English identity */}
          <div className="min-w-0 flex-1">
            <Heading
              level={4}
              className="mb-0 truncate text-sm font-semibold text-ink md:text-base"
            >
              {surah.surahName}
            </Heading>
            <Text className="truncate font-reading text-xs text-ink-muted md:text-sm">
              {surah.surahNameTranslation}
            </Text>
            <Text className="mt-1 text-[11px] text-ink-muted md:text-xs">
              {surah.totalAyah} āyāt · {surah.revelationPlace === 'Mecca' ? 'Meccan' : 'Medinan'}
              {revelation && (
                <span
                  title={`${PERIOD_DESCRIPTIONS[revelation.period]}\n\n${APPROXIMATION_NOTE}`}
                  className="cursor-help"
                >
                  {' '}· {PERIOD_LABELS[revelation.period]}
                </span>
              )}
            </Text>
          </div>

          {/* The mushaf-script name — the focal point */}
          <p
            lang="ar"
            dir="rtl"
            className="shrink-0 font-arabic text-2xl leading-[1.6] text-ink transition-colors duration-300 group-hover/card:text-accent md:text-[1.75rem]"
          >
            {surah.surahNameArabic}
          </p>

          {loading && (
            <span className="absolute right-2 top-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
          )}
        </div>
      </Card>
    </Link>
  );
}
