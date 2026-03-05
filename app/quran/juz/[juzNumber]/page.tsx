// Juz Page
// Displays a complete Juz with all its ayahs

import { JuzPageClient } from '@/components/quran/juz-page-client';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export default async function JuzPage({
  params,
}: {
  params: Promise<{ juzNumber: string }>;
}) {
  const { juzNumber } = await params;
  const juzNo = parseInt(juzNumber, 10);

  if (isNaN(juzNo) || juzNo < 1 || juzNo > 30) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <JuzPageClient juzNumber={juzNo} />
    </main>
  );
}
