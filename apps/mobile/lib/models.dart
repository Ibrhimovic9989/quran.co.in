// Lightweight models over the api.quran.co.in response shapes.

class SurahInfo {
  final int surahNo;
  final String name; // transliterated, e.g. Al-Faatiha
  final String arabicName;
  final String translation; // e.g. The Opening
  final String revelationPlace;
  final int totalAyah;

  SurahInfo({
    required this.surahNo,
    required this.name,
    required this.arabicName,
    required this.translation,
    required this.revelationPlace,
    required this.totalAyah,
  });

  factory SurahInfo.fromJson(Map<String, dynamic> j) => SurahInfo(
        surahNo: j['surahNo'] as int,
        name: j['surahName'] as String? ?? '',
        arabicName: j['surahNameArabic'] as String? ?? '',
        translation: j['surahNameTranslation'] as String? ?? '',
        revelationPlace: j['revelationPlace'] as String? ?? '',
        totalAyah: j['totalAyah'] as int? ?? 0,
      );
}

class Ayah {
  final int number;
  final String arabic;
  final String? translation;
  final String? transliteration;

  Ayah({required this.number, required this.arabic, this.translation, this.transliteration});
}

class SurahDetail {
  final SurahInfo info;
  final List<Ayah> ayahs;

  SurahDetail({required this.info, required this.ayahs});

  factory SurahDetail.fromJson(Map<String, dynamic> j) {
    final english = (j['english'] as List?)?.cast<String?>() ?? [];
    final arabic = (j['arabic1'] as List?)?.cast<String?>() ?? [];
    final translit = (j['arabic2'] as List?)?.cast<String?>() ?? [];
    final ayahs = <Ayah>[];
    for (var i = 0; i < arabic.length; i++) {
      ayahs.add(Ayah(
        number: i + 1,
        arabic: arabic[i] ?? '',
        translation: i < english.length ? english[i] : null,
        transliteration: i < translit.length ? translit[i] : null,
      ));
    }
    return SurahDetail(
      info: SurahInfo(
        surahNo: j['surahNo'] as int,
        name: j['surahName'] as String? ?? '',
        arabicName: j['surahNameArabic'] as String? ?? '',
        translation: j['surahNameTranslation'] as String? ?? '',
        revelationPlace: j['revelationPlace'] as String? ?? '',
        totalAyah: j['totalAyah'] as int? ?? 0,
      ),
      ayahs: ayahs,
    );
  }
}

class DailyAyah {
  final int surahNumber;
  final int ayahNumber;
  final String arabicText;
  final String? translationText;
  final String englishName;
  final String type;

  DailyAyah({
    required this.surahNumber,
    required this.ayahNumber,
    required this.arabicText,
    this.translationText,
    required this.englishName,
    required this.type,
  });

  factory DailyAyah.fromJson(Map<String, dynamic> j, String type) => DailyAyah(
        surahNumber: j['surahNumber'] as int,
        ayahNumber: j['ayahNumber'] as int,
        arabicText: j['arabicText'] as String? ?? '',
        translationText: j['translationText'] as String?,
        englishName: j['englishName'] as String? ?? '',
        type: type,
      );
}

class AskSource {
  final int surahNumber;
  final int ayahNumber;
  final String englishName;
  final String? translationText;

  AskSource({
    required this.surahNumber,
    required this.ayahNumber,
    required this.englishName,
    this.translationText,
  });

  factory AskSource.fromJson(Map<String, dynamic> j) => AskSource(
        surahNumber: j['surahNumber'] as int,
        ayahNumber: j['ayahNumber'] as int,
        englishName: j['englishName'] as String? ?? '',
        translationText: j['translationText'] as String?,
      );
}
