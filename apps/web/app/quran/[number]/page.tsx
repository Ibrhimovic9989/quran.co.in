// Surah Detail Page
// Displays a complete surah with audio, translations, and tafsir

import type { Metadata } from 'next';
import { SurahDisplay } from '@/components/quran/surah-display';
import { SurahSchema } from '@/components/seo/json-ld';
import { backendUrl } from '@/lib/api/backend';
import { notFound } from 'next/navigation';
import type { SurahResponse, TafsirResponse } from '@/types/quran-api';

const BASE_URL = 'https://quran.co.in';

// Resolve the Madinah mushaf page a surah begins on (for the Mushaf button).
async function fetchSurahStartPage(surahNo: number): Promise<number | null> {
  try {
    const res = await fetch(backendUrl(`/api/quran/surah/${surahNo}/page`), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { page: number };
    return data.page;
  } catch {
    return null;
  }
}

// Fetch a surah from the dedicated backend (apps/api), cached for an hour.
async function fetchSurah(surahNo: number): Promise<SurahResponse | null> {
  try {
    const res = await fetch(backendUrl(`/api/quran/surah/${surahNo}`), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { surah: SurahResponse };
    return data.surah;
  } catch {
    return null;
  }
}

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
    const surah = await fetchSurah(surahNo);
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
    const [surah, mushafPage] = await Promise.all([fetchSurah(surahNo), fetchSurahStartPage(surahNo)]);

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
      <main className="min-h-screen bg-paper">
        <SurahSchema
          surahNo={surahNo}
          surahName={surah.surahName}
          surahNameArabic={surah.surahNameArabicLong}
          surahNameTranslation={surah.surahNameTranslation}
          totalAyahs={surah.totalAyah}
          revelationPlace={surah.revelationPlace}
        />
        <SurahDisplay surah={surah} tafsirs={tafsirs} mushafPage={mushafPage} />
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
