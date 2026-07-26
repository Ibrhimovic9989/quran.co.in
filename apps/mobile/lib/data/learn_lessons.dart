// Learn to Read — the Noorani-Qāʿidah arc, from the 29 letters to reading real
// Qurʾānic words. This file is the single source of truth for the letter data
// and the 17-lesson map; it mirrors apps/web/lib/data/learn-lessons.ts
// field-for-field. Keep the two in sync.
//
// Design notes:
// - The four positional forms are produced with Unicode ZWJ (U+200D) so the
//   font shapes them correctly — we never hand-author glyphs.
// - The vowel/tanwīn drills are GENERATED from the letter set + marks, so they
//   are complete and can't contain a typo'd syllable.
// - Per-letter audio is a slot (null for now); commissioned recordings drop in
//   later. Word/āyah audio streams Ḥuṣarī "Muʿallim" (teaching) recitation.

// ── Arabic diacritics (combining marks) ──────────────────────────────────────
const String _fatha = 'َ'; // ــَ  a
const String _kasra = 'ِ'; // ــِ  i
const String _damma = 'ُ'; // ــُ  u
const String _fathatan = 'ً'; // ــً  an
const String _kasratan = 'ٍ'; // ــٍ  in
const String _dammatan = 'ٌ'; // ــٌ  un
const String _shadda = 'ّ'; // ــّ  (doubled)
const String _zwj = '‍';

/// The four positional forms of a letter, shaped by the font via ZWJ.
class LetterForms {
  final String isolated, initial, medial, end;
  const LetterForms(this.isolated, this.initial, this.medial, this.end);
}

LetterForms formsOf(String glyph) => LetterForms(
      glyph,
      '$glyph$_zwj',
      '$_zwj$glyph$_zwj',
      '$_zwj$glyph',
    );

/// One Arabic letter with everything the teaching UI needs.
class QLetter {
  final String glyph; // isolated form
  final String name; // English name — "Bāʾ"
  final String nameAr; // Arabic name — "باء"
  final String sound; // transliteration of the consonant — "b", "th", "ḥ"
  final String region; // makhraj region — Throat / Tongue / Lips / Nasal / Cavity
  final String makhraj; // where/how it is articulated
  final String tip; // a teacher's physical self-check cue
  final bool sun; // sun letter (lām of "al-" assimilates)
  final bool connects; // joins to the letter on its left
  final bool heavy; // mufakhkham (heavy) letter
  final bool qalqalah; // bounces on sukūn (ق ط ب ج د)
  final String? audio; // per-letter recording slot (commissioned later)

  const QLetter(
    this.glyph,
    this.name,
    this.nameAr,
    this.sound,
    this.region,
    this.makhraj,
    this.tip, {
    this.sun = false,
    this.connects = true,
    this.heavy = false,
    this.qalqalah = false,
    this.audio,
  });

  LetterForms get forms => formsOf(glyph);
}

