// API Route: Get all ayahs for a specific Juz
// Returns ayahs organized by surah

import { NextResponse } from 'next/server';
import { QuranRepository } from '@/lib/repositories/quran.repository';
import { getJuzData } from '@/lib/data/juz-mapping';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ juzNumber: string }> }
) {
  try {
    const { juzNumber } = await params;
    const url = new URL(request.url);
    const offsetParam = url.searchParams.get('offset');
    const limitParam = url.searchParams.get('limit');

    const juzNo = parseInt(juzNumber, 10);
    const offset = Math.max(0, parseInt(offsetParam || '0', 10) || 0);
    const limit = Math.max(1, Math.min(50, parseInt(limitParam || '20', 10) || 20)); // cap to 50 per page

    if (isNaN(juzNo) || juzNo < 1 || juzNo > 30) {
      return NextResponse.json(
        { error: 'Invalid Juz number. Must be between 1 and 30.' },
        { status: 400 }
      );
    }

    const juzData = getJuzData(juzNo);
    if (!juzData) {
      return NextResponse.json(
        { error: 'Juz data not found' },
        { status: 404 }
      );
    }

    const repository = new QuranRepository();
    const juzAyahs: any[] = [];

    // Compute total ayahs in this Juz so the client knows when to stop
    const totalAyahs = juzData.surahRanges.reduce(
      (sum, r) => sum + (r.endAyah - r.startAyah + 1),
      0
    );

    const endIndex = Math.min(offset + limit, totalAyahs);
    let globalIndex = 0; // index within the whole Juz (0-based)

    // Fetch ayahs for each surah range in the Juz, but only the window [offset, endIndex)
    for (const range of juzData.surahRanges) {
      const rangeLength = range.endAyah - range.startAyah + 1;

      // Skip this entire range if it ends before the requested window
      if (globalIndex + rangeLength <= offset) {
        globalIndex += rangeLength;
        continue;
      }

      // Stop if we've passed the requested window
      if (globalIndex >= endIndex) {
        break;
      }

      // Figure out which ayahs we need within this range
      const localStartOffset = Math.max(offset - globalIndex, 0);
      const localEndOffset = Math.min(endIndex - globalIndex - 1, rangeLength - 1);
      const localStartAyah = range.startAyah + localStartOffset;
      const localEndAyah = range.startAyah + localEndOffset;

      // Fetch surah info
      const surah = await repository.findSurahByNumber(
        range.surahNumber,
        'TEMPORARY_API'
      );
      
      if (!surah) {
        globalIndex += rangeLength;
        continue;
      }

      // Fetch ayahs up to localEndAyah, then filter to [localStartAyah, localEndAyah]
      const ayahs = await repository.findAyahsBySurah(
        range.surahNumber,
        'TEMPORARY_API',
        localEndAyah
      );

      const windowAyahs = ayahs.filter(
        (ayah) =>
          ayah.number >= localStartAyah && ayah.number <= localEndAyah
      );

      // Transform to AyahResponse format
      const enrichedAyahs = windowAyahs.map((ayah) => {
        const metadata = (ayah.metadata as any) || {};
        return {
          // Surah info
          surahNo: range.surahNumber,
          surahName: surah.name,
          surahNameArabic: surah.arabicName,
          surahNameArabicLong: surah.arabicName,
          surahNameTranslation: surah.englishNameTranslation || surah.englishName,
          revelationPlace: surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
          totalAyah: surah.numberOfAyahs,
          
          // Ayah info
          ayahNo: ayah.number,
          
          // Content
          arabic1: ayah.arabicText || '',
          arabic2: ayah.transliteration || ayah.arabicText || '',
          english: ayah.translationText || '',
          
          // Translations from metadata
          bengali: metadata.bengali,
          urdu: metadata.urdu,
          turkish: metadata.turkish,
          uzbek: metadata.uzbek,
          
          // Audio
          audio: metadata.audio || {},
          
          // Additional fields for Juz modal
          surahNumber: range.surahNumber,
          juzNumber: juzNo,
        };
      });

      juzAyahs.push(...enrichedAyahs);

      globalIndex += rangeLength;
    }

    // Sort by surah number, then by ayah number
    juzAyahs.sort((a, b) => {
      if (a.surahNumber !== b.surahNumber) {
        return a.surahNumber - b.surahNumber;
      }
      return a.ayahNo - b.ayahNo;
    });

    return NextResponse.json(
      {
        juzNumber: juzNo,
        totalAyahs,
        ayahs: juzAyahs,
        surahRanges: juzData.surahRanges,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Juz ayahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Juz ayahs' },
      { status: 500 }
    );
  }
}
