// Surah reader — verse cards with authentic Hafs script, serif translations,
// optional transliteration, per-ayah audio (with reciter choice + continuous
// play), bookmarks, tafsir, similar verses, and word-by-word mode.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:share_plus/share_plus.dart';

import '../core/api.dart';
import '../core/library.dart';
import '../core/settings.dart';
import '../core/theme.dart';
import '../models.dart';
import '../widgets/verse_actions.dart';
import 'mushaf_screen.dart';

class SurahScreen extends StatefulWidget {
  final int surahNo;
  final int? initialAyah;
  const SurahScreen({super.key, required this.surahNo, this.initialAyah});

  @override
  State<SurahScreen> createState() => _SurahScreenState();
}

class _SurahScreenState extends State<SurahScreen> {
  SurahDetail? _detail;
  final List<Ayah> _ayahs = [];
  bool _loadingMore = false;
  bool _hasMore = true;
  String? _error;

  final _player = AudioPlayer();
  int? _playingAyah;
  bool _continuous = false;

  bool _wordByWord = false;
  Map<int, List<WordUnit>>? _words;

  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _load();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 900) {
        _loadMore();
      }
    });
    _player.playerStateStream.listen((state) {
      if (state.processingState == ProcessingState.completed && mounted) {
        if (_continuous) {
          _playNext();
        } else {
          setState(() => _playingAyah = null);
        }
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final data = await Api.instance.getJson('/api/quran/surah/${widget.surahNo}')
          as Map<String, dynamic>;
      final detail = SurahDetail.fromJson(data['surah'] as Map<String, dynamic>);
      if (!mounted) return;
      setState(() {
        _detail = detail;
        _ayahs
          ..clear()
          ..addAll(detail.ayahs);
        _hasMore = detail.ayahs.length < detail.info.totalAyah;
      });
      // Record where the reader is, and jump to a requested ayah.
      Library.instance.recordRead(ReadPosition(
        surahNumber: widget.surahNo,
        ayahNumber: widget.initialAyah ?? 1,
        surahName: detail.info.name,
      ));
      if (widget.initialAyah != null && widget.initialAyah! > 1) {
        _jumpToAyah(widget.initialAyah!);
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load the sūrah.');
    }
  }

  Future<void> _jumpToAyah(int ayah) async {
    // Ensure the ayah is loaded, then scroll it into view.
    while (_ayahs.length < ayah && _hasMore) {
      await _loadMore();
    }
    if (!mounted) return;
    await Future.delayed(const Duration(milliseconds: 300));
    if (_scroll.hasClients) {
      final target = (ayah - 1) * 210.0; // approx card height
      _scroll.animateTo(
        target.clamp(0, _scroll.position.maxScrollExtent),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || !_hasMore || _detail == null) return;
    _loadingMore = true;
    try {
      final data = await Api.instance.getJson(
        '/api/quran/surah/${widget.surahNo}/ayahs?offset=${_ayahs.length}&limit=30',
      ) as Map<String, dynamic>;
      final rows = (data['ayahs'] as List).cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() {
        for (final r in rows) {
          _ayahs.add(Ayah(
            number: r['number'] as int,
            arabic: r['arabicText'] as String? ?? '',
            translation: r['translationText'] as String?,
            transliteration: r['transliteration'] as String?,
          ));
        }
        _hasMore = data['hasMore'] as bool? ?? false;
      });
    } catch (_) {
      // transient — retried by next scroll tick
    } finally {
      _loadingMore = false;
    }
  }

  Future<void> _loadWords() async {
    if (_words != null) return;
    try {
      final data = await Api.instance.getJson('/api/quran/surah/${widget.surahNo}/words')
          as Map<String, dynamic>;
      final raw = data['words'] as Map<String, dynamic>? ?? {};
      final map = <int, List<WordUnit>>{};
      raw.forEach((k, v) {
        map[int.parse(k)] = (v as List)
            .map((e) => WordUnit.fromJson(e as Map<String, dynamic>))
            .where((w) => !w.isEnd)
            .toList();
      });
      if (mounted) setState(() => _words = map);
    } catch (_) {
      if (mounted) setState(() => _wordByWord = false);
    }
  }

  Future<String?> _resolveAudio(int ayahNo) async {
    try {
      final data = await Api.instance
          .getJson('/api/quran/audio/${widget.surahNo}/$ayahNo') as Map<String, dynamic>;
      final audio = data['audio'] as Map<String, dynamic>?;
      if (audio == null || audio.isEmpty) return null;
      final chosen = audio[Settings.instance.reciterId] ?? audio.values.first;
      final m = chosen as Map<String, dynamic>;
      return (m['originalUrl'] ?? m['url']) as String?;
    } catch (_) {
      return null;
    }
  }

  Future<void> _playAyah(int ayahNo, {bool continuous = false}) async {
    if (_playingAyah == ayahNo && !continuous) {
      await _player.stop();
      setState(() {
        _playingAyah = null;
        _continuous = false;
      });
      return;
    }
    final url = await _resolveAudio(ayahNo);
    if (url == null) return;
    setState(() {
      _playingAyah = ayahNo;
      _continuous = continuous;
    });
    try {
      await _player.setUrl(url);
      await _player.play();
      Library.instance.recordRead(ReadPosition(
        surahNumber: widget.surahNo,
        ayahNumber: ayahNo,
        surahName: _detail?.info.name,
      ));
    } catch (_) {
      if (mounted) setState(() => _playingAyah = null);
    }
  }

  Future<void> _playNext() async {
    final current = _playingAyah ?? 0;
    final next = current + 1;
    if (next > (_detail?.info.totalAyah ?? 0)) {
      setState(() {
        _playingAyah = null;
        _continuous = false;
      });
      return;
    }
    while (_ayahs.length < next && _hasMore) {
      await _loadMore();
    }
    if (_scroll.hasClients) {
      _scroll.animateTo(((next - 1) * 210.0).clamp(0, _scroll.position.maxScrollExtent),
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
    await _playAyah(next, continuous: true);
  }

  void _togglePlayAll() {
    if (_continuous) {
      _player.stop();
      setState(() {
        _continuous = false;
        _playingAyah = null;
      });
    } else {
      _playAyah(1, continuous: true);
    }
  }

  Future<void> _openMushaf() async {
    try {
      final data = await Api.instance.getJson('/api/quran/surah/${widget.surahNo}/page')
          as Map<String, dynamic>;
      final page = data['page'] as int? ?? 1;
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => MushafScreen(pageNo: page)));
    } catch (_) {}
  }

  void _openSurah(int surah, int ayah) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => SurahScreen(surahNo: surah, initialAyah: ayah)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    final info = _detail?.info;
    final showBismillah = widget.surahNo != 1 && widget.surahNo != 9;

    return Scaffold(
      appBar: AppBar(
        title: info == null
            ? const Text('…')
            : Text(info.arabicName, style: quranStyle(size: 24, height: 1.4)),
        actions: [
          IconButton(
            tooltip: _continuous ? 'Stop' : 'Play surah',
            onPressed: _detail == null ? null : _togglePlayAll,
            icon: Icon(_continuous ? Icons.stop : Icons.playlist_play),
          ),
          PopupMenuButton<String>(
            onSelected: (v) {
              switch (v) {
                case 'wbw':
                  setState(() => _wordByWord = !_wordByWord);
                  if (_wordByWord) _loadWords();
                case 'translit':
                  Settings.instance.setTransliteration(!Settings.instance.showTransliteration);
                case 'reciter':
                  _pickReciter();
                case 'mushaf':
                  _openMushaf();
              }
            },
            itemBuilder: (context) => [
              CheckedPopupMenuItem(
                  value: 'wbw', checked: _wordByWord, child: const Text('Word by word')),
              CheckedPopupMenuItem(
                  value: 'translit',
                  checked: Settings.instance.showTransliteration,
                  child: const Text('Transliteration')),
              const PopupMenuItem(value: 'reciter', child: Text('Reciter')),
              const PopupMenuItem(value: 'mushaf', child: Text('Open in Mushaf')),
            ],
          ),
        ],
      ),
      body: _error != null
          ? Center(child: Text(_error!))
          : _detail == null
              ? const Center(child: CircularProgressIndicator())
              : AnimatedBuilder(
                  animation: Library.instance.bookmarks,
                  builder: (context, _) => ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                    itemCount: _ayahs.length + (showBismillah ? 1 : 0) + 1,
                    itemBuilder: (context, i) {
                      if (i == 0) return _header(p, info!, showBismillah);
                      final idx = i - 1;
                      if (idx >= _ayahs.length) {
                        return _hasMore
                            ? const Padding(
                                padding: EdgeInsets.all(24),
                                child: Center(child: CircularProgressIndicator()))
                            : const SizedBox(height: 24);
                      }
                      return _ayahCard(p, _ayahs[idx]);
                    },
                  ),
                ),
    );
  }

  Widget _header(QPalette p, SurahInfo info, bool showBismillah) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        children: [
          Text(
            'SŪRAH ${info.surahNo} ✦ ${info.revelationPlace.toUpperCase()} ✦ ${info.totalAyah} ĀYĀT',
            style: TextStyle(
                fontSize: 10, letterSpacing: 2.2, fontWeight: FontWeight.w600, color: p.gold),
          ),
          if (showBismillah)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                  textDirection: TextDirection.rtl, style: quranStyle(size: 26, height: 1.8)),
            ),
        ],
      ),
    );
  }

  Widget _ayahCard(QPalette p, Ayah a) {
    final playing = _playingAyah == a.number;
    final bookmarked = Library.instance.isBookmarked(widget.surahNo, a.number);
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('${widget.surahNo}:${a.number}',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: p.gold)),
                const Spacer(),
                IconButton(
                  visualDensity: VisualDensity.compact,
                  onPressed: () => Library.instance.toggleBookmark(Bookmark(
                    surahNumber: widget.surahNo,
                    ayahNumber: a.number,
                    surahName: _detail?.info.name,
                  )),
                  icon: Icon(bookmarked ? Icons.bookmark : Icons.bookmark_border,
                      color: bookmarked ? p.gold : p.muted),
                ),
                IconButton(
                  visualDensity: VisualDensity.compact,
                  onPressed: () => _playAyah(a.number),
                  icon: Icon(playing ? Icons.stop_circle : Icons.play_circle, color: p.accent),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, color: p.muted),
                  onSelected: (v) {
                    final ref = '${_detail?.info.name ?? 'Sūrah ${widget.surahNo}'} ${widget.surahNo}:${a.number}';
                    switch (v) {
                      case 'tafsir':
                        showTafsirSheet(context, widget.surahNo, a.number);
                      case 'similar':
                        showSimilarSheet(context, widget.surahNo, a.number, _openSurah);
                      case 'copy':
                        copyAyah(context, a.arabic, a.translation, ref);
                      case 'share':
                        Share.share([a.arabic, if (a.translation != null) a.translation, '— $ref']
                                .join('\n'));
                    }
                  },
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: 'tafsir', child: Text('Tafsir')),
                    PopupMenuItem(value: 'similar', child: Text('Similar verses')),
                    PopupMenuItem(value: 'copy', child: Text('Copy')),
                    PopupMenuItem(value: 'share', child: Text('Share')),
                  ],
                ),
              ],
            ),
            if (_wordByWord)
              _wordByWordBody(p, a)
            else ...[
              Align(
                alignment: Alignment.centerRight,
                child: Text(a.arabic,
                    textDirection: TextDirection.rtl,
                    textAlign: TextAlign.right,
                    style: quranStyle(size: 26, height: 2.0)),
              ),
              if (Settings.instance.showTransliteration &&
                  a.transliteration != null &&
                  a.transliteration!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(a.transliteration!,
                      style: TextStyle(fontStyle: FontStyle.italic, fontSize: 13, color: p.muted)),
                ),
              if (a.translation != null && a.translation!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(a.translation!, style: readingStyle(context, size: 15)),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _wordByWordBody(QPalette p, Ayah a) {
    final words = _words?[a.number];
    if (words == null) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Directionality(
        textDirection: TextDirection.rtl,
        child: Wrap(
          alignment: WrapAlignment.center,
          spacing: 14,
          runSpacing: 14,
          children: [
            for (final w in words)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(w.arabic, style: quranStyle(size: 24, height: 1.6)),
                  if (w.transliteration != null)
                    Text(w.transliteration!,
                        textDirection: TextDirection.ltr,
                        style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: p.muted)),
                  if (w.translation != null)
                    Text(w.translation!,
                        textDirection: TextDirection.ltr,
                        style: TextStyle(fontSize: 12, color: p.accent)),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickReciter() async {
    // Fetch the reciter roster from any ayah's audio payload.
    Map<String, dynamic>? audio;
    try {
      final data = await Api.instance.getJson('/api/quran/audio/${widget.surahNo}/1')
          as Map<String, dynamic>;
      audio = data['audio'] as Map<String, dynamic>?;
    } catch (_) {}
    if (audio == null || !mounted) return;
    final reciters = audio.entries
        .map((e) => Reciter(id: e.key, name: (e.value['reciter'] ?? 'Reciter').toString(), url: ''))
        .toList();
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (context) => AnimatedBuilder(
        animation: Settings.instance,
        builder: (context, _) => ListView(
          shrinkWrap: true,
          children: [
            for (final r in reciters)
              RadioListTile<String>(
                value: r.id,
                groupValue: Settings.instance.reciterId,
                title: Text(r.name),
                onChanged: (v) {
                  if (v != null) Settings.instance.setReciter(v);
                  Navigator.of(context).pop();
                },
              ),
          ],
        ),
      ),
    );
  }
}
