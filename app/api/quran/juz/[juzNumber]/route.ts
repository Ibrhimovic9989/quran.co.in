// API Route: Get all ayahs for a specific Juz
// Returns ayahs organized by surah

import { NextResponse } from 'next/server';
import { QuranRepository } from '@/lib/repositories';
import { getJuzData } from '@/lib/data/juz-mapping';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ juzNumber: string }> }
) {
  try {
    const { juzNumber } = await params;
    const juzNo = parseInt(juzNumber, 10);

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

    // Fetch ayahs for each surah range in the Juz
    for (const range of juzData.surahRanges) {
      // Fetch surah info
      const surah = await repository.findSurahByNumber(
        range.surahNumber,
        'TEMPORARY_API'
      );
      
      if (!surah) continue;

      // Fetch ayahs for this surah (no limit - we need all ayahs in the range)
      const ayahs = await repository.findAyahsBySurah(
        range.surahNumber,
        'TEMPORARY_API'
        // No limit - fetch all ayahs for the surah
      );

      // Filter ayahs within the range
      const rangeAyahs = ayahs.filter(
        (ayah) =>
          ayah.number >= range.startAyah && ayah.number <= range.endAyah
      );

      // Transform to AyahResponse format
      const enrichedAyahs = rangeAyahs.map((ayah) => {
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
