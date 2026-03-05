// API Route: Get audio for a specific ayah
// Returns audio URLs for all reciters for a specific ayah

import { NextResponse } from 'next/server';
import { QuranService } from '@/lib/services/quran.service';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ surahNo: string; ayahNo: string }> }
) {
  try {
    const { surahNo, ayahNo } = await params;
    const surahNumber = parseInt(surahNo, 10);
    const ayahNumber = parseInt(ayahNo, 10);

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    if (isNaN(ayahNumber) || ayahNumber < 1) {
      return NextResponse.json(
        { error: 'Invalid ayah number.' },
        { status: 400 }
      );
    }

    const quranService = new QuranService();
    const audioData = await quranService.getVerseAudio(surahNumber, ayahNumber);

    return NextResponse.json(
      { audio: audioData },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ayah audio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ayah audio' },
      { status: 500 }
    );
  }
}
