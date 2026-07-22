// API Route: Get a specific surah
// Returns surah data with caching

import { NextResponse } from 'next/server';
import { QuranCacheService } from '@/lib/services/quran-cache.service';

// Cache for 5 minutes
export const revalidate = 300;

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

    const cacheService = new QuranCacheService();
    const surah = await cacheService.getSurah(surahNo, 'TEMPORARY_API');

    if (!surah) {
      return NextResponse.json(
        { error: 'Surah not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { surah },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surah' },
      { status: 500 }
    );
  }
}
