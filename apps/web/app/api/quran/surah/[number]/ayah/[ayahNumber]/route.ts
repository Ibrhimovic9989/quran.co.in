// API Route: Get a specific ayah
// Returns ayah data

import { NextResponse } from 'next/server';
import { QuranService } from '@/lib/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string; ayahNumber: string }> }
) {
  try {
    const { number, ayahNumber } = await params;
    const surahNo = parseInt(number, 10);
    const ayahNo = parseInt(ayahNumber, 10);

    if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    if (isNaN(ayahNo) || ayahNo < 1) {
      return NextResponse.json(
        { error: 'Invalid ayah number.' },
        { status: 400 }
      );
    }

    const quranService = new QuranService('TEMPORARY_API');
    const ayah = await quranService.getAyah(surahNo, ayahNo);

    return NextResponse.json({ ayah });
  } catch (error) {
    console.error('Error fetching ayah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ayah' },
      { status: 500 }
    );
  }
}
