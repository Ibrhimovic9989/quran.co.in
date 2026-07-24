// Guided maqām lessons — mirrors apps/mobile/lib/data/maqam_lessons.dart.
// Each phrase stores a relative PITCH (0 low … 1 high) and DYNAMIC (0 soft … 1
// loud) plus a plain cue. This is the maqām's teaching shape (its register arc);
// the audio is a real reciter associated with that maqām's colour.

export interface LessonPhrase {
  arabic: string;
  translit: string;
  pitch: number;
  dynamic: number;
  cue: string;
}

export interface MaqamLesson {
  maqam: string;
  arabic: string;
  mood: string;
  shape: string;
  reciter: string;
  reciterFolder: string;
  phrases: LessonPhrase[];
}

export function lessonAudioUrl(l: MaqamLesson, i: number): string {
  return `https://everyayah.com/data/${l.reciterFolder}/001${String(i + 1).padStart(3, '0')}.mp3`;
}

const F = [
  ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'Bismillāhir-Raḥmānir-Raḥīm'],
  ['ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'Al-ḥamdu lillāhi Rabbil-ʿālamīn'],
  ['ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'Ar-Raḥmānir-Raḥīm'],
  ['مَٰلِكِ يَوْمِ ٱلدِّينِ', 'Māliki yawmid-dīn'],
  ['إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'Iyyāka naʿbudu wa iyyāka nastaʿīn'],
  ['ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'Ihdinaṣ-ṣirāṭal-mustaqīm'],
  ['صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', 'Ṣirāṭalladhīna anʿamta ʿalayhim…'],
];
const ph = (i: number, pitch: number, dynamic: number, cue: string): LessonPhrase => ({
  arabic: F[i][0], translit: F[i][1], pitch, dynamic, cue,
});

export const MAQAM_LESSONS: MaqamLesson[] = [
  {
    maqam: 'Bayati', arabic: 'البياتي', mood: 'Warm · grounded (traditionally)',
    shape: 'A low, gentle hill — Bayati barely leaves home. That closeness is its warmth.',
    reciter: 'Maḥmūd al-Ḥuṣarī', reciterFolder: 'Husary_128kbps',
    phrases: [
      ph(0, 0.34, 0.40, 'Begin low and warm — this is “home”.'),
      ph(1, 0.44, 0.52, 'Rise just a little; stay relaxed.'),
      ph(2, 0.40, 0.46, 'Ease gently back down.'),
      ph(3, 0.46, 0.52, 'A small lift.'),
      ph(4, 0.56, 0.62, 'Open up a touch — the gentle high point.'),
      ph(5, 0.48, 0.54, 'Stay warm, don’t reach too far.'),
      ph(6, 0.34, 0.40, 'Settle all the way back home.'),
    ],
  },
  {
    maqam: 'Hijaz', arabic: 'الحجاز', mood: 'Longing · calling out (traditionally)',
    shape: 'A dramatic leap high early — that wide jump is the “desert call”.',
    reciter: 'ʿAbdul Bāsiṭ ʿAbd uṣ-Ṣamad', reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    phrases: [
      ph(0, 0.40, 0.46, 'Start grounded and clear.'),
      ph(1, 0.70, 0.72, 'Now the big leap up — the “call”.'),
      ph(2, 0.62, 0.62, 'Hold the height, yearning.'),
      ph(3, 0.68, 0.66, 'Push upward again.'),
      ph(4, 0.86, 0.82, 'The peak — reach right out.'),
      ph(5, 0.60, 0.60, 'Begin to come down.'),
      ph(6, 0.40, 0.46, 'Land back home.'),
    ],
  },
  {
    maqam: 'Saba', arabic: 'الصبا', mood: 'Sorrowful · aching (traditionally)',
    shape: 'A low arc that keeps sinking — it reaches up, then falls back. The maqām of tears.',
    reciter: 'Muḥammad Ayyūb', reciterFolder: 'Muhammad_Ayyoub_128kbps',
    phrases: [
      ph(0, 0.42, 0.42, 'Start low and tender.'),
      ph(1, 0.50, 0.48, 'Try to rise…'),
      ph(2, 0.34, 0.40, '…but it pulls back down — the ache.'),
      ph(3, 0.40, 0.42, 'Stay compressed, restrained.'),
      ph(4, 0.52, 0.52, 'A brief lift.'),
      ph(5, 0.38, 0.42, 'Sink again, softly.'),
      ph(6, 0.30, 0.36, 'Come to rest, quiet.'),
    ],
  },
  {
    maqam: 'Ajam', arabic: 'العجم', mood: 'Bright · joyful (traditionally)',
    shape: 'A steady, bright climb to a joyful peak — Ajam is the “major” maqām: open and confident.',
    reciter: 'Muḥammad Ṣiddīq al-Minshāwī', reciterFolder: 'Minshawy_Mujawwad_192kbps',
    phrases: [
      ph(0, 0.46, 0.52, 'Start bright and clear.'),
      ph(1, 0.58, 0.62, 'Open upward.'),
      ph(2, 0.60, 0.62, 'Keep it bright.'),
      ph(3, 0.68, 0.68, 'Climb confidently.'),
      ph(4, 0.84, 0.82, 'Full, joyful peak.'),
      ph(5, 0.70, 0.70, 'Still bright and open.'),
      ph(6, 0.50, 0.56, 'Resolve, warm and open.'),
    ],
  },
];
