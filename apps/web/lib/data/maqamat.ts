// The eight core maqāmāt — the melodic modes of Qur'anic recitation.
// Maqām is a property of a reciter's melody, not of the text, so this is a
// curated teaching module. Example audio streams from everyayah.com.
// Mirrors apps/mobile/lib/data/maqamat.dart.

export interface Maqam {
  name: string;
  arabic: string;
  mood: string;
  character: string;
  whenUsed: string;
  reciter: string;
  reciterFolder: string;
  surah: number;
  ayah: number;
  surahName: string;
}

export function maqamAudioUrl(m: Maqam): string {
  const s = String(m.surah).padStart(3, '0');
  const a = String(m.ayah).padStart(3, '0');
  return `https://everyayah.com/data/${m.reciterFolder}/${s}${a}.mp3`;
}

export const MAQAMAT: Maqam[] = [
  {
    name: 'Bayati', arabic: 'البياتي', mood: 'Warm · grounding',
    character:
      'The “home base” of recitation — warm, gentle and contemplative. Most reciters open and close in Bayati, so it is the first mode to internalise.',
    whenUsed: 'General recitation, spiritual and reflective passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad', reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 1, ayah: 2, surahName: 'Al-Fātiḥa',
  },
  {
    name: 'Hijaz', arabic: 'الحجاز', mood: 'Longing · poignant',
    character:
      'A yearning, “calling-out” sound full of pathos — the desert-longing colour. Instantly recognisable and deeply moving.',
    whenUsed: 'Duʿāʾ, verses of warning, and tragic or stirring passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad', reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 36, ayah: 1, surahName: 'Yā-Sīn',
  },
  {
    name: 'Saba', arabic: 'الصبا', mood: 'Sorrowful · tender',
    character:
      'Sadness and humility that softens the heart, with a distinctive plaintive lean. Meditative and tearful.',
    whenUsed: 'Repentance, reflection on the hereafter, softening the heart.',
    reciter: 'Muhammad Ayyoub', reciterFolder: 'Muhammad_Ayyoub_128kbps',
    surah: 23, ayah: 1, surahName: 'Al-Muʾminūn',
  },
  {
    name: 'Nahawand', arabic: 'النهاوند', mood: 'Emotive · reflective',
    character:
      'A soft, minor-key feel (close to Western minor) — emotional yet composed. Blends beautifully between other modes.',
    whenUsed: 'Emotive passages and transitions between modes.',
    reciter: 'Abdul Basit ʿAbd us-Samad', reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 3, ayah: 26, surahName: 'Āl ʿImrān',
  },
  {
    name: 'Rast', arabic: 'الرست', mood: 'Grand · stable',
    character:
      'Confident, balanced and majestic — a “major-key” feel. A foundational mode used for declarative, weighty verses.',
    whenUsed: 'Storytelling, divine wisdom, and declarative verses.',
    reciter: 'Muhammad Ṣiddīq al-Minshāwī', reciterFolder: 'Minshawy_Mujawwad_192kbps',
    surah: 2, ayah: 255, surahName: 'Āyat al-Kursī',
  },
  {
    name: 'Sikah', arabic: 'السيكاه', mood: 'Tender · tranquil',
    character:
      'A gentle, affectionate colour with a distinctive quarter-tone — the signature of the Egyptian mujawwad tradition.',
    whenUsed: 'Peaceful, intimate passages.',
    reciter: 'Muhammad al-Ṭablāwī', reciterFolder: 'Mohammad_al_Tablaway_128kbps',
    surah: 93, ayah: 1, surahName: 'Aḍ-Ḍuḥā',
  },
  {
    name: 'Ajam', arabic: 'العجم', mood: 'Bright · joyful',
    character:
      'Open, bright and uplifting — the closest to a Western major scale. Celebratory in feel.',
    whenUsed: 'Glad tidings, descriptions of Paradise and blessings.',
    reciter: 'Muhammad Ṣiddīq al-Minshāwī', reciterFolder: 'Minshawy_Mujawwad_192kbps',
    surah: 55, ayah: 1, surahName: 'Ar-Raḥmān',
  },
  {
    name: 'Kurd', arabic: 'الكرد', mood: 'Calm · intimate',
    character:
      'Soft, calm and intimate — a gentle mode favoured in much contemporary recitation.',
    whenUsed: 'Gentle, reflective passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad', reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 89, ayah: 27, surahName: 'Al-Fajr',
  },
];
