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

interface SurahCardProps {
  surah: SurahInfo & { surahNo: number };
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  const [loading, setLoading] = useState(false);

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
          'p-3.5 relative overflow-hidden rounded-2xl border border-line bg-surface',
          'transition-all duration-200 ease-out hover:border-accent/30 hover:shadow-card',
          'group/card cursor-pointer',
          loading && 'opacity-70',
          className
        )}
      >
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Gold diamond medallion */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center md:h-10 md:w-10">
            <span className="absolute inset-0 rounded-full bg-accent-soft transition-colors duration-200 group-hover/card:bg-tint-sky" />
            <span className="relative font-heading text-sm font-bold text-accent-strong md:text-base">
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

            </Text>
          </div>

          {/* The mushaf-script name — the focal point */}
          <p
            lang="ar"
            dir="rtl"
            className="max-w-[32%] break-words font-arabic text-xl leading-[1.6] text-ink transition-colors duration-300 group-hover/card:text-accent md:text-[1.75rem]"
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
