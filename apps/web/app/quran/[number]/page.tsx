// Surah Detail Page
// Displays a complete surah with audio, translations, and tafsir

import type { Metadata } from 'next';
import { SurahDisplay } from '@/components/quran/surah-display';
import { SurahSchema } from '@/components/seo/json-ld';
import { QuranCacheService } from '@/lib/services/quran-cache.service';
import { notFound } from 'next/navigation';
import type { TafsirResponse } from '@/types/quran-api';

const BASE_URL = 'https://quran.co.in';

// Force dynamic rendering - don't try to fetch at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour (surahs don't change)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const surahNo = parseInt(number, 10);
  if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) return {};

  try {
    const cacheService = new QuranCacheService();
    const surah = await cacheService.getSurah(surahNo, 'TEMPORARY_API');
    if (!surah) return {};

    const title = `Surah ${surah.surahNameTranslation} (${surah.surahName}) — ${surahNo}:1-${surah.totalAyah}`;
    const description = `Read Surah ${surah.surahNameTranslation} (${surah.surahName}) online in Arabic with English translation, transliteration, and audio. ${surah.totalAyah} ayahs, revealed in ${surah.revelationPlace}. Free at Quran.co.in.`;
    const url = `${BASE_URL}/quran/${surahNo}`;

    return {
      title,
      description,
      keywords: [
        `Surah ${surah.surahNameTranslation}`,
        `${surah.surahName} translation`,
        `${surah.surahNameTranslation} in English`,
        `${surah.surahNameTranslation} with translation`,
        `Surah ${surahNo}`,
        'Quran online',
        'read Quran',
      ],
      alternates: { canonical: url },
      openGraph: {
        type: 'article',
        url,
        title,
        description,
        siteName: 'Quran.co.in',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `Surah ${surah.surahNameTranslation} — Quran.co.in` }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.png'],
      },
    };
  } catch {
    return {};
  }
}

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
        <SurahSchema
          surahNo={surahNo}
          surahName={surah.surahName}
          surahNameArabic={surah.surahNameArabicLong}
          surahNameTranslation={surah.surahNameTranslation}
          totalAyahs={surah.totalAyah}
          revelationPlace={surah.revelationPlace}
        />
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
