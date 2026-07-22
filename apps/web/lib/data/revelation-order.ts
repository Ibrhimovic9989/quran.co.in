// Revelation Order Data
// Chronological order of Quranic surahs based on when they were revealed
// Based on scholarly consensus and Tanzil.net ordering

export interface RevelationOrderEntry {
  revelationOrder: number; // Order in which it was revealed (1 = first revealed)
  surahNumber: number; // Standard Mushaf order (1-114)
  revelationPlace: 'Meccan' | 'Medinan';
}

export const revelationOrder: RevelationOrderEntry[] = [
  // Meccan Period (First 13 years)
  { revelationOrder: 1, surahNumber: 96, revelationPlace: 'Meccan' }, // Al-'Alaq
  { revelationOrder: 2, surahNumber: 68, revelationPlace: 'Meccan' }, // Al-Qalam
  { revelationOrder: 3, surahNumber: 73, revelationPlace: 'Meccan' }, // Al-Muzzammil
  { revelationOrder: 4, surahNumber: 74, revelationPlace: 'Meccan' }, // Al-Muddaththir
  { revelationOrder: 5, surahNumber: 1, revelationPlace: 'Meccan' }, // Al-Fatihah
  { revelationOrder: 6, surahNumber: 111, revelationPlace: 'Meccan' }, // Al-Masad
  { revelationOrder: 7, surahNumber: 81, revelationPlace: 'Meccan' }, // At-Takwir
  { revelationOrder: 8, surahNumber: 87, revelationPlace: 'Meccan' }, // Al-A'la
  { revelationOrder: 9, surahNumber: 92, revelationPlace: 'Meccan' }, // Al-Layl
  { revelationOrder: 10, surahNumber: 89, revelationPlace: 'Meccan' }, // Al-Fajr
  { revelationOrder: 11, surahNumber: 93, revelationPlace: 'Meccan' }, // Ad-Duhaa
  { revelationOrder: 12, surahNumber: 94, revelationPlace: 'Meccan' }, // Ash-Sharh
  { revelationOrder: 13, surahNumber: 103, revelationPlace: 'Meccan' }, // Al-'Asr
  { revelationOrder: 14, surahNumber: 100, revelationPlace: 'Meccan' }, // Al-'Adiyat
  { revelationOrder: 15, surahNumber: 108, revelationPlace: 'Meccan' }, // Al-Kawthar
  { revelationOrder: 16, surahNumber: 102, revelationPlace: 'Meccan' }, // At-Takathur
  { revelationOrder: 17, surahNumber: 107, revelationPlace: 'Meccan' }, // Al-Ma'un
  { revelationOrder: 18, surahNumber: 109, revelationPlace: 'Meccan' }, // Al-Kafirun
  { revelationOrder: 19, surahNumber: 105, revelationPlace: 'Meccan' }, // Al-Fil
  { revelationOrder: 20, surahNumber: 113, revelationPlace: 'Meccan' }, // Al-Falaq
  { revelationOrder: 21, surahNumber: 114, revelationPlace: 'Meccan' }, // An-Nas
  { revelationOrder: 22, surahNumber: 112, revelationPlace: 'Meccan' }, // Al-Ikhlas
  { revelationOrder: 23, surahNumber: 53, revelationPlace: 'Meccan' }, // An-Najm
  { revelationOrder: 24, surahNumber: 80, revelationPlace: 'Meccan' }, // 'Abasa
  { revelationOrder: 25, surahNumber: 97, revelationPlace: 'Meccan' }, // Al-Qadr
  { revelationOrder: 26, surahNumber: 91, revelationPlace: 'Meccan' }, // Ash-Shams
  { revelationOrder: 27, surahNumber: 85, revelationPlace: 'Meccan' }, // Al-Buruj
  { revelationOrder: 28, surahNumber: 95, revelationPlace: 'Meccan' }, // At-Tin
  { revelationOrder: 29, surahNumber: 106, revelationPlace: 'Meccan' }, // Quraysh
  { revelationOrder: 30, surahNumber: 101, revelationPlace: 'Meccan' }, // Al-Qari'ah
  { revelationOrder: 31, surahNumber: 75, revelationPlace: 'Meccan' }, // Al-Qiyamah
  { revelationOrder: 32, surahNumber: 104, revelationPlace: 'Meccan' }, // Al-Humazah
  { revelationOrder: 33, surahNumber: 77, revelationPlace: 'Meccan' }, // Al-Mursalat
  { revelationOrder: 34, surahNumber: 50, revelationPlace: 'Meccan' }, // Qaf
  { revelationOrder: 35, surahNumber: 90, revelationPlace: 'Meccan' }, // Al-Balad
  { revelationOrder: 36, surahNumber: 86, revelationPlace: 'Meccan' }, // At-Tariq
  { revelationOrder: 37, surahNumber: 54, revelationPlace: 'Meccan' }, // Al-Qamar
  { revelationOrder: 38, surahNumber: 38, revelationPlace: 'Meccan' }, // Sad
  { revelationOrder: 39, surahNumber: 7, revelationPlace: 'Meccan' }, // Al-A'raf
  { revelationOrder: 40, surahNumber: 72, revelationPlace: 'Meccan' }, // Al-Jinn
  { revelationOrder: 41, surahNumber: 36, revelationPlace: 'Meccan' }, // Ya-Sin
  { revelationOrder: 42, surahNumber: 25, revelationPlace: 'Meccan' }, // Al-Furqan
  { revelationOrder: 43, surahNumber: 35, revelationPlace: 'Meccan' }, // Fatir
  { revelationOrder: 44, surahNumber: 19, revelationPlace: 'Meccan' }, // Maryam
  { revelationOrder: 45, surahNumber: 20, revelationPlace: 'Meccan' }, // Ta-Ha
  { revelationOrder: 46, surahNumber: 56, revelationPlace: 'Meccan' }, // Al-Waqi'ah
  { revelationOrder: 47, surahNumber: 26, revelationPlace: 'Meccan' }, // Ash-Shu'ara
  { revelationOrder: 48, surahNumber: 27, revelationPlace: 'Meccan' }, // An-Naml
  { revelationOrder: 49, surahNumber: 28, revelationPlace: 'Meccan' }, // Al-Qasas
  { revelationOrder: 50, surahNumber: 17, revelationPlace: 'Meccan' }, // Al-Isra
  { revelationOrder: 51, surahNumber: 10, revelationPlace: 'Meccan' }, // Yunus
  { revelationOrder: 52, surahNumber: 11, revelationPlace: 'Meccan' }, // Hud
  { revelationOrder: 53, surahNumber: 12, revelationPlace: 'Meccan' }, // Yusuf
  { revelationOrder: 54, surahNumber: 15, revelationPlace: 'Meccan' }, // Al-Hijr
  { revelationOrder: 55, surahNumber: 6, revelationPlace: 'Meccan' }, // Al-An'am
  { revelationOrder: 56, surahNumber: 37, revelationPlace: 'Meccan' }, // As-Saffat
  { revelationOrder: 57, surahNumber: 31, revelationPlace: 'Meccan' }, // Luqman
  { revelationOrder: 58, surahNumber: 34, revelationPlace: 'Meccan' }, // Saba
  { revelationOrder: 59, surahNumber: 39, revelationPlace: 'Meccan' }, // Az-Zumar
  { revelationOrder: 60, surahNumber: 40, revelationPlace: 'Meccan' }, // Ghafir
  { revelationOrder: 61, surahNumber: 41, revelationPlace: 'Meccan' }, // Fussilat
  { revelationOrder: 62, surahNumber: 42, revelationPlace: 'Meccan' }, // Ash-Shura
  { revelationOrder: 63, surahNumber: 43, revelationPlace: 'Meccan' }, // Az-Zukhruf
  { revelationOrder: 64, surahNumber: 44, revelationPlace: 'Meccan' }, // Ad-Dukhan
  { revelationOrder: 65, surahNumber: 45, revelationPlace: 'Meccan' }, // Al-Jathiyah
  { revelationOrder: 66, surahNumber: 46, revelationPlace: 'Meccan' }, // Al-Ahqaf
  { revelationOrder: 67, surahNumber: 51, revelationPlace: 'Meccan' }, // Adh-Dhariyat
  { revelationOrder: 68, surahNumber: 88, revelationPlace: 'Meccan' }, // Al-Ghashiyah
  { revelationOrder: 69, surahNumber: 18, revelationPlace: 'Meccan' }, // Al-Kahf
  { revelationOrder: 70, surahNumber: 16, revelationPlace: 'Meccan' }, // An-Nahl
  { revelationOrder: 71, surahNumber: 71, revelationPlace: 'Meccan' }, // Nuh
  { revelationOrder: 72, surahNumber: 14, revelationPlace: 'Meccan' }, // Ibrahim
  { revelationOrder: 73, surahNumber: 21, revelationPlace: 'Meccan' }, // Al-Anbiya
  { revelationOrder: 74, surahNumber: 23, revelationPlace: 'Meccan' }, // Al-Mu'minun
  { revelationOrder: 75, surahNumber: 32, revelationPlace: 'Meccan' }, // As-Sajdah
  { revelationOrder: 76, surahNumber: 52, revelationPlace: 'Meccan' }, // At-Tur
  { revelationOrder: 77, surahNumber: 67, revelationPlace: 'Meccan' }, // Al-Mulk
  { revelationOrder: 78, surahNumber: 69, revelationPlace: 'Meccan' }, // Al-Haqqah
  { revelationOrder: 79, surahNumber: 70, revelationPlace: 'Meccan' }, // Al-Ma'arij
  { revelationOrder: 80, surahNumber: 78, revelationPlace: 'Meccan' }, // An-Naba
  { revelationOrder: 81, surahNumber: 79, revelationPlace: 'Meccan' }, // An-Nazi'at
  { revelationOrder: 82, surahNumber: 82, revelationPlace: 'Meccan' }, // Al-Infitar
  { revelationOrder: 83, surahNumber: 84, revelationPlace: 'Meccan' }, // Al-Inshiqaq
  { revelationOrder: 84, surahNumber: 30, revelationPlace: 'Meccan' }, // Ar-Rum
  { revelationOrder: 85, surahNumber: 29, revelationPlace: 'Meccan' }, // Al-'Ankabut
  { revelationOrder: 86, surahNumber: 83, revelationPlace: 'Meccan' }, // Al-Mutaffifin

  // Medinan Period (Last 10 years)
  { revelationOrder: 87, surahNumber: 2, revelationPlace: 'Medinan' }, // Al-Baqarah
  { revelationOrder: 88, surahNumber: 8, revelationPlace: 'Medinan' }, // Al-Anfal
  { revelationOrder: 89, surahNumber: 3, revelationPlace: 'Medinan' }, // Ali 'Imran
  { revelationOrder: 90, surahNumber: 33, revelationPlace: 'Medinan' }, // Al-Ahzab
  { revelationOrder: 91, surahNumber: 60, revelationPlace: 'Medinan' }, // Al-Mumtahanah
  { revelationOrder: 92, surahNumber: 4, revelationPlace: 'Medinan' }, // An-Nisa
  { revelationOrder: 93, surahNumber: 99, revelationPlace: 'Medinan' }, // Az-Zalzalah
  { revelationOrder: 94, surahNumber: 57, revelationPlace: 'Medinan' }, // Al-Hadid
  { revelationOrder: 95, surahNumber: 47, revelationPlace: 'Medinan' }, // Muhammad
  { revelationOrder: 96, surahNumber: 13, revelationPlace: 'Medinan' }, // Ar-Ra'd
  { revelationOrder: 97, surahNumber: 55, revelationPlace: 'Medinan' }, // Ar-Rahman
  { revelationOrder: 98, surahNumber: 76, revelationPlace: 'Medinan' }, // Al-Insan
  { revelationOrder: 99, surahNumber: 65, revelationPlace: 'Medinan' }, // At-Talaq
  { revelationOrder: 100, surahNumber: 98, revelationPlace: 'Medinan' }, // Al-Bayyinah
  { revelationOrder: 101, surahNumber: 59, revelationPlace: 'Medinan' }, // Al-Hashr
  { revelationOrder: 102, surahNumber: 24, revelationPlace: 'Medinan' }, // An-Nur
  { revelationOrder: 103, surahNumber: 22, revelationPlace: 'Medinan' }, // Al-Hajj
  { revelationOrder: 104, surahNumber: 63, revelationPlace: 'Medinan' }, // Al-Munafiqun
  { revelationOrder: 105, surahNumber: 58, revelationPlace: 'Medinan' }, // Al-Mujadila
  { revelationOrder: 106, surahNumber: 49, revelationPlace: 'Medinan' }, // Al-Hujurat
  { revelationOrder: 107, surahNumber: 66, revelationPlace: 'Medinan' }, // At-Tahrim
  { revelationOrder: 108, surahNumber: 64, revelationPlace: 'Medinan' }, // At-Taghabun
  { revelationOrder: 109, surahNumber: 61, revelationPlace: 'Medinan' }, // As-Saff
  { revelationOrder: 110, surahNumber: 62, revelationPlace: 'Medinan' }, // Al-Jumu'ah
  { revelationOrder: 111, surahNumber: 48, revelationPlace: 'Medinan' }, // Al-Fath
  { revelationOrder: 112, surahNumber: 5, revelationPlace: 'Medinan' }, // Al-Ma'idah
  { revelationOrder: 113, surahNumber: 9, revelationPlace: 'Medinan' }, // At-Tawbah
  { revelationOrder: 114, surahNumber: 110, revelationPlace: 'Medinan' }, // An-Nasr
];

/**
 * Get revelation order for a specific surah number
 */
export function getRevelationOrder(surahNumber: number): number | undefined {
  const entry = revelationOrder.find((e) => e.surahNumber === surahNumber);
  return entry?.revelationOrder;
}

/**
 * Get surahs sorted by revelation order
 */
export function getSurahsByRevelationOrder(): RevelationOrderEntry[] {
  return [...revelationOrder].sort((a, b) => a.revelationOrder - b.revelationOrder);
}

/**
 * Get surahs sorted by Mushaf order (standard 1-114)
 */
export function getSurahsByMushafOrder(): RevelationOrderEntry[] {
  return [...revelationOrder].sort((a, b) => a.surahNumber - b.surahNumber);
}
