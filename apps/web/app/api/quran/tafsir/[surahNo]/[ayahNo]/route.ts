// API Route: Get tafsir for a specific ayah
// Returns tafsir data

import { NextResponse } from 'next/server';
import { QuranService } from '@/lib/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ surahNo: string; ayahNo: string }> }
) {
  try {
    const { surahNo, ayahNo } = await params;
    const surahNum = parseInt(surahNo, 10);
    const ayahNum = parseInt(ayahNo, 10);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number.' },
        { status: 400 }
      );
    }

    if (isNaN(ayahNum) || ayahNum < 1) {
      return NextResponse.json(
        { error: 'Invalid ayah number.' },
        { status: 400 }
      );
    }

    const quranService = new QuranService('TEMPORARY_API');
    const tafsir = await quranService.getTafsir(surahNum, ayahNum);

    return NextResponse.json({ tafsir });
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tafsir' },
      { status: 500 }
    );
  }
}