// ── The 29 letters, in Qāʿidah order (alif → hamza) ──────────────────────────
const List<QLetter> kLetters = [
  QLetter('ا', 'Alif', 'ألف', 'ā', 'Cavity',
      'An open carrier — it has no sound of its own; it stretches the fatḥah before it.',
      'Nothing touches — the breath flows out freely.',
      connects: false),
  QLetter('ب', 'Bāʾ', 'باء', 'b', 'Lips', 'Both lips pressed together, then released.',
      'Feel your two lips meet.',
      qalqalah: true),
  QLetter('ت', 'Tāʾ', 'تاء', 't', 'Tongue', 'Tip of the tongue on the roots of the upper front teeth.',
      'Tongue-tip taps just behind the top teeth.',
      sun: true),
  QLetter('ث', 'Thāʾ', 'ثاء', 'th', 'Tongue', 'Tongue-tip lightly between the teeth — like “think”.',
      'Tongue peeks between the teeth.',
      sun: true),
  QLetter('ج', 'Jīm', 'جيم', 'j', 'Tongue', 'Middle of the tongue rises to the roof of the mouth.',
      'Mid-tongue presses the palate.',
      qalqalah: true),
  QLetter('ح', 'Ḥāʾ', 'حاء', 'ḥ', 'Throat', 'Middle of the throat — a deep, breathy H.',
      'Hand on throat — feel the middle constrict.'),
  QLetter('خ', 'Khāʾ', 'خاء', 'kh', 'Throat', 'Top of the throat — like gently clearing it.',
      'A heavy, raspy sound at the throat’s top.',
      heavy: true),
  QLetter('د', 'Dāl', 'دال', 'd', 'Tongue', 'Tip of the tongue on the roots of the upper front teeth.',
      'Like ت but voiced — feel it buzz.',
      sun: true, connects: false, qalqalah: true),
  QLetter('ذ', 'Dhāl', 'ذال', 'dh', 'Tongue', 'Tongue-tip between the teeth, voiced — like “this”.',
      'Between the teeth, with a buzz.',
      sun: true, connects: false),
  QLetter('ر', 'Rāʾ', 'راء', 'r', 'Tongue', 'Tip of the tongue trills near the gum ridge.',
      'A light roll of the tongue-tip.',
      sun: true, connects: false),
  QLetter('ز', 'Zāy', 'زاي', 'z', 'Tongue', 'Tongue-tip near the lower teeth — a whistling Z.',
      'A buzzing whistle behind the teeth.',
      sun: true, connects: false),
  QLetter('س', 'Sīn', 'سين', 's', 'Tongue', 'Tongue-tip near the lower teeth — a thin whistling S.',
      'A soft hiss — no voice.',
      sun: true),
  QLetter('ش', 'Shīn', 'شين', 'sh', 'Tongue', 'Middle of the tongue spreads toward the palate.',
      'Air spreads across the tongue — “sh”.',
      sun: true),
  QLetter('ص', 'Ṣād', 'صاد', 'ṣ', 'Tongue', 'Heavy S — the tongue hollows and the mouth fills.',
      'Say س, then make the mouth round and heavy.',
      sun: true, heavy: true),
  QLetter('ض', 'Ḍād', 'ضاد', 'ḍ', 'Tongue', 'Side of the tongue presses the upper molars — heavy D.',
      'The tongue’s edge pushes the back teeth.',
      sun: true, heavy: true),
  QLetter('ط', 'Ṭāʾ', 'طاء', 'ṭ', 'Tongue', 'Heavy T — tongue-tip on the teeth roots, mouth full.',
      'Say ت, then make it heavy and full.',
      sun: true, heavy: true, qalqalah: true),
  QLetter('ظ', 'Ẓāʾ', 'ظاء', 'ẓ', 'Tongue', 'Heavy DH — tongue between the teeth, mouth full.',
      'Say ذ, then make it heavy.',
      sun: true, heavy: true),
  QLetter('ع', 'ʿAyn', 'عين', 'ʿ', 'Throat', 'Middle of the throat — a firm, voiced squeeze.',
      'Constrict mid-throat — no English match.'),
  QLetter('غ', 'Ghayn', 'غين', 'gh', 'Throat', 'Top of the throat — like a soft gargle.',
      'A gargling sound at the throat’s top.',
      heavy: true),
  QLetter('ف', 'Fāʾ', 'فاء', 'f', 'Lips', 'Lower lip touches the upper front teeth.',
      'Feel teeth on your lower lip.'),
  QLetter('ق', 'Qāf', 'قاف', 'q', 'Tongue', 'Deepest back of the tongue meets the soft palate — heavy K.',
      'A deep K from the back — heavy.',
      heavy: true, qalqalah: true),
  QLetter('ك', 'Kāf', 'كاف', 'k', 'Tongue', 'Back of the tongue, just forward of ق — a light K.',
      'Like ق﻿ but lighter and forward.'),
  QLetter('ل', 'Lām', 'لام', 'l', 'Tongue', 'Tongue-tip on the gum ridge behind the upper teeth.',
      'Tongue-tip up to the gum.',
      sun: true),
  QLetter('م', 'Mīm', 'ميم', 'm', 'Lips', 'Both lips meet; sound resonates in the nose.',
      'Lips closed, hum through the nose.'),
  QLetter('ن', 'Nūn', 'نون', 'n', 'Tongue', 'Tongue-tip on the gum; sound resonates in the nose.',
      'Tongue-tip up, hum through the nose.',
      sun: true),
  QLetter('ه', 'Hāʾ', 'هاء', 'h', 'Throat', 'Deepest part of the throat — a soft breath H.',
      'A gentle H from deep in the throat.'),
  QLetter('و', 'Wāw', 'واو', 'w', 'Lips', 'Rounded lips (W); as a madd letter it stretches a ḍammah.',
      'Round your lips.',
      connects: false),
  QLetter('ي', 'Yāʾ', 'ياء', 'y', 'Tongue', 'Middle of the tongue (Y); as a madd letter it stretches a kasrah.',
      'Mid-tongue toward the palate.'),
  QLetter('ء', 'Hamza', 'همزة', 'ʾ', 'Throat', 'A clean glottal stop — the catch in “uh-oh”.',
      'Snap the throat shut, then open.',
      connects: false),
];

