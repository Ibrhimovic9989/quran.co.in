import { MetadataRoute } from 'next';

const BASE_URL = 'https://quran.co.in';

// Surah names for descriptive URLs (SEO signal)
const SURAHS = [
  { no: 1, slug: 'al-fatiha' }, { no: 2, slug: 'al-baqarah' }, { no: 3, slug: 'al-imran' },
  { no: 4, slug: 'an-nisa' }, { no: 5, slug: 'al-maidah' }, { no: 6, slug: 'al-anam' },
  { no: 7, slug: 'al-araf' }, { no: 8, slug: 'al-anfal' }, { no: 9, slug: 'at-tawbah' },
  { no: 10, slug: 'yunus' }, { no: 11, slug: 'hud' }, { no: 12, slug: 'yusuf' },
  { no: 13, slug: 'ar-rad' }, { no: 14, slug: 'ibrahim' }, { no: 15, slug: 'al-hijr' },
  { no: 16, slug: 'an-nahl' }, { no: 17, slug: 'al-isra' }, { no: 18, slug: 'al-kahf' },
  { no: 19, slug: 'maryam' }, { no: 20, slug: 'ta-ha' }, { no: 21, slug: 'al-anbiya' },
  { no: 22, slug: 'al-hajj' }, { no: 23, slug: 'al-muminun' }, { no: 24, slug: 'an-nur' },
  { no: 25, slug: 'al-furqan' }, { no: 26, slug: 'ash-shuara' }, { no: 27, slug: 'an-naml' },
  { no: 28, slug: 'al-qasas' }, { no: 29, slug: 'al-ankabut' }, { no: 30, slug: 'ar-rum' },
  { no: 31, slug: 'luqman' }, { no: 32, slug: 'as-sajdah' }, { no: 33, slug: 'al-ahzab' },
  { no: 34, slug: 'saba' }, { no: 35, slug: 'fatir' }, { no: 36, slug: 'ya-sin' },
  { no: 37, slug: 'as-saffat' }, { no: 38, slug: 'sad' }, { no: 39, slug: 'az-zumar' },
  { no: 40, slug: 'ghafir' }, { no: 41, slug: 'fussilat' }, { no: 42, slug: 'ash-shura' },
  { no: 43, slug: 'az-zukhruf' }, { no: 44, slug: 'ad-dukhan' }, { no: 45, slug: 'al-jathiyah' },
  { no: 46, slug: 'al-ahqaf' }, { no: 47, slug: 'muhammad' }, { no: 48, slug: 'al-fath' },
  { no: 49, slug: 'al-hujurat' }, { no: 50, slug: 'qaf' }, { no: 51, slug: 'adh-dhariyat' },
  { no: 52, slug: 'at-tur' }, { no: 53, slug: 'an-najm' }, { no: 54, slug: 'al-qamar' },
  { no: 55, slug: 'ar-rahman' }, { no: 56, slug: 'al-waqiah' }, { no: 57, slug: 'al-hadid' },
  { no: 58, slug: 'al-mujadila' }, { no: 59, slug: 'al-hashr' }, { no: 60, slug: 'al-mumtahanah' },
  { no: 61, slug: 'as-saf' }, { no: 62, slug: 'al-jumuah' }, { no: 63, slug: 'al-munafiqun' },
  { no: 64, slug: 'at-taghabun' }, { no: 65, slug: 'at-talaq' }, { no: 66, slug: 'at-tahrim' },
  { no: 67, slug: 'al-mulk' }, { no: 68, slug: 'al-qalam' }, { no: 69, slug: 'al-haqqah' },
  { no: 70, slug: 'al-maarij' }, { no: 71, slug: 'nuh' }, { no: 72, slug: 'al-jinn' },
  { no: 73, slug: 'al-muzzammil' }, { no: 74, slug: 'al-muddaththir' }, { no: 75, slug: 'al-qiyamah' },
  { no: 76, slug: 'al-insan' }, { no: 77, slug: 'al-mursalat' }, { no: 78, slug: 'an-naba' },
  { no: 79, slug: 'an-naziat' }, { no: 80, slug: 'abasa' }, { no: 81, slug: 'at-takwir' },
  { no: 82, slug: 'al-infitar' }, { no: 83, slug: 'al-mutaffifin' }, { no: 84, slug: 'al-inshiqaq' },
  { no: 85, slug: 'al-buruj' }, { no: 86, slug: 'at-tariq' }, { no: 87, slug: 'al-ala' },
  { no: 88, slug: 'al-ghashiyah' }, { no: 89, slug: 'al-fajr' }, { no: 90, slug: 'al-balad' },
  { no: 91, slug: 'ash-shams' }, { no: 92, slug: 'al-layl' }, { no: 93, slug: 'ad-duha' },
  { no: 94, slug: 'ash-sharh' }, { no: 95, slug: 'at-tin' }, { no: 96, slug: 'al-alaq' },
  { no: 97, slug: 'al-qadr' }, { no: 98, slug: 'al-bayyinah' }, { no: 99, slug: 'az-zalzalah' },
  { no: 100, slug: 'al-adiyat' }, { no: 101, slug: 'al-qariah' }, { no: 102, slug: 'at-takathur' },
  { no: 103, slug: 'al-asr' }, { no: 104, slug: 'al-humazah' }, { no: 105, slug: 'al-fil' },
  { no: 106, slug: 'quraysh' }, { no: 107, slug: 'al-maun' }, { no: 108, slug: 'al-kawthar' },
  { no: 109, slug: 'al-kafirun' }, { no: 110, slug: 'an-nasr' }, { no: 111, slug: 'al-masad' },
  { no: 112, slug: 'al-ikhlas' }, { no: 113, slug: 'al-falaq' }, { no: 114, slug: 'an-nas' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,            lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/quran`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/ask`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/topics`,lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/faq`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/help`,  lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const surahPages: MetadataRoute.Sitemap = SURAHS.map(({ no }) => ({
    url: `${BASE_URL}/quran/${no}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: no <= 10 ? 0.95 : no <= 30 ? 0.85 : 0.75,
  }));

  return [...staticPages, ...surahPages];
}
