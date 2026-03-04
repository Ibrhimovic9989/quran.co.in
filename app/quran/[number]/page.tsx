// Surah Detail Page
// Displays a complete surah with audio, translations, and tafsir

import { SurahDisplay } from '@/components/quran/surah-display';
import { QuranCacheService } from '@/lib/services/quran-cache.service';
import { notFound } from 'next/navigation';
import type { TafsirResponse } from '@/types/quran-api';

// Force dynamic rendering - don't try to fetch at build time
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export default async function SurahPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const surahNo = parseInt(number, 10);

  if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) {
    notFound();
  }

  try {
    const cacheService = new QuranCacheService();
    const surah = await cacheService.getSurah(surahNo, 'TEMPORARY_API');

    if (!surah) {
      return (
        <div className="min-h-screen bg-black text-white p-8">
          <h1 className="text-2xl mb-4">Surah Not Found</h1>
          <p className="text-gray-400">
            Unable to load surah {surahNo}. Please try again later.
          </p>
        </div>
      );
    }

    // Fetch tafsir on-demand when user clicks (not here)
    const tafsirs = new Map<string, TafsirResponse>();

    return (
      <div className="min-h-screen bg-black">
        <SurahDisplay surah={surah} tafsirs={tafsirs} />
      </div>
    );
  } catch (error) {
    console.error('Error loading surah:', error);
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl mb-4">Error Loading Surah</h1>
        <p className="text-gray-400">
          {error instanceof Error ? error.message : 'Failed to load surah'}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }
}