QLetter letterByGlyph(String g) => kLetters.firstWhere((l) => l.glyph == g);

// ── Reading tokens / rows ────────────────────────────────────────────────────
class LearnToken {
  final String ar; // the Arabic to read
  final String translit; // how it sounds
  final String? spell; // optional "spell it out" hint (tahajjī)
  final String? audioRef; // "surah:ayah" for word/āyah audio, else null
  const LearnToken(this.ar, this.translit, {this.spell, this.audioRef});
}

class LearnRow {
  final List<LearnToken> tokens;
  final String? label;
  const LearnRow(this.tokens, {this.label});
}

/// A confusable pair the learner must tell apart (dot- or makhraj-contrast).
class LearnContrast {
  final String a, b, note;
  const LearnContrast(this.a, this.b, this.note);
}

/// A bridge into the real muṣḥaf: "you can now read this word".
class LearnBridge {
  final String ref; // "surah:ayah"
  final String word; // the word to spotlight
  final String translit;
  final String note;
  const LearnBridge(this.ref, this.word, this.translit, this.note);
}

enum LearnKind { letters, forms, muqatta, syllables, drill, revision }

class LearnLesson {
  final int number;
  final String title;
  final String titleAr;
  final LearnKind kind;
  final String teach; // what's new + how to read it
  final String? tip; // timing / self-check note
  final List<int> letters; // indices into kLetters (letters & forms lessons)
  final List<LearnRow> rows;
  final List<LearnContrast> contrasts;
  final LearnBridge? bridge;
  const LearnLesson({
    required this.number,
    required this.title,
    required this.titleAr,
    required this.kind,
    required this.teach,
    this.tip,
    this.letters = const [],
    this.rows = const [],
    this.contrasts = const [],
    this.bridge,
  });

  String get slug => 'lesson-$number';
}

// ── Drill generators (complete & typo-proof) ─────────────────────────────────
final List<int> _consonants = [
  for (var i = 0; i < kLetters.length; i++)
    if (kLetters[i].glyph != 'ا') i // alif is a carrier, not drilled with ḥarakāt
];

List<LearnRow> _harakatRows() => [
      for (final i in _consonants)
        LearnRow([
          LearnToken(kLetters[i].glyph + _fatha, '${kLetters[i].sound}a'),
          LearnToken(kLetters[i].glyph + _kasra, '${kLetters[i].sound}i'),
          LearnToken(kLetters[i].glyph + _damma, '${kLetters[i].sound}u'),
        ]),
    ];

List<LearnRow> _tanwinRows() => [
      for (final i in _consonants)
        LearnRow([
          LearnToken(kLetters[i].glyph + _fathatan, '${kLetters[i].sound}an'),
          LearnToken(kLetters[i].glyph + _kasratan, '${kLetters[i].sound}in'),
          LearnToken(kLetters[i].glyph + _dammatan, '${kLetters[i].sound}un'),
        ]),
    ];

List<LearnRow> _shaddaRows() => [
      for (final i in _consonants.take(12))
        LearnRow([
          LearnToken(kLetters[i].glyph + _shadda + _fatha, '${kLetters[i].sound}${kLetters[i].sound}a'),
          LearnToken(kLetters[i].glyph + _shadda + _kasra, '${kLetters[i].sound}${kLetters[i].sound}i'),
          LearnToken(kLetters[i].glyph + _shadda + _damma, '${kLetters[i].sound}${kLetters[i].sound}u'),
        ]),
    ];

