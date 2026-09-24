// Juz Page
// Displays a complete Juz with all its ayahs

import { JuzPageClient } from '@/components/quran/juz-page-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function generateMetadata({ params }: {
  params: Promise<{ juzNumber: string }>;
}): Promise<Metadata> {
  const { juzNumber } = await params;
  return {
    title: `Juz ${juzNumber} — Read the Quran`,
    description: `Read Juz ${juzNumber} of the Quran in Arabic with translation and audio recitation.`,
    alternates: { canonical: `https://quran.co.in/quran/juz/${juzNumber}` },
  };
}

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
    <main className="min-h-screen bg-paper">
      <JuzPageClient juzNumber={juzNo} />
    </main>
  );
}
