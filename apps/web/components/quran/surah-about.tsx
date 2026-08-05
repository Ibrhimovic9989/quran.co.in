// A unique, indexable "About this Surah" section + FAQ structured data. This is
// the editorial content that makes each surah page distinct from the identical
// Qurʾān text on every other site — the fix for "crawled – currently not indexed".

import { SURAH_SEO } from '@/lib/data/surah-seo';

interface SurahAboutProps {
  surahNo: number;
  surahName: string; // e.g. "Al-Faatiha"
  surahNameTranslation: string; // e.g. "The Opening"
  totalAyah: number;
  revelationPlace: string; // e.g. "Mecca" | "Madina"
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function SurahAbout({
  surahNo,
  surahName,
  surahNameTranslation,
  totalAyah,
  revelationPlace,
}: SurahAboutProps) {
  const seo = SURAH_SEO[surahNo];
  if (!seo) return null;

  const isMeccan = /mecc|makk/i.test(revelationPlace);
  const place = isMeccan ? 'Meccan (Makkī)' : 'Madinan (Madanī)';

  const faqs: { q: string; a: string }[] = [
    { q: `What is Surah ${surahName} about?`, a: seo.theme },
    {
      q: `How many verses are in Surah ${surahName}?`,
      a: `Surah ${surahName} (${surahNameTranslation}) has ${totalAyah} verses (āyāt).`,
    },
    {
      q: `Is Surah ${surahName} Meccan or Madinan?`,
      a: `Surah ${surahName} is a ${place} sūrah${revelationPlace ? `, revealed in ${revelationPlace}` : ''}.`,
    },
    {
      q: `What number is Surah ${surahName} in the Qurʾān?`,
      a: `Surah ${surahName} is the ${ordinal(surahNo)} chapter (sūrah) of the Holy Qurʾān.`,
    },
    ...(seo.virtue
      ? [{ q: `What are the virtues of Surah ${surahName}?`, a: seo.virtue }]
      : []),
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section
      aria-label={`About Surah ${surahName}`}
      className="mx-auto mt-8 max-w-3xl px-4 pb-16"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card md:p-8">
        <h2 className="font-reading text-2xl font-bold text-ink">
          About Surah {surahName} <span className="text-ink-muted">({surahNameTranslation})</span>
        </h2>

        <p className="mt-4 leading-relaxed text-ink-soft">{seo.theme}</p>
        {seo.virtue && (
          <p className="mt-3 leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Virtue: </span>
            {seo.virtue}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-ink-muted">Chapter</dt>
            <dd className="font-semibold text-ink">{surahNo} of 114</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Revealed in</dt>
            <dd className="font-semibold text-ink">{revelationPlace || (isMeccan ? 'Mecca' : 'Madina')}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Period</dt>
            <dd className="font-semibold text-ink">{isMeccan ? 'Meccan' : 'Madinan'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Verses</dt>
            <dd className="font-semibold text-ink">{totalAyah}</dd>
          </div>
        </dl>

        <h3 className="mt-8 font-reading text-lg font-bold text-ink">Frequently asked questions</h3>
        <div className="mt-4 space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <p className="font-semibold text-ink">{f.q}</p>
              <p className="mt-1 leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
