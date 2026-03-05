// API Route: Get ayahs for a surah (on-demand loading)
// NETFLIX-STYLE: Load remaining ayahs on demand

import { NextResponse } from 'next/server';
import { QuranRepository } from '@/lib/repositories';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const { searchParams } = new URL(request.url);
    const surahNo = parseInt(number, 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    const repository = new QuranRepository();
    
    // Fetch ayahs with offset and limit
    const ayahs = await repository.findAyahsBySurah(
      surahNo,
      'TEMPORARY_API',
      limit + offset // Fetch up to limit + offset
    );

    // Slice to get the requested range
    const paginatedAyahs = ayahs.slice(offset, offset + limit);
    const hasMore = ayahs.length > offset + limit;

    return NextResponse.json(
      { ayahs: paginatedAyahs, hasMore },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ayahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ayahs' },
      { status: 500 }
    );
  }
}
