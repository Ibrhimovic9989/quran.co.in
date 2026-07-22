import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quran.co.in — Read the Holy Quran',
    short_name: 'Quran',
    description:
      'Read the Holy Quran online in Arabic with English translation, audio recitation, and tafsir. All 114 surahs, 6,236 ayahs. Free.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d2218',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['education', 'lifestyle', 'religion'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Verse of the Day',
        short_name: 'Today',
        description: "Read today's Quranic verse",
        url: '/today',
      },
      {
        name: 'Ask the Quran',
        short_name: 'Ask',
        description: 'AI-powered Quran search',
        url: '/ask',
      },
      {
        name: 'Browse Surahs',
        short_name: 'Quran',
        description: 'All 114 Surahs',
        url: '/quran',
      },
    ],
    screenshots: [],
  };
}
