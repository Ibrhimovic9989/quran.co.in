// Juz (para) browsing — the 30-part division, with a paginated reader.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/settings.dart';
import '../core/theme.dart';
import 'surah_screen.dart';

class JuzListScreen extends StatelessWidget {
  const JuzListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: 30,
      itemBuilder: (context, i) {
        final juz = i + 1;
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 5),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: p.surface,
              child: Text('$juz',
                  style: TextStyle(color: p.gold, fontWeight: FontWeight.w700, fontSize: 14)),
            ),
            title: Text('Juz $juz', style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('Para'),
            trailing: Icon(Icons.chevron_right, color: p.muted),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => JuzReaderScreen(juz: juz)),
            ),
          ),
        );
      },
    );
  }
}

class _JuzAyah {
  final int surahNo;
  final int ayahNo;
  final String surahName;
  final String arabic;
  final String? translation;
  final String? transliteration;
  _JuzAyah(this.surahNo, this.ayahNo, this.surahName, this.arabic, this.translation,
      this.transliteration);
}

class JuzReaderScreen extends StatefulWidget {
  final int juz;
  const JuzReaderScreen({super.key, required this.juz});

  @override
  State<JuzReaderScreen> createState() => _JuzReaderScreenState();
}

class _JuzReaderScreenState extends State<JuzReaderScreen> {
  final List<_JuzAyah> _ayahs = [];
  bool _loading = false;
  bool _hasMore = true;
  String? _error;
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadMore();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 800) _loadMore();
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    _loading = true;
    try {
      final data = await Api.instance
          .getJson('/api/quran/juz/${widget.juz}?offset=${_ayahs.length}&limit=20')
          as Map<String, dynamic>;
      final rows = (data['ayahs'] as List? ?? []).cast<Map<String, dynamic>>();
      final total = data['totalAyahs'] as int? ?? 0;
      if (!mounted) return;
      setState(() {
        for (final r in rows) {
          _ayahs.add(_JuzAyah(
            r['surahNo'] as int,
            r['ayahNo'] as int,
            r['surahName'] as String? ?? '',
            r['arabic1'] as String? ?? '',
            r['english'] as String?,
            r['arabic2'] as String?,
          ));
        }
        _hasMore = _ayahs.length < total && rows.isNotEmpty;
      });
    } catch (_) {
      if (mounted && _ayahs.isEmpty) setState(() => _error = 'Could not load Juz ${widget.juz}.');
    } finally {
      _loading = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: Text('Juz ${widget.juz}')),
      body: _error != null
          ? Center(child: Text(_error!))
          : _ayahs.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
                  itemCount: _ayahs.length + 1,
                  itemBuilder: (context, i) {
                    if (i >= _ayahs.length) {
                      return _hasMore
                          ? const Padding(
                              padding: EdgeInsets.all(24),
                              child: Center(child: CircularProgressIndicator()))
                          : const SizedBox(height: 24);
                    }
                    final a = _ayahs[i];
                    final isSurahStart = i == 0 || _ayahs[i - 1].surahNo != a.surahNo;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (isSurahStart)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            child: InkWell(
                              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                                builder: (_) => SurahScreen(surahNo: a.surahNo))),
                              child: Text('SŪRAH ${a.surahNo} · ${a.surahName.toUpperCase()}',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontSize: 11,
                                      letterSpacing: 1.6,
                                      fontWeight: FontWeight.w700,
                                      color: p.gold)),
                            ),
                          ),
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 5),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${a.surahNo}:${a.ayahNo}',
                                    style: TextStyle(
                                        fontWeight: FontWeight.w700, fontSize: 12, color: p.gold)),
                                const SizedBox(height: 6),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: Text(a.arabic,
                                      textDirection: TextDirection.rtl,
                                      textAlign: TextAlign.right,
                                      style: quranStyle(size: 25, height: 2.0)),
                                ),
                                if (Settings.instance.showTransliteration &&
                                    a.transliteration != null &&
                                    a.transliteration!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(a.transliteration!,
                                        style: TextStyle(
                                            fontStyle: FontStyle.italic, fontSize: 13, color: p.muted)),
                                  ),
                                if (a.translation != null && a.translation!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 10),
                                    child: Text(a.translation!, style: readingStyle(context, size: 15)),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
    );
  }
}
