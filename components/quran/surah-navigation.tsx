'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/atoms';

interface SurahNavigationProps {
  prevSurahNo: number | null;
  nextSurahNo: number | null;
  prevRevelationSurah: number | null;
  nextRevelationSurah: number | null;
}

export function SurahNavigation({
  prevSurahNo,
  nextSurahNo,
  prevRevelationSurah,
  nextRevelationSurah,
}: SurahNavigationProps) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-6 md:mt-12 md:pt-8">
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex flex-1 gap-2 md:gap-3">
          {prevSurahNo ? (
            <Link href={`/quran/${prevSurahNo}`} scroll className="flex-1">
              <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs md:text-sm">Previous Surah ({prevSurahNo})</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextSurahNo ? (
            <Link href={`/quran/${nextSurahNo}`} scroll className="flex-1">
              <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-2">
                <span className="text-xs md:text-sm">Next Surah ({nextSurahNo})</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="flex flex-1 gap-2 md:gap-3">
          {prevRevelationSurah ? (
            <Link href={`/quran/${prevRevelationSurah}`} scroll className="flex-1">
              <Button variant="ghost" size="md" className="w-full flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs md:text-sm">Prev (Revelation)</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextRevelationSurah ? (
            <Link href={`/quran/${nextRevelationSurah}`} scroll className="flex-1">
              <Button variant="ghost" size="md" className="w-full flex items-center justify-center gap-2">
                <span className="text-xs md:text-sm">Next (Revelation)</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
