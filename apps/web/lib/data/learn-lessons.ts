// Learn to Read — the Noorani-Qāʿidah arc, from the 29 letters to reading real
// Qurʾānic words. Mirrors apps/mobile/lib/data/learn_lessons.dart field-for-field.
// Keep the two in sync.
//
// - The four positional forms are produced with Unicode ZWJ (U+200D) so the
//   font shapes them correctly — we never hand-author glyphs.
// - The vowel/tanwīn drills are GENERATED from the letter set + marks.
// - Per-letter audio is a slot (null for now); word/āyah audio streams Ḥuṣarī
//   "Muʿallim" (teaching) recitation.

// ── Arabic diacritics (combining marks) ──────────────────────────────────────
const FAT = 'َ'; // fatḥah  a
const KAS = 'ِ'; // kasrah  i
const DAM = 'ُ'; // ḍammah  u
const FATN = 'ً'; // fatḥatayn  an
const KASN = 'ٍ'; // kasratayn  in
const DAMN = 'ٌ'; // ḍammatayn  un
const SHD = 'ّ'; // shaddah (doubled)
const ZWJ = '‍';

export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  end: string;
}

export function formsOf(glyph: string): LetterForms {
  return {
    isolated: glyph,
    initial: `${glyph}${ZWJ}`,
    medial: `${ZWJ}${glyph}${ZWJ}`,
    end: `${ZWJ}${glyph}`,
  };
}

export interface QLetter {
  glyph: string;
  name: string; // "Bāʾ"
  nameAr: string; // "باء"
  sound: string; // "b", "th", "ḥ"
  region: string; // Throat / Tongue / Lips / Nasal / Cavity
  makhraj: string; // where/how it is articulated
  tip: string; // a teacher's physical self-check cue
  sun: boolean; // sun letter
  connects: boolean; // joins to the letter on its left
  heavy: boolean; // mufakhkham
  qalqalah: boolean; // bounces on sukūn
  audio: string | null; // per-letter recording slot (commissioned later)
}

function L(
  glyph: string,
  name: string,
  nameAr: string,
  sound: string,
  region: string,
  makhraj: string,
  tip: string,
  opts: Partial<Pick<QLetter, 'sun' | 'connects' | 'heavy' | 'qalqalah'>> = {},
): QLetter {
  return {
    glyph,
    name,
    nameAr,
    sound,
    region,
    makhraj,
    tip,
    sun: opts.sun ?? false,
    connects: opts.connects ?? true,
    heavy: opts.heavy ?? false,
    qalqalah: opts.qalqalah ?? false,
    audio: null,
  };
}

