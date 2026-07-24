// Guided maqām lessons — the teaching data behind the pitch-ribbon.
//
// Each lesson walks Sūrah Al-Fātiḥah phrase by phrase. For every phrase we
// store a relative PITCH height (0 = bottom of the low register, 1 = top of
// the high register) and a DYNAMIC (0 soft … 1 loud), plus a plain-language
// cue. These describe the maqām's characteristic *shape* (its sayr / register
// arc) — an authored teaching diagram, the way ReciteInTune draws "where to go
// up and down". The audio is a real reciter associated with that maqām's colour.
//
// Structure (from the research): recitation climbs the three registers —
// Qarār (low, calm) → Jawāb (middle, rising) → Jawāb al-Jawāb (high peak) —
// then resolves home. The low→rise→peak→home arc is structural; the exact
// loud/soft is the reciter's expression.

class LessonPhrase {
  final String arabic;
  final String translit;
  final double pitch; // 0..1 relative register height
  final double dynamic; // 0..1 loudness
  final String cue; // what to do here

  const LessonPhrase(this.arabic, this.translit, this.pitch, this.dynamic, this.cue);
}

class MaqamLesson {
  final String maqam;
  final String arabic;
  final String mood; // traditional colour (worded as association)
  final String shape; // one-line description of the contour archetype
  final String reciter; // example reciter (associated with this colour)
  final String reciterFolder; // everyayah data folder
  final List<LessonPhrase> phrases;

  const MaqamLesson({
    required this.maqam,
    required this.arabic,
    required this.mood,
    required this.shape,
    required this.reciter,
    required this.reciterFolder,
    required this.phrases,
  });

  /// everyayah per-ayah URL for phrase [i] (Sūrah Al-Fātiḥah, ayah i+1).
  String audioUrl(int i) =>
      'https://everyayah.com/data/$reciterFolder/001${(i + 1).toString().padLeft(3, '0')}.mp3';
}

// Sūrah Al-Fātiḥah, phrase = ayah. Arabic + transliteration shared across modes.
const _fatiha = [
  ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'Bismillāhir-Raḥmānir-Raḥīm'],
  ['ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'Al-ḥamdu lillāhi Rabbil-ʿālamīn'],
  ['ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'Ar-Raḥmānir-Raḥīm'],
  ['مَٰلِكِ يَوْمِ ٱلدِّينِ', 'Māliki yawmid-dīn'],
  ['إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'Iyyāka naʿbudu wa iyyāka nastaʿīn'],
  ['ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'Ihdinaṣ-ṣirāṭal-mustaqīm'],
  ['صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', 'Ṣirāṭalladhīna anʿamta ʿalayhim, ghayril-maghḍūbi ʿalayhim wa laḍ-ḍāllīn'],
];

LessonPhrase _p(int i, double pitch, double dyn, String cue) =>
    LessonPhrase(_fatiha[i][0], _fatiha[i][1], pitch, dyn, cue);

final List<MaqamLesson> kMaqamLessons = [
  MaqamLesson(
    maqam: 'Bayati',
    arabic: 'البياتي',
    mood: 'Warm · grounded (traditionally)',
    shape: 'A low, gentle hill — Bayati barely leaves home. That closeness is its warmth.',
    reciter: 'Maḥmūd al-Ḥuṣarī',
    reciterFolder: 'Husary_128kbps',
    phrases: [
      _p(0, 0.34, 0.40, 'Begin low and warm — this is “home”.'),
      _p(1, 0.44, 0.52, 'Rise just a little; stay relaxed.'),
      _p(2, 0.40, 0.46, 'Ease gently back down.'),
      _p(3, 0.46, 0.52, 'A small lift.'),
      _p(4, 0.56, 0.62, 'Open up a touch — the gentle high point.'),
      _p(5, 0.48, 0.54, 'Stay warm, don’t reach too far.'),
      _p(6, 0.34, 0.40, 'Settle all the way back home.'),
    ],
  ),
  MaqamLesson(
    maqam: 'Hijaz',
    arabic: 'الحجاز',
    mood: 'Longing · calling out (traditionally)',
    shape: 'A dramatic leap high early — that wide jump is the “desert call”.',
    reciter: 'ʿAbdul Bāsiṭ ʿAbd uṣ-Ṣamad',
    reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    phrases: [
      _p(0, 0.40, 0.46, 'Start grounded and clear.'),
      _p(1, 0.70, 0.72, 'Now the big leap up — the “call”.'),
      _p(2, 0.62, 0.62, 'Hold the height, yearning.'),
      _p(3, 0.68, 0.66, 'Push upward again.'),
      _p(4, 0.86, 0.82, 'The peak — reach right out.'),
      _p(5, 0.60, 0.60, 'Begin to come down.'),
      _p(6, 0.40, 0.46, 'Land back home.'),
    ],
  ),
  MaqamLesson(
    maqam: 'Saba',
    arabic: 'الصبا',
    mood: 'Sorrowful · aching (traditionally)',
    shape: 'A low arc that keeps sinking — it reaches up, then falls back. The maqām of tears.',
    reciter: 'Muḥammad Ayyūb',
    reciterFolder: 'Muhammad_Ayyoub_128kbps',
    phrases: [
      _p(0, 0.42, 0.42, 'Start low and tender.'),
      _p(1, 0.50, 0.48, 'Try to rise…'),
      _p(2, 0.34, 0.40, '…but it pulls back down — the ache.'),
      _p(3, 0.40, 0.42, 'Stay compressed, restrained.'),
      _p(4, 0.52, 0.52, 'A brief lift.'),
      _p(5, 0.38, 0.42, 'Sink again, softly.'),
      _p(6, 0.30, 0.36, 'Come to rest, quiet.'),
    ],
  ),
  MaqamLesson(
    maqam: 'Ajam',
    arabic: 'العجم',
    mood: 'Bright · joyful (traditionally)',
    shape: 'A steady, bright climb to a joyful peak — Ajam is the “major” maqām: open and confident.',
    reciter: 'Muḥammad Ṣiddīq al-Minshāwī',
    reciterFolder: 'Minshawy_Mujawwad_192kbps',
    phrases: [
      _p(0, 0.46, 0.52, 'Start bright and clear.'),
      _p(1, 0.58, 0.62, 'Open upward.'),
      _p(2, 0.60, 0.62, 'Keep it bright.'),
      _p(3, 0.68, 0.68, 'Climb confidently.'),
      _p(4, 0.84, 0.82, 'Full, joyful peak.'),
      _p(5, 0.70, 0.70, 'Still bright and open.'),
      _p(6, 0.50, 0.56, 'Resolve, warm and open.'),
    ],
  ),
];
