// Surah reader — verse cards with the authentic Hafs script, serif
// translations, per-ayah audio (native playback), infinite scroll.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';

class SurahScreen extends StatefulWidget {
  final int surahNo;
  const SurahScreen({super.key, required this.surahNo});

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
        setState(() => _playingAyah = null);
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
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load the sūrah.');
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

  Future<void> _playAyah(int ayahNo) async {
    if (_playingAyah == ayahNo) {
      await _player.stop();
      setState(() => _playingAyah = null);
      return;
    }
    try {
      final data = await Api.instance
          .getJson('/api/quran/audio/${widget.surahNo}/$ayahNo') as Map<String, dynamic>;
      final audio = data['audio'] as Map<String, dynamic>?;
      if (audio == null || audio.isEmpty) return;
      final first = audio.values.first as Map<String, dynamic>;
      final url = (first['originalUrl'] ?? first['url']) as String?;
      if (url == null) return;
      setState(() => _playingAyah = ayahNo);
      await _player.setUrl(url);
      await _player.play();
    } catch (_) {
      if (mounted) setState(() => _playingAyah = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final info = _detail?.info;
    final showBismillah = widget.surahNo != 1 && widget.surahNo != 9;

    return Scaffold(
      appBar: AppBar(
        title: info == null
            ? const Text('…')
            : Text(info.arabicName, style: quranStyle(size: 24, height: 1.4)),
      ),
      body: _error != null
          ? Center(child: Text(_error!))
          : _detail == null
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                  itemCount: _ayahs.length + (showBismillah ? 1 : 0) + 1,
                  itemBuilder: (context, i) {
                    // Header row: kicker + bismillah
                    if (i == 0) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Column(
                          children: [
                            Text(
                              'SŪRAH ${info!.surahNo} ✦ ${info.revelationPlace.toUpperCase()} ✦ ${info.totalAyah} ĀYĀT',
                              style: TextStyle(
                                fontSize: 10,
                                letterSpacing: 2.2,
                                fontWeight: FontWeight.w600,
                                color: dark ? QColors.nightGold : QColors.goldText,
                              ),
                            ),
                            if (showBismillah)
                              Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Text(
                                  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                                  textDirection: TextDirection.rtl,
                                  style: quranStyle(size: 26, height: 1.8),
                                ),
                              ),
                          ],
                        ),
                      );
                    }
                    final idx = i - 1;
                    if (idx >= _ayahs.length) {
                      return _hasMore
                          ? const Padding(
                              padding: EdgeInsets.all(24),
                              child: Center(child: CircularProgressIndicator()),
                            )
                          : const SizedBox(height: 24);
                    }
                    final a = _ayahs[idx];
                    final playing = _playingAyah == a.number;
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  '${widget.surahNo}:${a.number}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                    color: dark ? QColors.nightGold : QColors.goldText,
                                  ),
                                ),
                                const Spacer(),
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () => _playAyah(a.number),
                                  icon: Icon(
                                    playing ? Icons.stop_circle : Icons.play_circle,
                                    color: dark ? QColors.nightAccent : QColors.accent,
                                  ),
                                ),
                              ],
                            ),
                            Align(
                              alignment: Alignment.centerRight,
                              child: Text(
                                a.arabic,
                                textDirection: TextDirection.rtl,
                                textAlign: TextAlign.right,
                                style: quranStyle(size: 26, height: 2.0),
                              ),
                            ),
                            if (a.translation != null && a.translation!.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 10),
                                child: Text(a.translation!, style: readingStyle(context, size: 15)),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
