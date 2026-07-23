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

/// A saved bookmark (surah + optional ayah). Mirrors POST /api/bookmarks.
class Bookmark {
  final int surahNumber;
  final int? ayahNumber;
  final String? surahName;
  final String? note;

  Bookmark({required this.surahNumber, this.ayahNumber, this.surahName, this.note});

  String get key => '$surahNumber:${ayahNumber ?? 0}';

  factory Bookmark.fromJson(Map<String, dynamic> j) => Bookmark(
        surahNumber: (j['surahNumber'] ?? j['surahNo']) as int,
        ayahNumber: (j['ayahNumber'] ?? j['ayahNo']) as int?,
        surahName: j['surahName'] as String?,
        note: j['note'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'surahNumber': surahNumber,
        if (ayahNumber != null) 'ayahNumber': ayahNumber,
        if (surahName != null) 'surahName': surahName,
        if (note != null) 'note': note,
      };
}

/// The last place the reader left off. Mirrors /api/reading-history.
class ReadPosition {
  final int surahNumber;
  final int ayahNumber;
  final String? surahName;

  ReadPosition({required this.surahNumber, required this.ayahNumber, this.surahName});

  factory ReadPosition.fromJson(Map<String, dynamic> j) => ReadPosition(
        surahNumber: (j['surahNumber'] ?? j['surahNo']) as int,
        ayahNumber: (j['ayahNumber'] ?? j['ayahNo'] ?? 1) as int,
        surahName: j['surahName'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'surahNumber': surahNumber,
        'ayahNumber': ayahNumber,
        if (surahName != null) 'surahName': surahName,
      };
}

/// A verse returned by semantic / similar search.
class SearchResult {
  final int surahNumber;
  final int ayahNumber;
  final String arabicText;
  final String? translationText;
  final String englishName;

  SearchResult({
    required this.surahNumber,
    required this.ayahNumber,
    required this.arabicText,
    this.translationText,
    required this.englishName,
  });

  factory SearchResult.fromJson(Map<String, dynamic> j) => SearchResult(
        surahNumber: j['surahNumber'] as int,
        ayahNumber: j['ayahNumber'] as int,
        arabicText: j['arabicText'] as String? ?? '',
        translationText: j['translationText'] as String?,
        englishName: j['englishName'] as String? ?? '',
      );
}

/// One tafsir entry (author + markdown content) for an ayah.
class TafsirEntry {
  final String author;
  final String content;

  TafsirEntry({required this.author, required this.content});

  factory TafsirEntry.fromJson(Map<String, dynamic> j) => TafsirEntry(
        author: j['author'] as String? ?? 'Tafsir',
        content: j['content'] as String? ?? '',
      );
}

/// A single word in the word-by-word interlinear view.
class WordUnit {
  final String arabic;
  final String? translation;
  final String? transliteration;
  final bool isEnd; // ayah-number glyph

  WordUnit({required this.arabic, this.translation, this.transliteration, this.isEnd = false});

  factory WordUnit.fromJson(Map<String, dynamic> j) => WordUnit(
        arabic: j['arabic'] as String? ?? '',
        translation: j['translation'] as String?,
        transliteration: j['transliteration'] as String?,
        isEnd: (j['charType'] as String?) == 'end',
      );
}

/// A reciter option from the per-ayah audio payload.
class Reciter {
  final String id; // the map key ("1".."10")
  final String name;
  final String url;

  Reciter({required this.id, required this.name, required this.url});
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