/// Madd: a fatḥah + alif, ḍammah + wāw, kasrah + yāʾ → a 2-count stretch.
List<LearnRow> _maddRows() => [
      for (final i in _consonants.take(10))
        LearnRow([
          LearnToken('${kLetters[i].glyph}$_fathaا', '${kLetters[i].sound}ā'),
          LearnToken('${kLetters[i].glyph}$_dammaو', '${kLetters[i].sound}ū'),
          LearnToken('${kLetters[i].glyph}$_kasraي', '${kLetters[i].sound}ī'),
        ]),
    ];

// ── Audio slots ──────────────────────────────────────────────────────────────
// Letter-pronunciation audio. To turn it on: host the clips (named per the
// recording brief — NN_name.mp3, NN = 1-based position in kLetters, padded),
// set [kLetterAudioBase], and flip [kLetterAudioReady] to true. The credit line
// then appears automatically in the Learn hub.
const bool kLetterAudioReady = false;
const String kLetterAudioBase = ''; // e.g. https://cdn.quran.co.in/learn/qaida
const List<String> kLetterAudioCredits = ['eQuranSchool', 'al-dirassa', 'Kalimah'];

/// Per-letter recording — null until [kLetterAudioReady] is set.
String? letterAudioUrl(QLetter l) {
  if (!kLetterAudioReady || kLetterAudioBase.isEmpty) return l.audio;
  final i = kLetters.indexOf(l);
  if (i < 0) return null;
  return '$kLetterAudioBase/${(i + 1).toString().padLeft(2, '0')}_name.mp3';
}

/// Word/āyah audio: Ḥuṣarī "Muʿallim" (teaching) recitation, streamed.
String ayahAudioUrl(String ref) {
  final p = ref.split(':');
  final s = p[0].padLeft(3, '0');
  final a = p[1].padLeft(3, '0');
  return 'https://everyayah.com/data/Husary_Muallim_128kbps/$s$a.mp3';
}

