import type { MetadataRoute } from 'next';

const BASE_URL = 'https://quran.co.in';

// Include public pages with their own canonical URLs. The content's actual
// modification times are unavailable, so no lastModified values are supplied.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '/', '/quran', '/learn', '/maqamat', '/ask', '/topics', '/today',
    '/about', '/faq', '/help', '/contact', '/privacy', '/terms',
  ];

  return [
    ...pages.map(path => ({ url: `${BASE_URL}${path === '/' ? '' : path}` })),
    ...Array.from({ length: 114 }, (_, index) => ({ url: `${BASE_URL}/quran/${index + 1}` })),
    ...Array.from({ length: 30 }, (_, index) => ({ url: `${BASE_URL}/quran/juz/${index + 1}` })),
    ...Array.from({ length: 604 }, (_, index) => ({ url: `${BASE_URL}/mushaf/${index + 1}` })),
  ];
}
