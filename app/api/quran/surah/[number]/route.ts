// API Route: Get a specific surah
// Returns complete surah data

import { NextResponse } from 'next/server';
import { QuranService } from '@/lib/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const surahNo = parseInt(number, 10);

    if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    const quranService = new QuranService('TEMPORARY_API');
    const surah = await quranService.getSurah(surahNo);

    return NextResponse.json({ surah });
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surah' },
      { status: 500 }
    );
  }
}
