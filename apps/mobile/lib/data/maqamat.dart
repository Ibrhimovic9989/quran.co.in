// The eight core maqāmāt — the melodic modes of Qur'anic recitation.
// Maqām is a property of a reciter's melody, not of the text, so this is a
// curated teaching module: each mode's character + a master reciter whose
// recitation carries that colour. Example audio streams from everyayah.com.

class Maqam {
  final String name; // English
  final String arabic;
  final String mood; // 1–2 word character (chip)
  final String character; // what it feels like
  final String whenUsed; // where reciters tend to reach for it
  final String reciter; // example reciter (a master of mujawwad)
  final String reciterFolder; // everyayah data folder
  final int surah;
  final int ayah;
  final String surahName;

  const Maqam({
    required this.name,
    required this.arabic,
    required this.mood,
    required this.character,
    required this.whenUsed,
    required this.reciter,
    required this.reciterFolder,
    required this.surah,
    required this.ayah,
    required this.surahName,
  });

  String get audioUrl {
    final s = surah.toString().padLeft(3, '0');
    final a = ayah.toString().padLeft(3, '0');
    return 'https://everyayah.com/data/$reciterFolder/$s$a.mp3';
  }
}

const List<Maqam> kMaqamat = [
  Maqam(
    name: 'Bayati',
    arabic: 'البياتي',
    mood: 'Warm · grounding',
    character:
        'The “home base” of recitation — warm, gentle and contemplative. Most reciters open and close in Bayati, so it is the first mode to internalise.',
    whenUsed: 'General recitation, spiritual and reflective passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad',
    reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 1,
    ayah: 2,
    surahName: 'Al-Fātiḥa',
  ),
  Maqam(
    name: 'Hijaz',
    arabic: 'الحجاز',
    mood: 'Longing · poignant',
    character:
        'A yearning, “calling-out” sound full of pathos — the desert-longing colour. Instantly recognisable and deeply moving.',
    whenUsed: 'Duʿāʾ, verses of warning, and tragic or stirring passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad',
    reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 36,
    ayah: 1,
    surahName: 'Yā-Sīn',
  ),
  Maqam(
    name: 'Saba',
    arabic: 'الصبا',
    mood: 'Sorrowful · tender',
    character:
        'Sadness and humility that softens the heart, with a distinctive plaintive lean. Meditative and tearful.',
    whenUsed: 'Repentance, reflection on the hereafter, softening the heart.',
    reciter: 'Muhammad Ayyoub',
    reciterFolder: 'Muhammad_Ayyoub_128kbps',
    surah: 23,
    ayah: 1,
    surahName: 'Al-Muʾminūn',
  ),
  Maqam(
    name: 'Nahawand',
    arabic: 'النهاوند',
    mood: 'Emotive · reflective',
    character:
        'A soft, minor-key feel (close to Western minor) — emotional yet composed. Blends beautifully between other modes.',
    whenUsed: 'Emotive passages and transitions between modes.',
    reciter: 'Abdul Basit ʿAbd us-Samad',
    reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 3,
    ayah: 26,
    surahName: 'Āl ʿImrān',
  ),
  Maqam(
    name: 'Rast',
    arabic: 'الرست',
    mood: 'Grand · stable',
    character:
        'Confident, balanced and majestic — a “major-key” feel. A foundational mode used for declarative, weighty verses.',
    whenUsed: 'Storytelling, divine wisdom, and declarative verses.',
    reciter: 'Muhammad Ṣiddīq al-Minshāwī',
    reciterFolder: 'Minshawy_Mujawwad_192kbps',
    surah: 2,
    ayah: 255,
    surahName: 'Āyat al-Kursī',
  ),
  Maqam(
    name: 'Sikah',
    arabic: 'السيكاه',
    mood: 'Tender · tranquil',
    character:
        'A gentle, affectionate colour with a distinctive quarter-tone — the signature of the Egyptian mujawwad tradition.',
    whenUsed: 'Peaceful, intimate passages.',
    reciter: 'Muhammad al-Ṭablāwī',
    reciterFolder: 'Mohammad_al_Tablaway_128kbps',
    surah: 93,
    ayah: 1,
    surahName: 'Aḍ-Ḍuḥā',
  ),
  Maqam(
    name: 'Ajam',
    arabic: 'العجم',
    mood: 'Bright · joyful',
    character:
        'Open, bright and uplifting — the closest to a Western major scale. Celebratory in feel.',
    whenUsed: 'Glad tidings, descriptions of Paradise and blessings.',
    reciter: 'Muhammad Ṣiddīq al-Minshāwī',
    reciterFolder: 'Minshawy_Mujawwad_192kbps',
    surah: 55,
    ayah: 1,
    surahName: 'Ar-Raḥmān',
  ),
  Maqam(
    name: 'Kurd',
    arabic: 'الكرد',
    mood: 'Calm · intimate',
    character:
        'Soft, calm and intimate — a gentle mode favoured in much contemporary recitation.',
    whenUsed: 'Gentle, reflective passages.',
    reciter: 'Abdul Basit ʿAbd us-Samad',
    reciterFolder: 'Abdul_Basit_Mujawwad_128kbps',
    surah: 89,
    ayah: 27,
    surahName: 'Al-Fajr',
  ),
];