// ── The 29 letters, in Qāʿidah order (alif → hamza) ──────────────────────────
export const LETTERS: QLetter[] = [
  L('ا', 'Alif', 'ألف', 'ā', 'Cavity',
    'An open carrier — it has no sound of its own; it stretches the fatḥah before it.',
    'Nothing touches — the breath flows out freely.', { connects: false }),
  L('ب', 'Bāʾ', 'باء', 'b', 'Lips', 'Both lips pressed together, then released.',
    'Feel your two lips meet.', { qalqalah: true }),
  L('ت', 'Tāʾ', 'تاء', 't', 'Tongue', 'Tip of the tongue on the roots of the upper front teeth.',
    'Tongue-tip taps just behind the top teeth.', { sun: true }),
  L('ث', 'Thāʾ', 'ثاء', 'th', 'Tongue', 'Tongue-tip lightly between the teeth — like “think”.',
    'Tongue peeks between the teeth.', { sun: true }),
  L('ج', 'Jīm', 'جيم', 'j', 'Tongue', 'Middle of the tongue rises to the roof of the mouth.',
    'Mid-tongue presses the palate.', { qalqalah: true }),
  L('ح', 'Ḥāʾ', 'حاء', 'ḥ', 'Throat', 'Middle of the throat — a deep, breathy H.',
    'Hand on throat — feel the middle constrict.'),
  L('خ', 'Khāʾ', 'خاء', 'kh', 'Throat', 'Top of the throat — like gently clearing it.',
    'A heavy, raspy sound at the throat’s top.', { heavy: true }),
  L('د', 'Dāl', 'دال', 'd', 'Tongue', 'Tip of the tongue on the roots of the upper front teeth.',
    'Like ت but voiced — feel it buzz.', { sun: true, connects: false, qalqalah: true }),
  L('ذ', 'Dhāl', 'ذال', 'dh', 'Tongue', 'Tongue-tip between the teeth, voiced — like “this”.',
    'Between the teeth, with a buzz.', { sun: true, connects: false }),
  L('ر', 'Rāʾ', 'راء', 'r', 'Tongue', 'Tip of the tongue trills near the gum ridge.',
    'A light roll of the tongue-tip.', { sun: true, connects: false }),
  L('ز', 'Zāy', 'زاي', 'z', 'Tongue', 'Tongue-tip near the lower teeth — a whistling Z.',
    'A buzzing whistle behind the teeth.', { sun: true, connects: false }),
  L('س', 'Sīn', 'سين', 's', 'Tongue', 'Tongue-tip near the lower teeth — a thin whistling S.',
    'A soft hiss — no voice.', { sun: true }),
  L('ش', 'Shīn', 'شين', 'sh', 'Tongue', 'Middle of the tongue spreads toward the palate.',
    'Air spreads across the tongue — “sh”.', { sun: true }),
  L('ص', 'Ṣād', 'صاد', 'ṣ', 'Tongue', 'Heavy S — the tongue hollows and the mouth fills.',
    'Say س, then make the mouth round and heavy.', { sun: true, heavy: true }),
  L('ض', 'Ḍād', 'ضاد', 'ḍ', 'Tongue', 'Side of the tongue presses the upper molars — heavy D.',
    'The tongue’s edge pushes the back teeth.', { sun: true, heavy: true }),
  L('ط', 'Ṭāʾ', 'طاء', 'ṭ', 'Tongue', 'Heavy T — tongue-tip on the teeth roots, mouth full.',
    'Say ت, then make it heavy and full.', { sun: true, heavy: true, qalqalah: true }),
  L('ظ', 'Ẓāʾ', 'ظاء', 'ẓ', 'Tongue', 'Heavy DH — tongue between the teeth, mouth full.',
    'Say ذ, then make it heavy.', { sun: true, heavy: true }),
  L('ع', 'ʿAyn', 'عين', 'ʿ', 'Throat', 'Middle of the throat — a firm, voiced squeeze.',
    'Constrict mid-throat — no English match.'),
  L('غ', 'Ghayn', 'غين', 'gh', 'Throat', 'Top of the throat — like a soft gargle.',
    'A gargling sound at the throat’s top.', { heavy: true }),
  L('ف', 'Fāʾ', 'فاء', 'f', 'Lips', 'Lower lip touches the upper front teeth.',
    'Feel teeth on your lower lip.'),
  L('ق', 'Qāf', 'قاف', 'q', 'Tongue', 'Deepest back of the tongue meets the soft palate — heavy K.',
    'A deep K from the back — heavy.', { heavy: true, qalqalah: true }),
  L('ك', 'Kāf', 'كاف', 'k', 'Tongue', 'Back of the tongue, just forward of ق — a light K.',
    'Like ق but lighter and forward.'),
  L('ل', 'Lām', 'لام', 'l', 'Tongue', 'Tongue-tip on the gum ridge behind the upper teeth.',
    'Tongue-tip up to the gum.', { sun: true }),
  L('م', 'Mīm', 'ميم', 'm', 'Lips', 'Both lips meet; sound resonates in the nose.',
    'Lips closed, hum through the nose.'),
  L('ن', 'Nūn', 'نون', 'n', 'Tongue', 'Tongue-tip on the gum; sound resonates in the nose.',
    'Tongue-tip up, hum through the nose.', { sun: true }),
  L('ه', 'Hāʾ', 'هاء', 'h', 'Throat', 'Deepest part of the throat — a soft breath H.',
    'A gentle H from deep in the throat.'),
  L('و', 'Wāw', 'واو', 'w', 'Lips', 'Rounded lips (W); as a madd letter it stretches a ḍammah.',
    'Round your lips.', { connects: false }),
  L('ي', 'Yāʾ', 'ياء', 'y', 'Tongue', 'Middle of the tongue (Y); as a madd letter it stretches a kasrah.',
    'Mid-tongue toward the palate.'),
  L('ء', 'Hamza', 'همزة', 'ʾ', 'Throat', 'A clean glottal stop — the catch in “uh-oh”.',
    'Snap the throat shut, then open.', { connects: false }),
];

