// API Route: Get all surahs
// Returns list of all surahs from the Quran

import { NextResponse } from 'next/server';
import { QuranService } from '@/lib/services';

export async function GET() {
  try {
    const quranService = new QuranService('TEMPORARY_API');
    const surahs = await quranService.getAllSurahs();
    
    return NextResponse.json({ surahs });
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surahs' },
      { status: 500 }
    );
  }
}