// ── The 17 lessons ───────────────────────────────────────────────────────────
final List<LearnLesson> kLearnLessons = [
  LearnLesson(
    number: 1,
    title: 'The Letters',
    titleAr: 'الحروف المفردة',
    kind: LearnKind.letters,
    teach:
        'The 29 Arabic letters. Tap any letter to hear its name, see where it is made in the mouth, and how it changes shape in a word. Many letters share one body and differ only by dots — focus on the dots, not the shape.',
    tip: 'ب ت ث share one shape; so do ج ح خ and د ذ. Learn the family, then tell them apart by the dots.',
    letters: [for (var i = 0; i < kLetters.length; i++) i],
    contrasts: [
      LearnContrast('ب', 'ت', 'One dot below vs two above — same body.'),
      LearnContrast('ت', 'ث', 'Two dots vs three above.'),
      LearnContrast('ج', 'ح', 'A dot inside vs none — and ح is a throat letter.'),
      LearnContrast('ح', 'خ', 'No dot vs one above; خ is heavy.'),
      LearnContrast('د', 'ذ', 'No dot vs one above.'),
      LearnContrast('ر', 'ز', 'No dot vs one above.'),
      LearnContrast('س', 'ش', 'No dots vs three above.'),
      LearnContrast('ص', 'ض', 'No dot vs one above — both heavy.'),
    ],
  ),
  LearnLesson(
    number: 2,
    title: 'Letters That Join',
    titleAr: 'الحروف المركبة',
    kind: LearnKind.forms,
    teach:
        'In a word, most letters change shape depending on their position — beginning, middle, or end. Six letters (ا د ذ ر ز و) never join to the letter on their left. Tap a letter to see its four forms; then read the joined groups below.',
    tip: 'The core of a letter stays recognisable — only the tails and connectors change.',
    letters: [1, 2, 3, 4, 5, 7, 22, 24],
    rows: const [
      LearnRow([
        LearnToken('بـتـث', 'ba-ta-tha'),
        LearnToken('جـحـخ', 'ja-ḥa-kha'),
        LearnToken('سـسـس', 'sa-sa-sa'),
      ]),
      LearnRow([
        LearnToken('لـا', 'lā'),
        LearnToken('كـمـل', 'ka-ma-la'),
        LearnToken('نـبـت', 'na-ba-ta'),
      ]),
    ],
  ),
  LearnLesson(
    number: 3,
    title: 'The Opening Letters',
    titleAr: 'الحروف المقطّعة',
    kind: LearnKind.muqatta,
    teach:
        'Twenty-nine sūrahs open with mysterious disjoined letters. They are not read as a word — each letter is named on its own. Read these slowly, one letter-name at a time.',
    rows: const [
      LearnRow([
        LearnToken('الم', 'alif–lām–mīm', spell: 'ا · ل · م'),
        LearnToken('الر', 'alif–lām–rāʾ', spell: 'ا · ل · ر'),
      ]),
      LearnRow([
        LearnToken('يس', 'yā–sīn', spell: 'ي · س'),
        LearnToken('طه', 'ṭā–hā', spell: 'ط · ه'),
        LearnToken('حم', 'ḥā–mīm', spell: 'ح · م'),
      ]),
      LearnRow([
        LearnToken('ن', 'nūn', spell: 'ن'),
        LearnToken('ق', 'qāf', spell: 'ق'),
        LearnToken('ص', 'ṣād', spell: 'ص'),
        LearnToken('كهيعص', 'kāf–hā–yā–ʿayn–ṣād', spell: 'ك · ه · ي · ع · ص'),
      ]),
    ],
    bridge: LearnBridge('2:1', 'الٓمٓ', 'alif–lām–mīm', 'The very first āyah of Sūrah al-Baqarah is these letters. Read it →'),
  ),
  LearnLesson(
    number: 4,
    title: 'Short Vowels',
    titleAr: 'الحركات',
    kind: LearnKind.syllables,
    teach:
        'Three small marks give every letter its vowel: fatḥah (a) above, kasrah (i) below, ḍammah (u, a little loop) above. Read across — say the letter with each vowel. Name the letter and mark before you say the sound.',
    tip: 'Decode first, then say it: “bāʾ + fatḥah → ba”. Don’t just echo the audio.',
    rows: _harakatRows(),
  ),
  LearnLesson(
    number: 5,
    title: 'Double Vowels',
    titleAr: 'التنوين',
    kind: LearnKind.syllables,
    teach:
        'Tanwīn is a doubled vowel written at the end of a word — it adds an “n” sound: fatḥatayn (an), kasratayn (in), ḍammatayn (un). No nūn is written, but you hear one.',
    rows: _tanwinRows(),
  ),
  LearnLesson(
    number: 6,
    title: 'Mixed Practice',
    titleAr: 'تمرين',
    kind: LearnKind.drill,
    teach:
        'No new rule — just fluency. Read these rows mixing fatḥah, kasrah, ḍammah and tanwīn. Aim to read each without spelling it out first.',
    rows: const [
      LearnRow([
        LearnToken('بَ', 'ba'),
        LearnToken('تِ', 'ti'),
        LearnToken('ثُ', 'thu'),
        LearnToken('جً', 'jan'),
        LearnToken('حٍ', 'ḥin'),
        LearnToken('خٌ', 'khun'),
      ]),
      LearnRow([
        LearnToken('دَ', 'da'),
        LearnToken('ذِ', 'dhi'),
        LearnToken('رُ', 'ru'),
        LearnToken('زً', 'zan'),
        LearnToken('سٍ', 'sin'),
        LearnToken('شٌ', 'shun'),
      ]),
      LearnRow([
        LearnToken('كَتَبَ', 'kataba', spell: 'ك · ت · ب'),
        LearnToken('سَمِعَ', 'samiʿa', spell: 'س · م · ع'),
        LearnToken('نَصَرَ', 'naṣara', spell: 'ن · ص · ر'),
      ]),
    ],
  ),
  LearnLesson(
    number: 7,
    title: 'Standing Marks',
    titleAr: 'الحركات القائمة',
    kind: LearnKind.syllables,
    teach:
        'Sometimes a vowel is drawn standing/vertical, or a small dagger-alif appears. These signal a longer sound — a stretch you will meet fully in the next lesson.',
    tip: 'A standing fatḥah (dagger alif) means “stretch it”, as in هٰذَا (hādhā).',
    rows: const [
      LearnRow([
        LearnToken('هٰذَا', 'hādhā', spell: 'ه · ذ · ا'),
        LearnToken('ذٰلِكَ', 'dhālika', spell: 'ذ · ل · ك'),
        LearnToken('لٰكِنْ', 'lākin', spell: 'ل · ك · ن'),
      ]),
    ],
  ),
  LearnLesson(
    number: 8,
    title: 'Long Vowels & Soft Letters',
    titleAr: 'المدّ واللين',
    kind: LearnKind.syllables,
    teach:
        'A madd letter stretches the vowel before it: alif after fatḥah, wāw after ḍammah, yāʾ after kasrah — held for 2 counts. Read the stretch, don’t clip it.',
    tip: 'Hold every long vowel for a slow count of two — “bā”, not “ba”.',
    rows: _maddRows(),
  ),
  LearnLesson(
    number: 9,
    title: 'Building Words',
    titleAr: 'تمرين المدّ',
    kind: LearnKind.drill,
    teach:
        'Now blend short and long vowels into whole words. Read smoothly — hold the long vowels, keep the short ones short.',
    rows: const [
      LearnRow([
        LearnToken('قَالَ', 'qāla', spell: 'ق · ا · ل'),
        LearnToken('نُوحِيهَا', 'nūḥīhā'),
        LearnToken('كِتَابٌ', 'kitābun', spell: 'ك · ت · ا · ب'),
      ]),
      LearnRow([
        LearnToken('رَحِيمٌ', 'raḥīmun'),
        LearnToken('غَفُورٌ', 'ghafūrun'),
        LearnToken('سَمِيعٌ', 'samīʿun'),
      ]),
    ],
    bridge: LearnBridge('1:2', 'ٱلْحَمْدُ', 'al-ḥamdu', 'You can now read the opening of al-Ḥamd. See it in Sūrah al-Fātiḥah →'),
  ),
  LearnLesson(
    number: 10,
    title: 'The Resting Letter',
    titleAr: 'السكون',
    kind: LearnKind.syllables,
    teach:
        'A sukūn (a small circle) means the letter has no vowel — it closes the syllable. Say the voweled letter, then land firmly on the resting one.',
    rows: const [
      LearnRow([
        LearnToken('مِنْ', 'min', spell: 'م · نْ'),
        LearnToken('قُلْ', 'qul', spell: 'ق · لْ'),
        LearnToken('هَلْ', 'hal', spell: 'ه · لْ'),
        LearnToken('كَمْ', 'kam', spell: 'ك · مْ'),
      ]),
      LearnRow([
        LearnToken('أَنْعَمْتَ', 'anʿamta'),
        LearnToken('يَعْلَمُ', 'yaʿlamu'),
        LearnToken('اُدْخُلْ', 'udkhul'),
      ]),
    ],
  ),
  LearnLesson(
    number: 11,
    title: 'Reading Closed Syllables',
    titleAr: 'تمرين السكون',
    kind: LearnKind.drill,
    teach:
        'Practice words that mix voweled and resting letters. On qalqalah letters (ق ط ب ج د) with sukūn, give a slight bounce.',
    tip: 'Qalqalah: bounce lightly on a resting ق ط ب ج د — “aḥ-mad”.',
    rows: const [
      LearnRow([
        LearnToken('يَجْعَلُ', 'yajʿalu'),
        LearnToken('أَقْبَلَ', 'aqbala'),
        LearnToken('يَدْخُلُ', 'yadkhulu'),
      ]),
    ],
    contrasts: [
      LearnContrast('اَحَد', 'اَحَدْ', 'On the resting د, add a small qalqalah bounce.'),
    ],
  ),
  LearnLesson(
    number: 12,
    title: 'The Doubled Letter',
    titleAr: 'الشدّة',
    kind: LearnKind.syllables,
    teach:
        'A shaddah (a small “w” shape) doubles a letter — hold it, pressing twice as long. It can change the meaning of a word, so never skip it.',
    rows: _shaddaRows(),
    contrasts: [
      LearnContrast('نَزَلَ', 'نَزَّلَ', 'Without shaddah: “descended”. With shaddah: “sent down”.'),
    ],
  ),
  LearnLesson(
    number: 13,
    title: 'Shaddah in Words',
    titleAr: 'تمرين الشدّة',
    kind: LearnKind.drill,
    teach:
        'Read whole words carrying a shaddah. Lean into the doubled letter and hold it.',
    rows: const [
      LearnRow([
        LearnToken('رَبَّنَا', 'rabbanā'),
        LearnToken('إِيَّاكَ', 'iyyāka'),
        LearnToken('ٱلَّذِينَ', 'alladhīna'),
      ]),
    ],
    bridge: LearnBridge('1:5', 'إِيَّاكَ', 'iyyāka', 'Hear the shaddah held in Sūrah al-Fātiḥah →'),
  ),
  LearnLesson(
    number: 14,
    title: 'Rest Then Double',
    titleAr: 'السكون والشدّة',
    kind: LearnKind.drill,
    teach:
        'A very common pattern: a resting letter immediately before a doubled one. Land on the sukūn, then press into the shaddah.',
    rows: const [
      LearnRow([
        LearnToken('مُسْتَقِيمَ', 'mustaqīma'),
        LearnToken('يَمْدُدْ', 'yamdud'),
        LearnToken('ٱلْحَقُّ', 'al-ḥaqqu'),
      ]),
    ],
  ),
  LearnLesson(
    number: 15,
    title: 'Nasal Sounds',
    titleAr: 'الغنّة',
    kind: LearnKind.syllables,
    teach:
        'When نّ or مّ carry a shaddah, hold a nasal hum (ghunnah) for about 2 counts. The sound resonates through the nose.',
    tip: 'Place two fingers on the sides of your nose — you should feel it buzz.',
    rows: const [
      LearnRow([
        LearnToken('إِنَّ', 'inna'),
        LearnToken('ثُمَّ', 'thumma'),
        LearnToken('عَمَّ', 'ʿamma'),
        LearnToken('ٱلنَّاسِ', 'an-nāsi'),
      ]),
    ],
  ),
  LearnLesson(
    number: 16,
    title: 'The Long Stretch',
    titleAr: 'المدّ اللازم',
    kind: LearnKind.syllables,
    teach:
        'When a sukūn or shaddah follows a madd letter, the stretch becomes heavy — held for a full 6 counts (madd lāzim). This is the longest madd.',
    tip: 'Six counts — slow and steady. You already met this in وَلَا ٱلضَّآلِّينَ.',
    rows: const [
      LearnRow([
        LearnToken('ٱلضَّآلِّينَ', 'aḍ-ḍāllīn'),
        LearnToken('ٱلْحَآقَّةُ', 'al-ḥāqqah'),
        LearnToken('ءَآلْـَٔانَ', 'āl-ʾāna'),
      ]),
    ],
    bridge: LearnBridge('1:7', 'ٱلضَّآلِّينَ', 'aḍ-ḍāllīn', 'The last word of al-Fātiḥah holds a 6-count madd. Read it →'),
  ),
  LearnLesson(
    number: 17,
    title: 'Putting It Together',
    titleAr: 'المراجعة',
    kind: LearnKind.revision,
    teach:
        'No new rules — the goal now is to read real āyāt applying everything: vowels, madd, sukūn, shaddah, ghunnah and qalqalah. Scan each word before you speak. When you can read a new word without spelling it out, you have arrived.',
    tip: 'Success = reading a random word correctly on the first try, without tahajjī.',
    rows: const [
      LearnRow([
        LearnToken('بِسْمِ ٱللَّهِ', 'bismi-llāhi'),
        LearnToken('ٱلرَّحْمَٰنِ', 'ar-raḥmāni'),
        LearnToken('ٱلرَّحِيمِ', 'ar-raḥīmi'),
      ]),
    ],
    bridge: LearnBridge('1:1', 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'bismi-llāhi ar-raḥmāni ar-raḥīm',
        'You can read the opening of the Qurʾān. Begin al-Fātiḥah →'),
  ),
];