// ── Reading tokens / rows ────────────────────────────────────────────────────
export interface LearnToken {
  ar: string;
  translit: string;
  spell?: string;
  audioRef?: string; // "surah:ayah"
}
export interface LearnRow {
  tokens: LearnToken[];
}
export interface LearnContrast {
  a: string;
  b: string;
  note: string;
}
export interface LearnBridge {
  ref: string; // "surah:ayah"
  word: string;
  translit: string;
  note: string;
}
export type LearnKind = 'letters' | 'forms' | 'muqatta' | 'syllables' | 'drill' | 'revision';

export interface LearnLesson {
  number: number;
  title: string;
  titleAr: string;
  kind: LearnKind;
  teach: string;
  tip?: string;
  letters: number[]; // indices into LETTERS
  rows: LearnRow[];
  contrasts: LearnContrast[];
  bridge?: LearnBridge;
  slug: string;
}

const t = (ar: string, translit: string, extra: Partial<LearnToken> = {}): LearnToken => ({ ar, translit, ...extra });
const row = (...tokens: LearnToken[]): LearnRow => ({ tokens });

// ── Drill generators (complete & typo-proof) ─────────────────────────────────
const CONS = LETTERS.map((_, i) => i).filter((i) => LETTERS[i].glyph !== 'ا');

const harakatRows = (): LearnRow[] =>
  CONS.map((i) =>
    row(
      t(LETTERS[i].glyph + FAT, `${LETTERS[i].sound}a`),
      t(LETTERS[i].glyph + KAS, `${LETTERS[i].sound}i`),
      t(LETTERS[i].glyph + DAM, `${LETTERS[i].sound}u`),
    ),
  );

const tanwinRows = (): LearnRow[] =>
  CONS.map((i) =>
    row(
      t(LETTERS[i].glyph + FATN, `${LETTERS[i].sound}an`),
      t(LETTERS[i].glyph + KASN, `${LETTERS[i].sound}in`),
      t(LETTERS[i].glyph + DAMN, `${LETTERS[i].sound}un`),
    ),
  );

const shaddaRows = (): LearnRow[] =>
  CONS.slice(0, 12).map((i) => {
    const s = LETTERS[i].sound;
    return row(
      t(LETTERS[i].glyph + SHD + FAT, `${s}${s}a`),
      t(LETTERS[i].glyph + SHD + KAS, `${s}${s}i`),
      t(LETTERS[i].glyph + SHD + DAM, `${s}${s}u`),
    );
  });

const maddRows = (): LearnRow[] =>
  CONS.slice(0, 10).map((i) => {
    const g = LETTERS[i].glyph;
    const s = LETTERS[i].sound;
    return row(t(`${g}${FAT}ا`, `${s}ā`), t(`${g}${DAM}و`, `${s}ū`), t(`${g}${KAS}ي`, `${s}ī`));
  });

// ── Audio slots ──────────────────────────────────────────────────────────────
export function letterAudioUrl(l: QLetter): string | null {
  return l.audio;
}

/** Word/āyah audio: Ḥuṣarī "Muʿallim" (teaching) recitation, streamed. */
export function ayahAudioUrl(ref: string): string {
  const [s, a] = ref.split(':');
  return `https://everyayah.com/data/Husary_Muallim_128kbps/${s.padStart(3, '0')}${a.padStart(3, '0')}.mp3`;
}

