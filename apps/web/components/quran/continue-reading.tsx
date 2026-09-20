// Continue Reading Component
// Shows the bookmarked surah/ayah for quick access

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useBookmarks } from './bookmarks-provider';

interface ContinueReadingProps {
  className?: string;
}

export function ContinueReading({ className }: ContinueReadingProps) {
  const { isLoading, latestBookmark } = useBookmarks();

  const bookmark = useMemo(() => {
    if (!latestBookmark?.surah) return null;
    return {
      surahNumber: latestBookmark.surahNumber,
      ayahNumber: latestBookmark.ayahNumber ?? undefined,
      surah: {
        arabicName: latestBookmark.surah.arabicName,
        englishName: latestBookmark.surah.englishName,
        englishNameTranslation: latestBookmark.surah.englishNameTranslation ?? undefined,
      },
    };
  }, [latestBookmark]);

  if (isLoading || !bookmark) {
    return null;
  }

  const surahUrl = `/quran/${bookmark.surahNumber}${bookmark.ayahNumber ? `?ayah=${bookmark.ayahNumber}` : ''}`;
  return (
    <Link href={surahUrl} className={cn('mb-5 flex items-center gap-3 rounded-xl border border-line bg-accent-soft p-4', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-accent-strong">Continue reading</p>
        <p className="mt-1 text-sm font-semibold text-ink">{bookmark.surah.englishName}{bookmark.ayahNumber ? ` · Verse ${bookmark.ayahNumber}` : ''}</p>
      </div>
      <ArrowRight size={17} className="shrink-0 text-accent" />
    </Link>
  );
}
