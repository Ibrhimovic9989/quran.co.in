// JSON-LD structured data components for SEO / rich results

interface WebSiteSchemaProps {
  url?: string;
}

export function WebSiteSchema({ url = 'https://quran.co.in' }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quran.co.in',
    alternateName: ['Quran Online', 'Holy Quran Online'],
    url,
    description:
      'Read the Holy Quran online in Arabic with English translation, transliteration, audio recitation, and tafsir. All 114 surahs, 6,236 ayahs. Free.',
    inLanguage: ['en', 'ar'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/ask?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SurahSchemaProps {
  surahNo: number;
  surahName: string;
  surahNameArabic: string;
  surahNameTranslation: string;
  totalAyahs: number;
  revelationPlace: string;
}

export function SurahSchema({
  surahNo,
  surahName,
  surahNameArabic,
  surahNameTranslation,
  totalAyahs,
  revelationPlace,
}: SurahSchemaProps) {
  const url = `https://quran.co.in/quran/${surahNo}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quran.co.in' },
          { '@type': 'ListItem', position: 2, name: 'Quran', item: 'https://quran.co.in/quran' },
          { '@type': 'ListItem', position: 3, name: `Surah ${surahNameTranslation}`, item: url },
        ],
      },
      {
        '@type': 'Book',
        '@id': url,
        name: `Surah ${surahNameTranslation} (${surahName})`,
        alternateName: [surahNameArabic, `Chapter ${surahNo} of the Quran`],
        url,
        isPartOf: {
          '@type': 'Book',
          name: 'The Holy Quran',
          alternateName: 'القرآن الكريم',
          url: 'https://quran.co.in/quran',
        },
        position: surahNo,
        numberOfPages: totalAyahs,
        inLanguage: 'ar',
        description: `Surah ${surahNameTranslation} is the ${surahNo}${ordinal(surahNo)} chapter of the Holy Quran, containing ${totalAyahs} ayahs. Revealed in ${revelationPlace}.`,
        publisher: {
          '@type': 'Organization',
          name: 'Quran.co.in',
          url: 'https://quran.co.in',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}