// ── The 17 lessons ───────────────────────────────────────────────────────────
export const LEARN_LESSONS: LearnLesson[] = [
  {
    number: 1,
    title: 'The Letters',
    titleAr: 'الحروف المفردة',
    kind: 'letters',
    teach:
      'The 29 Arabic letters. Tap any letter to hear its name, see where it is made in the mouth, and how it changes shape in a word. Many letters share one body and differ only by dots — focus on the dots, not the shape.',
    tip: 'ب ت ث share one shape; so do ج ح خ and د ذ. Learn the family, then tell them apart by the dots.',
    letters: LETTERS.map((_, i) => i),
    rows: [],
    contrasts: [
      { a: 'ب', b: 'ت', note: 'One dot below vs two above — same body.' },
      { a: 'ت', b: 'ث', note: 'Two dots vs three above.' },
      { a: 'ج', b: 'ح', note: 'A dot inside vs none — and ح is a throat letter.' },
      { a: 'ح', b: 'خ', note: 'No dot vs one above; خ is heavy.' },
      { a: 'د', b: 'ذ', note: 'No dot vs one above.' },
      { a: 'ر', b: 'ز', note: 'No dot vs one above.' },
      { a: 'س', b: 'ش', note: 'No dots vs three above.' },
      { a: 'ص', b: 'ض', note: 'No dot vs one above — both heavy.' },
    ],
    slug: 'lesson-1',
  },
  {
    number: 2,
    title: 'Letters That Join',
    titleAr: 'الحروف المركبة',
    kind: 'forms',
    teach:
      'In a word, most letters change shape depending on their position — beginning, middle, or end. Six letters (ا د ذ ر ز و) never join to the letter on their left. Tap a letter to see its four forms; then read the joined groups below.',
    tip: 'The core of a letter stays recognisable — only the tails and connectors change.',
    letters: [1, 2, 3, 4, 5, 7, 22, 24],
    rows: [
      row(t('بـتـث', 'ba-ta-tha'), t('جـحـخ', 'ja-ḥa-kha'), t('سـسـس', 'sa-sa-sa')),
      row(t('لـا', 'lā'), t('كـمـل', 'ka-ma-la'), t('نـبـت', 'na-ba-ta')),
    ],
    contrasts: [],
    slug: 'lesson-2',
  },
  {
    number: 3,
    title: 'The Opening Letters',
    titleAr: 'الحروف المقطّعة',
    kind: 'muqatta',
    teach:
      'Twenty-nine sūrahs open with mysterious disjoined letters. They are not read as a word — each letter is named on its own. Read these slowly, one letter-name at a time.',
    letters: [],
    rows: [
      row(t('الم', 'alif–lām–mīm', { spell: 'ا · ل · م' }), t('الر', 'alif–lām–rāʾ', { spell: 'ا · ل · ر' })),
      row(
        t('يس', 'yā–sīn', { spell: 'ي · س' }),
        t('طه', 'ṭā–hā', { spell: 'ط · ه' }),
        t('حم', 'ḥā–mīm', { spell: 'ح · م' }),
      ),
      row(
        t('ن', 'nūn', { spell: 'ن' }),
        t('ق', 'qāf', { spell: 'ق' }),
        t('ص', 'ṣād', { spell: 'ص' }),
        t('كهيعص', 'kāf–hā–yā–ʿayn–ṣād', { spell: 'ك · ه · ي · ع · ص' }),
      ),
    ],
    contrasts: [],
    bridge: { ref: '2:1', word: 'الٓمٓ', translit: 'alif–lām–mīm', note: 'The very first āyah of Sūrah al-Baqarah is these letters. Read it →' },
    slug: 'lesson-3',
  },
  {
    number: 4,
    title: 'Short Vowels',
    titleAr: 'الحركات',
    kind: 'syllables',
    teach:
      'Three small marks give every letter its vowel: fatḥah (a) above, kasrah (i) below, ḍammah (u, a little loop) above. Read across — say the letter with each vowel. Name the letter and mark before you say the sound.',
    tip: 'Decode first, then say it: “bāʾ + fatḥah → ba”. Don’t just echo the audio.',
    letters: [],
    rows: harakatRows(),
    contrasts: [],
    slug: 'lesson-4',
  },
  {
    number: 5,
    title: 'Double Vowels',
    titleAr: 'التنوين',
    kind: 'syllables',
    teach:
      'Tanwīn is a doubled vowel written at the end of a word — it adds an “n” sound: fatḥatayn (an), kasratayn (in), ḍammatayn (un). No nūn is written, but you hear one.',
    letters: [],
    rows: tanwinRows(),
    contrasts: [],
    slug: 'lesson-5',
  },
  {
    number: 6,
    title: 'Mixed Practice',
    titleAr: 'تمرين',
    kind: 'drill',
    teach:
      'No new rule — just fluency. Read these rows mixing fatḥah, kasrah, ḍammah and tanwīn. Aim to read each without spelling it out first.',
    letters: [],
    rows: [
      row(t('بَ', 'ba'), t('تِ', 'ti'), t('ثُ', 'thu'), t('جً', 'jan'), t('حٍ', 'ḥin'), t('خٌ', 'khun')),
      row(t('دَ', 'da'), t('ذِ', 'dhi'), t('رُ', 'ru'), t('زً', 'zan'), t('سٍ', 'sin'), t('شٌ', 'shun')),
      row(
        t('كَتَبَ', 'kataba', { spell: 'ك · ت · ب' }),
        t('سَمِعَ', 'samiʿa', { spell: 'س · م · ع' }),
        t('نَصَرَ', 'naṣara', { spell: 'ن · ص · ر' }),
      ),
    ],
    contrasts: [],
    slug: 'lesson-6',
  },
  {
    number: 7,
    title: 'Standing Marks',
    titleAr: 'الحركات القائمة',
    kind: 'syllables',
    teach:
      'Sometimes a vowel is drawn standing/vertical, or a small dagger-alif appears. These signal a longer sound — a stretch you will meet fully in the next lesson.',
    tip: 'A standing fatḥah (dagger alif) means “stretch it”, as in هٰذَا (hādhā).',
    letters: [],
    rows: [
      row(
        t('هٰذَا', 'hādhā', { spell: 'ه · ذ · ا' }),
        t('ذٰلِكَ', 'dhālika', { spell: 'ذ · ل · ك' }),
        t('لٰكِنْ', 'lākin', { spell: 'ل · ك · ن' }),
      ),
    ],
    contrasts: [],
    slug: 'lesson-7',
  },
  {
    number: 8,
    title: 'Long Vowels & Soft Letters',
    titleAr: 'المدّ واللين',
    kind: 'syllables',
    teach:
      'A madd letter stretches the vowel before it: alif after fatḥah, wāw after ḍammah, yāʾ after kasrah — held for 2 counts. Read the stretch, don’t clip it.',
    tip: 'Hold every long vowel for a slow count of two — “bā”, not “ba”.',
    letters: [],
    rows: maddRows(),
    contrasts: [],
    slug: 'lesson-8',
  },
  {
    number: 9,
    title: 'Building Words',
    titleAr: 'تمرين المدّ',
    kind: 'drill',
    teach:
      'Now blend short and long vowels into whole words. Read smoothly — hold the long vowels, keep the short ones short.',
    letters: [],
    rows: [
      row(
        t('قَالَ', 'qāla', { spell: 'ق · ا · ل' }),
        t('نُوحِيهَا', 'nūḥīhā'),
        t('كِتَابٌ', 'kitābun', { spell: 'ك · ت · ا · ب' }),
      ),
      row(t('رَحِيمٌ', 'raḥīmun'), t('غَفُورٌ', 'ghafūrun'), t('سَمِيعٌ', 'samīʿun')),
    ],
    contrasts: [],
    bridge: { ref: '1:2', word: 'ٱلْحَمْدُ', translit: 'al-ḥamdu', note: 'You can now read the opening of al-Ḥamd. See it in Sūrah al-Fātiḥah →' },
    slug: 'lesson-9',
  },
  {
    number: 10,
    title: 'The Resting Letter',
    titleAr: 'السكون',
    kind: 'syllables',
    teach:
      'A sukūn (a small circle) means the letter has no vowel — it closes the syllable. Say the voweled letter, then land firmly on the resting one.',
    letters: [],
    rows: [
      row(
        t('مِنْ', 'min', { spell: 'م · نْ' }),
        t('قُلْ', 'qul', { spell: 'ق · لْ' }),
        t('هَلْ', 'hal', { spell: 'ه · لْ' }),
        t('كَمْ', 'kam', { spell: 'ك · مْ' }),
      ),
      row(t('أَنْعَمْتَ', 'anʿamta'), t('يَعْلَمُ', 'yaʿlamu'), t('اُدْخُلْ', 'udkhul')),
    ],
    contrasts: [],
    slug: 'lesson-10',
  },
  {
    number: 11,
    title: 'Reading Closed Syllables',
    titleAr: 'تمرين السكون',
    kind: 'drill',
    teach:
      'Practice words that mix voweled and resting letters. On qalqalah letters (ق ط ب ج د) with sukūn, give a slight bounce.',
    tip: 'Qalqalah: bounce lightly on a resting ق ط ب ج د — “aḥ-mad”.',
    letters: [],
    rows: [row(t('يَجْعَلُ', 'yajʿalu'), t('أَقْبَلَ', 'aqbala'), t('يَدْخُلُ', 'yadkhulu'))],
    contrasts: [{ a: 'اَحَد', b: 'اَحَدْ', note: 'On the resting د, add a small qalqalah bounce.' }],
    slug: 'lesson-11',
  },
  {
    number: 12,
    title: 'The Doubled Letter',
    titleAr: 'الشدّة',
    kind: 'syllables',
    teach:
      'A shaddah (a small “w” shape) doubles a letter — hold it, pressing twice as long. It can change the meaning of a word, so never skip it.',
    letters: [],
    rows: shaddaRows(),
    contrasts: [{ a: 'نَزَلَ', b: 'نَزَّلَ', note: 'Without shaddah: “descended”. With shaddah: “sent down”.' }],
    slug: 'lesson-12',
  },
  {
    number: 13,
    title: 'Shaddah in Words',
    titleAr: 'تمرين الشدّة',
    kind: 'drill',
    teach: 'Read whole words carrying a shaddah. Lean into the doubled letter and hold it.',
    letters: [],
    rows: [row(t('رَبَّنَا', 'rabbanā'), t('إِيَّاكَ', 'iyyāka'), t('ٱلَّذِينَ', 'alladhīna'))],
    contrasts: [],
    bridge: { ref: '1:5', word: 'إِيَّاكَ', translit: 'iyyāka', note: 'Hear the shaddah held in Sūrah al-Fātiḥah →' },
    slug: 'lesson-13',
  },
  {
    number: 14,
    title: 'Rest Then Double',
    titleAr: 'السكون والشدّة',
    kind: 'drill',
    teach:
      'A very common pattern: a resting letter immediately before a doubled one. Land on the sukūn, then press into the shaddah.',
    letters: [],
    rows: [row(t('مُسْتَقِيمَ', 'mustaqīma'), t('يَمْدُدْ', 'yamdud'), t('ٱلْحَقُّ', 'al-ḥaqqu'))],
    contrasts: [],
    slug: 'lesson-14',
  },
  {
    number: 15,
    title: 'Nasal Sounds',
    titleAr: 'الغنّة',
    kind: 'syllables',
    teach:
      'When نّ or مّ carry a shaddah, hold a nasal hum (ghunnah) for about 2 counts. The sound resonates through the nose.',
    tip: 'Place two fingers on the sides of your nose — you should feel it buzz.',
    letters: [],
    rows: [row(t('إِنَّ', 'inna'), t('ثُمَّ', 'thumma'), t('عَمَّ', 'ʿamma'), t('ٱلنَّاسِ', 'an-nāsi'))],
    contrasts: [],
    slug: 'lesson-15',
  },
  {
    number: 16,
    title: 'The Long Stretch',
    titleAr: 'المدّ اللازم',
    kind: 'syllables',
    teach:
      'When a sukūn or shaddah follows a madd letter, the stretch becomes heavy — held for a full 6 counts (madd lāzim). This is the longest madd.',
    tip: 'Six counts — slow and steady. You already met this in وَلَا ٱلضَّآلِّينَ.',
    letters: [],
    rows: [row(t('ٱلضَّآلِّينَ', 'aḍ-ḍāllīn'), t('ٱلْحَآقَّةُ', 'al-ḥāqqah'), t('ءَآلْـَٔانَ', 'āl-ʾāna'))],
    contrasts: [],
    bridge: { ref: '1:7', word: 'ٱلضَّآلِّينَ', translit: 'aḍ-ḍāllīn', note: 'The last word of al-Fātiḥah holds a 6-count madd. Read it →' },
    slug: 'lesson-16',
  },
  {
    number: 17,
    title: 'Putting It Together',
    titleAr: 'المراجعة',
    kind: 'revision',
    teach:
      'No new rules — the goal now is to read real āyāt applying everything: vowels, madd, sukūn, shaddah, ghunnah and qalqalah. Scan each word before you speak. When you can read a new word without spelling it out, you have arrived.',
    tip: 'Success = reading a random word correctly on the first try, without tahajjī.',
    letters: [],
    rows: [row(t('بِسْمِ ٱللَّهِ', 'bismi-llāhi'), t('ٱلرَّحْمَٰنِ', 'ar-raḥmāni'), t('ٱلرَّحِيمِ', 'ar-raḥīmi'))],
    contrasts: [],
    bridge: {
      ref: '1:1',
      word: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translit: 'bismi-llāhi ar-raḥmāni ar-raḥīm',
      note: 'You can read the opening of the Qurʾān. Begin al-Fātiḥah →',
    },
    slug: 'lesson-17',
  },
];
