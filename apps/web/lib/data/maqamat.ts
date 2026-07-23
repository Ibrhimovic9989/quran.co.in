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

/** One rendition of the shared comparison passage in a given maqām.
 *  primaryUrl = "same reciter, same sūrah" teaching clip; fallbackUrl = a
 *  rock-solid everyayah clip used if the primary CDN ever fails. */
export interface MaqamClip {
  maqam: string;
  reciter: string;
  primaryUrl: string;
  fallbackUrl: string;
}

const everyayah = (folder: string) => `https://everyayah.com/data/${folder}/001001.mp3`;

/** "Hear the difference" — Sūrah Al-Fātiḥah across the maqāmāt (mostly Qārī
 *  Ibrāhīm Bakeer, one reciter, so only the melody changes). */
export const COMPARISON_PASSAGE = 'Sūrah Al-Fātiḥah';
export const MAQAM_COMPARISON: MaqamClip[] = [
  { maqam: 'Bayati', reciter: 'Murottal (Bayati)', primaryUrl: 'https://aac.saavncdn.com/244/a25b01599d76ff6a4322143c82f16ea8_320.mp4', fallbackUrl: everyayah('Husary_128kbps') },
  { maqam: 'Hijaz', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/c85dedd126f163e879419f0ed8351466_320.mp4', fallbackUrl: everyayah('Abdul_Basit_Mujawwad_128kbps') },
  { maqam: 'Saba', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/bfc13944e60f1871e5b3b96d4f5bb699_320.mp4', fallbackUrl: everyayah('Minshawy_Mujawwad_192kbps') },
  { maqam: 'Nahawand', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/1553ede369a7f4de3d2a497bc3ccbc7a_320.mp4', fallbackUrl: everyayah('Minshawy_Mujawwad_192kbps') },
  { maqam: 'Rast', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/92d41d5af3f8748518dcc0decdcec75d_320.mp4', fallbackUrl: everyayah('Husary_128kbps') },
  { maqam: 'Sikah', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/529/24f473863ecfa728739afa7f4fa101bb_320.mp4', fallbackUrl: everyayah('Mustafa_Ismail_48kbps') },
  { maqam: 'Ajam', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/2d0aa243aa6e74267a2e476fbd792f7e_320.mp4', fallbackUrl: everyayah('Abdurrahmaan_As-Sudais_192kbps') },
  { maqam: 'Kurd', reciter: 'Qārī Ibrāhīm Bakeer', primaryUrl: 'https://aac.saavncdn.com/699/05f886866d07981419f03aef0c7e08e4_320.mp4', fallbackUrl: everyayah('Alafasy_128kbps') },
];

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
