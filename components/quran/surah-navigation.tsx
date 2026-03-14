'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleNavigation = (url: string) => {
    // Scroll to top immediately before navigation
    window.scrollTo(0, 0);
    router.push(url);
    // Also scroll after a brief delay to ensure it works
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6 md:mt-12 md:pt-8">
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex flex-1 gap-2 md:gap-3">
          {prevSurahNo ? (
            <div className="flex-1">
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleNavigation(`/quran/${prevSurahNo}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs md:text-sm">Previous Surah ({prevSurahNo})</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {nextSurahNo ? (
            <div className="flex-1">
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleNavigation(`/quran/${nextSurahNo}`)}
              >
                <span className="text-xs md:text-sm">Next Surah ({nextSurahNo})</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="flex flex-1 gap-2 md:gap-3">
          {prevRevelationSurah ? (
            <div className="flex-1">
              <Button 
                variant="ghost" 
                size="md" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleNavigation(`/quran/${prevRevelationSurah}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs md:text-sm">Prev (Revelation)</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {nextRevelationSurah ? (
            <div className="flex-1">
              <Button 
                variant="ghost" 
                size="md" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleNavigation(`/quran/${nextRevelationSurah}`)}
              >
                <span className="text-xs md:text-sm">Next (Revelation)</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
