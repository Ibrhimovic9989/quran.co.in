// Surah Detail Page
// Displays a complete surah with audio, translations, and tafsir

import { SurahDisplay } from '@/components/quran/surah-display';
import { QuranCacheService } from '@/lib/services/quran-cache.service';
import { notFound } from 'next/navigation';
import type { TafsirResponse } from '@/types/quran-api';

// Force dynamic rendering - don't try to fetch at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour (surahs don't change)

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
        <main className="min-h-screen bg-white text-black p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Surah Not Found</h1>
            <p className="text-gray-600 text-lg">
              Unable to load surah {surahNo}. Please try again later.
            </p>
          </div>
        </main>
      );
    }

    // Fetch tafsir on-demand when user clicks (not here)
    const tafsirs = new Map<string, TafsirResponse>();

    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
        <SurahDisplay surah={surah} tafsirs={tafsirs} />
      </main>
    );
  } catch (error) {
    console.error('Error loading surah:', error);
      return (
        <main className="min-h-screen bg-white text-black p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Surah</h1>
            <p className="text-gray-600 text-lg">
              {error instanceof Error ? error.message : 'Failed to load surah'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Please refresh the page or try again later.
            </p>
          </div>
        </main>
      );
  }
}
