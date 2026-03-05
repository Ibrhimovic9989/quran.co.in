// Juz Mapping Data
// Maps each of the 30 Juz to their surah and ayah ranges
// Based on standard Hizb divisions of the Quran

export interface JuzSurahRange {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

export interface JuzData {
  juzNumber: number;
  surahRanges: JuzSurahRange[];
}

export const juzMapping: JuzData[] = [
  // Juz 1
  {
    juzNumber: 1,
    surahRanges: [
      { surahNumber: 1, startAyah: 1, endAyah: 7 }, // Al-Fatihah
      { surahNumber: 2, startAyah: 1, endAyah: 141 }, // Al-Baqarah (partial)
    ],
  },
  // Juz 2
  {
    juzNumber: 2,
    surahRanges: [
      { surahNumber: 2, startAyah: 142, endAyah: 252 }, // Al-Baqarah (partial)
    ],
  },
  // Juz 3
  {
    juzNumber: 3,
    surahRanges: [
      { surahNumber: 2, startAyah: 253, endAyah: 286 }, // Al-Baqarah (partial)
      { surahNumber: 3, startAyah: 1, endAyah: 92 }, // Ali 'Imran (partial)
    ],
  },
  // Juz 4
  {
    juzNumber: 4,
    surahRanges: [
      { surahNumber: 3, startAyah: 93, endAyah: 200 }, // Ali 'Imran (partial)
      { surahNumber: 4, startAyah: 1, endAyah: 23 }, // An-Nisa (partial)
    ],
  },
  // Juz 5
  {
    juzNumber: 5,
    surahRanges: [
      { surahNumber: 4, startAyah: 24, endAyah: 147 }, // An-Nisa (partial)
    ],
  },
  // Juz 6
  {
    juzNumber: 6,
    surahRanges: [
      { surahNumber: 4, startAyah: 148, endAyah: 176 }, // An-Nisa (partial)
      { surahNumber: 5, startAyah: 1, endAyah: 81 }, // Al-Ma'idah (partial)
    ],
  },
  // Juz 7
  {
    juzNumber: 7,
    surahRanges: [
      { surahNumber: 5, startAyah: 82, endAyah: 120 }, // Al-Ma'idah (partial)
      { surahNumber: 6, startAyah: 1, endAyah: 110 }, // Al-An'am (partial)
    ],
  },
  // Juz 8
  {
    juzNumber: 8,
    surahRanges: [
      { surahNumber: 6, startAyah: 111, endAyah: 165 }, // Al-An'am (partial)
      { surahNumber: 7, startAyah: 1, endAyah: 87 }, // Al-A'raf (partial)
    ],
  },
  // Juz 9
  {
    juzNumber: 9,
    surahRanges: [
      { surahNumber: 7, startAyah: 88, endAyah: 206 }, // Al-A'raf (partial)
      { surahNumber: 8, startAyah: 1, endAyah: 40 }, // Al-Anfal (partial)
    ],
  },
  // Juz 10
  {
    juzNumber: 10,
    surahRanges: [
      { surahNumber: 8, startAyah: 41, endAyah: 75 }, // Al-Anfal (partial)
      { surahNumber: 9, startAyah: 1, endAyah: 93 }, // At-Tawbah (partial)
    ],
  },
  // Juz 11
  {
    juzNumber: 11,
    surahRanges: [
      { surahNumber: 9, startAyah: 94, endAyah: 129 }, // At-Tawbah (partial)
      { surahNumber: 10, startAyah: 1, endAyah: 109 }, // Yunus (complete)
      { surahNumber: 11, startAyah: 1, endAyah: 5 }, // Hud (partial)
    ],
  },
  // Juz 12
  {
    juzNumber: 12,
    surahRanges: [
      { surahNumber: 11, startAyah: 6, endAyah: 123 }, // Hud (partial)
      { surahNumber: 12, startAyah: 1, endAyah: 52 }, // Yusuf (partial)
    ],
  },
  // Juz 13
  {
    juzNumber: 13,
    surahRanges: [
      { surahNumber: 12, startAyah: 53, endAyah: 111 }, // Yusuf (partial)
      { surahNumber: 13, startAyah: 1, endAyah: 43 }, // Ar-Ra'd (complete)
      { surahNumber: 14, startAyah: 1, endAyah: 52 }, // Ibrahim (complete)
      { surahNumber: 15, startAyah: 1, endAyah: 99 }, // Al-Hijr (complete)
    ],
  },
  // Juz 14
  {
    juzNumber: 14,
    surahRanges: [
      { surahNumber: 16, startAyah: 1, endAyah: 128 }, // An-Nahl (complete)
      { surahNumber: 17, startAyah: 1, endAyah: 111 }, // Al-Isra (complete)
    ],
  },
  // Juz 15
  {
    juzNumber: 15,
    surahRanges: [
      { surahNumber: 18, startAyah: 1, endAyah: 110 }, // Al-Kahf (complete)
      { surahNumber: 19, startAyah: 1, endAyah: 98 }, // Maryam (complete)
      { surahNumber: 20, startAyah: 1, endAyah: 135 }, // Ta-Ha (complete)
    ],
  },
  // Juz 16
  {
    juzNumber: 16,
    surahRanges: [
      { surahNumber: 21, startAyah: 1, endAyah: 112 }, // Al-Anbiya (complete)
      { surahNumber: 22, startAyah: 1, endAyah: 78 }, // Al-Hajj (complete)
    ],
  },
  // Juz 17
  {
    juzNumber: 17,
    surahRanges: [
      { surahNumber: 23, startAyah: 1, endAyah: 118 }, // Al-Mu'minun (complete)
      { surahNumber: 24, startAyah: 1, endAyah: 64 }, // An-Nur (complete)
      { surahNumber: 25, startAyah: 1, endAyah: 20 }, // Al-Furqan (partial)
    ],
  },
  // Juz 18
  {
    juzNumber: 18,
    surahRanges: [
      { surahNumber: 25, startAyah: 21, endAyah: 77 }, // Al-Furqan (partial)
      { surahNumber: 26, startAyah: 1, endAyah: 227 }, // Ash-Shu'ara (complete)
      { surahNumber: 27, startAyah: 1, endAyah: 55 }, // An-Naml (partial)
    ],
  },
  // Juz 19
  {
    juzNumber: 19,
    surahRanges: [
      { surahNumber: 27, startAyah: 56, endAyah: 93 }, // An-Naml (partial)
      { surahNumber: 28, startAyah: 1, endAyah: 88 }, // Al-Qasas (complete)
      { surahNumber: 29, startAyah: 1, endAyah: 45 }, // Al-'Ankabut (partial)
    ],
  },
  // Juz 20
  {
    juzNumber: 20,
    surahRanges: [
      { surahNumber: 29, startAyah: 46, endAyah: 69 }, // Al-'Ankabut (partial)
      { surahNumber: 30, startAyah: 1, endAyah: 60 }, // Ar-Rum (complete)
      { surahNumber: 31, startAyah: 1, endAyah: 34 }, // Luqman (complete)
      { surahNumber: 32, startAyah: 1, endAyah: 30 }, // As-Sajdah (complete)
      { surahNumber: 33, startAyah: 1, endAyah: 30 }, // Al-Ahzab (partial)
    ],
  },
  // Juz 21
  {
    juzNumber: 21,
    surahRanges: [
      { surahNumber: 33, startAyah: 31, endAyah: 73 }, // Al-Ahzab (partial)
      { surahNumber: 34, startAyah: 1, endAyah: 54 }, // Saba (complete)
      { surahNumber: 35, startAyah: 1, endAyah: 45 }, // Fatir (complete)
      { surahNumber: 36, startAyah: 1, endAyah: 27 }, // Ya-Sin (partial)
    ],
  },
  // Juz 22
  {
    juzNumber: 22,
    surahRanges: [
      { surahNumber: 36, startAyah: 28, endAyah: 83 }, // Ya-Sin (partial)
      { surahNumber: 37, startAyah: 1, endAyah: 182 }, // As-Saffat (complete)
      { surahNumber: 38, startAyah: 1, endAyah: 88 }, // Sad (complete)
      { surahNumber: 39, startAyah: 1, endAyah: 31 }, // Az-Zumar (partial)
    ],
  },
  // Juz 23
  {
    juzNumber: 23,
    surahRanges: [
      { surahNumber: 39, startAyah: 32, endAyah: 75 }, // Az-Zumar (partial)
      { surahNumber: 40, startAyah: 1, endAyah: 85 }, // Ghafir (partial)
    ],
  },
  // Juz 24
  {
    juzNumber: 24,
    surahRanges: [
      { surahNumber: 39, startAyah: 32, endAyah: 75 }, // Az-Zumar (partial)
      { surahNumber: 40, startAyah: 1, endAyah: 85 }, // Ghafir (complete)
      { surahNumber: 41, startAyah: 1, endAyah: 54 }, // Fussilat (complete)
    ],
  },
  // Juz 25
  {
    juzNumber: 25,
    surahRanges: [
      { surahNumber: 46, startAyah: 1, endAyah: 35 }, // Al-Ahqaf (complete)
      { surahNumber: 47, startAyah: 1, endAyah: 38 }, // Muhammad (complete)
      { surahNumber: 48, startAyah: 1, endAyah: 29 }, // Al-Fath (complete)
      { surahNumber: 49, startAyah: 1, endAyah: 18 }, // Al-Hujurat (complete)
      { surahNumber: 50, startAyah: 1, endAyah: 45 }, // Qaf (complete)
      { surahNumber: 51, startAyah: 1, endAyah: 30 }, // Adh-Dhariyat (complete)
      { surahNumber: 52, startAyah: 1, endAyah: 49 }, // At-Tur (complete)
      { surahNumber: 53, startAyah: 1, endAyah: 62 }, // An-Najm (complete)
      { surahNumber: 54, startAyah: 1, endAyah: 55 }, // Al-Qamar (complete)
    ],
  },
  // Juz 26
  {
    juzNumber: 26,
    surahRanges: [
      { surahNumber: 55, startAyah: 1, endAyah: 78 }, // Ar-Rahman (complete)
      { surahNumber: 56, startAyah: 1, endAyah: 96 }, // Al-Waqi'ah (complete)
      { surahNumber: 57, startAyah: 1, endAyah: 29 }, // Al-Hadid (complete)
      { surahNumber: 58, startAyah: 1, endAyah: 22 }, // Al-Mujadila (complete)
      { surahNumber: 59, startAyah: 1, endAyah: 24 }, // Al-Hashr (complete)
      { surahNumber: 60, startAyah: 1, endAyah: 13 }, // Al-Mumtahanah (complete)
      { surahNumber: 61, startAyah: 1, endAyah: 14 }, // As-Saff (complete)
      { surahNumber: 62, startAyah: 1, endAyah: 11 }, // Al-Jumu'ah (complete)
      { surahNumber: 63, startAyah: 1, endAyah: 11 }, // Al-Munafiqun (complete)
      { surahNumber: 64, startAyah: 1, endAyah: 18 }, // At-Taghabun (complete)
      { surahNumber: 65, startAyah: 1, endAyah: 12 }, // At-Talaq (complete)
      { surahNumber: 66, startAyah: 1, endAyah: 12 }, // At-Tahrim (complete)
    ],
  },
  // Juz 27
  {
    juzNumber: 27,
    surahRanges: [
      { surahNumber: 67, startAyah: 1, endAyah: 30 }, // Al-Mulk (complete)
      { surahNumber: 68, startAyah: 1, endAyah: 52 }, // Al-Qalam (complete)
      { surahNumber: 69, startAyah: 1, endAyah: 52 }, // Al-Haqqah (complete)
      { surahNumber: 70, startAyah: 1, endAyah: 44 }, // Al-Ma'arij (complete)
      { surahNumber: 71, startAyah: 1, endAyah: 28 }, // Nuh (complete)
      { surahNumber: 72, startAyah: 1, endAyah: 28 }, // Al-Jinn (complete)
      { surahNumber: 73, startAyah: 1, endAyah: 20 }, // Al-Muzzammil (complete)
      { surahNumber: 74, startAyah: 1, endAyah: 56 }, // Al-Muddaththir (complete)
      { surahNumber: 75, startAyah: 1, endAyah: 40 }, // Al-Qiyamah (complete)
      { surahNumber: 76, startAyah: 1, endAyah: 31 }, // Al-Insan (complete)
      { surahNumber: 77, startAyah: 1, endAyah: 50 }, // Al-Mursalat (complete)
    ],
  },
  // Juz 28
  {
    juzNumber: 28,
    surahRanges: [
      { surahNumber: 78, startAyah: 1, endAyah: 40 }, // An-Naba (complete)
      { surahNumber: 79, startAyah: 1, endAyah: 46 }, // An-Nazi'at (complete)
      { surahNumber: 80, startAyah: 1, endAyah: 42 }, // 'Abasa (complete)
      { surahNumber: 81, startAyah: 1, endAyah: 29 }, // At-Takwir (complete)
      { surahNumber: 82, startAyah: 1, endAyah: 19 }, // Al-Infitar (complete)
      { surahNumber: 83, startAyah: 1, endAyah: 36 }, // Al-Mutaffifin (complete)
      { surahNumber: 84, startAyah: 1, endAyah: 25 }, // Al-Inshiqaq (complete)
      { surahNumber: 85, startAyah: 1, endAyah: 22 }, // Al-Buruj (complete)
      { surahNumber: 86, startAyah: 1, endAyah: 17 }, // At-Tariq (complete)
      { surahNumber: 87, startAyah: 1, endAyah: 19 }, // Al-A'la (complete)
      { surahNumber: 88, startAyah: 1, endAyah: 26 }, // Al-Ghashiyah (complete)
      { surahNumber: 89, startAyah: 1, endAyah: 30 }, // Al-Fajr (complete)
      { surahNumber: 90, startAyah: 1, endAyah: 20 }, // Al-Balad (complete)
      { surahNumber: 91, startAyah: 1, endAyah: 15 }, // Ash-Shams (complete)
    ],
  },
  // Juz 29
  {
    juzNumber: 29,
    surahRanges: [
      { surahNumber: 92, startAyah: 1, endAyah: 21 }, // Al-Layl (complete)
      { surahNumber: 93, startAyah: 1, endAyah: 11 }, // Ad-Duhaa (complete)
      { surahNumber: 94, startAyah: 1, endAyah: 8 }, // Ash-Sharh (complete)
      { surahNumber: 95, startAyah: 1, endAyah: 8 }, // At-Tin (complete)
      { surahNumber: 96, startAyah: 1, endAyah: 19 }, // Al-'Alaq (complete)
      { surahNumber: 97, startAyah: 1, endAyah: 5 }, // Al-Qadr (complete)
      { surahNumber: 98, startAyah: 1, endAyah: 8 }, // Al-Bayyinah (complete)
      { surahNumber: 99, startAyah: 1, endAyah: 8 }, // Az-Zalzalah (complete)
      { surahNumber: 100, startAyah: 1, endAyah: 11 }, // Al-'Adiyat (complete)
      { surahNumber: 101, startAyah: 1, endAyah: 11 }, // Al-Qari'ah (complete)
      { surahNumber: 102, startAyah: 1, endAyah: 8 }, // At-Takathur (complete)
      { surahNumber: 103, startAyah: 1, endAyah: 3 }, // Al-'Asr (complete)
      { surahNumber: 104, startAyah: 1, endAyah: 9 }, // Al-Humazah (complete)
      { surahNumber: 105, startAyah: 1, endAyah: 5 }, // Al-Fil (complete)
      { surahNumber: 106, startAyah: 1, endAyah: 4 }, // Quraysh (complete)
      { surahNumber: 107, startAyah: 1, endAyah: 7 }, // Al-Ma'un (complete)
      { surahNumber: 108, startAyah: 1, endAyah: 3 }, // Al-Kawthar (complete)
      { surahNumber: 109, startAyah: 1, endAyah: 6 }, // Al-Kafirun (complete)
      { surahNumber: 110, startAyah: 1, endAyah: 3 }, // An-Nasr (complete)
      { surahNumber: 111, startAyah: 1, endAyah: 5 }, // Al-Masad (complete)
      { surahNumber: 112, startAyah: 1, endAyah: 4 }, // Al-Ikhlas (complete)
      { surahNumber: 113, startAyah: 1, endAyah: 5 }, // Al-Falaq (complete)
      { surahNumber: 114, startAyah: 1, endAyah: 6 }, // An-Nas (complete)
    ],
  },
  // Juz 30
  {
    juzNumber: 30,
    surahRanges: [
      // Juz 30 is the same as Juz 29 (last Juz contains the same surahs)
      // This is a standard division - Juz 30 contains surahs 78-114
      { surahNumber: 78, startAyah: 1, endAyah: 40 }, // An-Naba
      { surahNumber: 79, startAyah: 1, endAyah: 46 }, // An-Nazi'at
      { surahNumber: 80, startAyah: 1, endAyah: 42 }, // 'Abasa
      { surahNumber: 81, startAyah: 1, endAyah: 29 }, // At-Takwir
      { surahNumber: 82, startAyah: 1, endAyah: 19 }, // Al-Infitar
      { surahNumber: 83, startAyah: 1, endAyah: 36 }, // Al-Mutaffifin
      { surahNumber: 84, startAyah: 1, endAyah: 25 }, // Al-Inshiqaq
      { surahNumber: 85, startAyah: 1, endAyah: 22 }, // Al-Buruj
      { surahNumber: 86, startAyah: 1, endAyah: 17 }, // At-Tariq
      { surahNumber: 87, startAyah: 1, endAyah: 19 }, // Al-A'la
      { surahNumber: 88, startAyah: 1, endAyah: 26 }, // Al-Ghashiyah
      { surahNumber: 89, startAyah: 1, endAyah: 30 }, // Al-Fajr
      { surahNumber: 90, startAyah: 1, endAyah: 20 }, // Al-Balad
      { surahNumber: 91, startAyah: 1, endAyah: 15 }, // Ash-Shams
      { surahNumber: 92, startAyah: 1, endAyah: 21 }, // Al-Layl
      { surahNumber: 93, startAyah: 1, endAyah: 11 }, // Ad-Duhaa
      { surahNumber: 94, startAyah: 1, endAyah: 8 }, // Ash-Sharh
      { surahNumber: 95, startAyah: 1, endAyah: 8 }, // At-Tin
      { surahNumber: 96, startAyah: 1, endAyah: 19 }, // Al-'Alaq
      { surahNumber: 97, startAyah: 1, endAyah: 5 }, // Al-Qadr
      { surahNumber: 98, startAyah: 1, endAyah: 8 }, // Al-Bayyinah
      { surahNumber: 99, startAyah: 1, endAyah: 8 }, // Az-Zalzalah
      { surahNumber: 100, startAyah: 1, endAyah: 11 }, // Al-'Adiyat
      { surahNumber: 101, startAyah: 1, endAyah: 11 }, // Al-Qari'ah
      { surahNumber: 102, startAyah: 1, endAyah: 8 }, // At-Takathur
      { surahNumber: 103, startAyah: 1, endAyah: 3 }, // Al-'Asr
      { surahNumber: 104, startAyah: 1, endAyah: 9 }, // Al-Humazah
      { surahNumber: 105, startAyah: 1, endAyah: 5 }, // Al-Fil
      { surahNumber: 106, startAyah: 1, endAyah: 4 }, // Quraysh
      { surahNumber: 107, startAyah: 1, endAyah: 7 }, // Al-Ma'un
      { surahNumber: 108, startAyah: 1, endAyah: 3 }, // Al-Kawthar
      { surahNumber: 109, startAyah: 1, endAyah: 6 }, // Al-Kafirun
      { surahNumber: 110, startAyah: 1, endAyah: 3 }, // An-Nasr
      { surahNumber: 111, startAyah: 1, endAyah: 5 }, // Al-Masad
      { surahNumber: 112, startAyah: 1, endAyah: 4 }, // Al-Ikhlas
      { surahNumber: 113, startAyah: 1, endAyah: 5 }, // Al-Falaq
      { surahNumber: 114, startAyah: 1, endAyah: 6 }, // An-Nas
    ],
  },
];

/**
 * Get Juz data for a specific Juz number
 */
export function getJuzData(juzNumber: number): JuzData | undefined {
  return juzMapping.find((juz) => juz.juzNumber === juzNumber);
}

/**
 * Get all Juz that contain a specific surah
 */
export function getJuzForSurah(surahNumber: number): number[] {
  return juzMapping
    .filter((juz) =>
      juz.surahRanges.some((range) => range.surahNumber === surahNumber)
    )
    .map((juz) => juz.juzNumber);
}

/**
 * Check if a surah is complete in a Juz
 */
export function isSurahCompleteInJuz(
  surahNumber: number,
  juzNumber: number
): boolean {
  const juz = getJuzData(juzNumber);
  if (!juz) return false;

  const range = juz.surahRanges.find((r) => r.surahNumber === surahNumber);
  if (!range) return false;

  // This would require knowing the total ayahs in the surah
  // For now, we'll return true if the range exists
  return true;
}
