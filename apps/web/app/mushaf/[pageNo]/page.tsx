// Mushaf page mode — page-faithful Madinah mushaf rendering.
// Every word sits on the same page and line as the printed mushaf
// (layout data ingested per-word), set in the authentic Hafs script.
// Missing line numbers at a surah's start are the printed headband and
// bismillah lines — reconstructed here as ornament.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { backendUrl } from '@/lib/api/backend';
import { MushafPageNav } from '@/components/quran/mushaf-page-nav';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

interface PageWord {
  surahNumber: number;
  ayahNumber: number;
  position: number;
  charType: string;
  textUthmani: string;
  lineNumber: number | null;
}

interface PageData {
  page: number;
  words: PageWord[];
  surahs: { number: number; arabicName: string; englishName: string }[];
}

async function fetchPage(pageNo: number): Promise<PageData | null> {
  try {
    const res = await fetch(backendUrl(`/api/quran/page/${pageNo}`), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PageData;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageNo: string }>;
}): Promise<Metadata> {
  const { pageNo } = await params;
  return {
    title: `Mushaf — Page ${pageNo} of 604`,
    description: `Read page ${pageNo} of the Madinah Mushaf online — authentic script, page-faithful layout.`,
  };
}

type RenderLine =
  | { kind: 'text'; line: number; words: PageWord[] }
  | { kind: 'headband'; surah: number }
  | { kind: 'bismillah' };

/** Rebuild the printed page: text lines + headband/bismillah for the gaps. */
function buildLines(data: PageData): RenderLine[] {
  const byLine = new Map<number, PageWord[]>();
  for (const w of data.words) {
    if (w.lineNumber == null) continue;
    if (!byLine.has(w.lineNumber)) byLine.set(w.lineNumber, []);
    byLine.get(w.lineNumber)!.push(w);
  }

  const maxLine = Math.max(15, ...byLine.keys());
  const out: RenderLine[] = [];
  const headbandDone = new Set<number>();

  for (let line = 1; line <= maxLine; line++) {
    const words = byLine.get(line);
    if (words && words.length > 0) {
      out.push({ kind: 'text', line, words });
      continue;
    }

    // Gap: belongs to the next surah that starts below it.
    let nextSurah: number | null = null;
    for (let l = line + 1; l <= maxLine; l++) {
      const ws = byLine.get(l);
      if (ws && ws.length > 0) {
        const first = ws[0];
        if (first.ayahNumber === 1 || headbandDone.has(first.surahNumber) === false) {
          nextSurah = first.surahNumber;
        }
        break;
      }
    }
    if (nextSurah == null) continue; // trailing empty lines (short pages)

    if (!headbandDone.has(nextSurah)) {
      headbandDone.add(nextSurah);
      out.push({ kind: 'headband', surah: nextSurah });
    } else if (nextSurah !== 1 && nextSurah !== 9) {
      out.push({ kind: 'bismillah' });
    }
  }

  return out;
}

export default async function MushafPage({
  params,
}: {
  params: Promise<{ pageNo: string }>;
}) {
  const { pageNo } = await params;
  const page = parseInt(pageNo, 10);
  if (Number.isNaN(page) || page < 1 || page > 604) notFound();

  const data = await fetchPage(page);
  if (!data || data.words.length === 0) notFound();

  const lines = buildLines(data);
  const surahName = (n: number) =>
    data.surahs.find((s) => s.number === n) ?? {
      number: n,
      arabicName: `سورة ${n}`,
      englishName: `Surah ${n}`,
    };

  return (
    <main className="min-h-screen bg-paper py-6 md:py-10">
      <div className="mx-auto max-w-2xl px-3 sm:px-6">
        {/* The page */}
        <div className="mushaf-paper mushaf-border rounded-2xl px-4 py-6 sm:px-8 sm:py-9 md:px-10">
          <div className="flex flex-col gap-y-1.5 md:gap-y-2">
            {lines.map((l, i) => {
              if (l.kind === 'headband') {
                const s = surahName(l.surah);
                return (
                  <div
                    key={`hb-${i}`}
                    className="my-1 flex items-center justify-center gap-3 rounded-xl border border-gold/50 bg-gold-soft/30 px-4 py-2"
                  >
                    <span className="text-gold" aria-hidden>✦</span>
                    <span lang="ar" dir="rtl" className="font-arabic-display text-xl text-ink md:text-2xl">
                      سُورَةُ {s.arabicName.replace(/^سورة\s*/, '')}
                    </span>
                    <span className="text-gold" aria-hidden>✦</span>
                  </div>
                );
              }
              if (l.kind === 'bismillah') {
                return (
                  <p
                    key={`bm-${i}`}
                    lang="ar"
                    dir="rtl"
                    className="my-0.5 text-center font-arabic text-[min(4.2vw,1.45rem)] leading-[1.9] text-ink"
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                );
              }
              const few = l.words.length <= 2;
              return (
                <p
                  key={`ln-${l.line}`}
                  lang="ar"
                  dir="rtl"
                  className={
                    'flex font-arabic text-[min(4.6vw,1.6rem)] leading-[2] text-ink ' +
                    (few ? 'justify-center gap-x-4' : 'justify-between gap-x-1')
                  }
                >
                  {l.words.map((w) => (
                    <span
                      key={`${w.surahNumber}-${w.ayahNumber}-${w.position}`}
                      className={w.charType === 'end' ? 'ayah-end select-none' : undefined}
                      title={w.charType === 'end' ? undefined : `${w.surahNumber}:${w.ayahNumber}`}
                    >
                      {w.textUthmani}
                    </span>
                  ))}
                </p>
              );
            })}
          </div>

          {/* Page number medallion */}
          <div className="mt-6 flex justify-center">
            <span className="rounded-full border border-gold/50 px-4 py-1 text-xs font-semibold text-gold-text">
              {page}
            </span>
          </div>
        </div>

        <MushafPageNav
          page={page}
          surahs={data.surahs.map((s) => `${s.englishName}`)}
        />
      </div>
    </main>
  );
}
