// Read tab — surah index (gold medallions) + Juz view, continue-reading
// banner, semantic search and settings shortcuts.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/library.dart';
import '../core/theme.dart';
import '../data/revelation_order.dart';
import '../models.dart';
import 'juz_screen.dart';
import 'search_screen.dart';
import 'settings_screen.dart';
import 'surah_screen.dart';

class SurahListScreen extends StatefulWidget {
  const SurahListScreen({super.key});

  @override
  State<SurahListScreen> createState() => _SurahListScreenState();
}

class _SurahListScreenState extends State<SurahListScreen> {
  List<SurahInfo>? _surahs;
  String? _error;
  String _query = '';
  int _tab = 0; // 0 = Surahs, 1 = Juz, 2 = Revelation order

  @override
  void initState() {
    super.initState();
    _load();
    Library.instance.refreshLastRead();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final data = await Api.instance.getJson('/api/quran/surahs') as Map<String, dynamic>;
      final list = (data['surahs'] as List)
          .map((s) => SurahInfo.fromJson(s as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _surahs = list);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load sūrahs. Pull to retry.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    final dark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('القرآن الكريم', style: quranStyle(size: 26, height: 1.4)),
        actions: [
          IconButton(
            tooltip: 'Search',
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const SearchScreen())),
          ),
          IconButton(
            tooltip: 'Settings',
            icon: const Icon(Icons.tune),
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _error != null
            ? ListView(children: [const SizedBox(height: 120), Center(child: Text(_error!))])
            : _surahs == null
                ? const Center(child: CircularProgressIndicator())
                : Column(
                    children: [
                      _continueBanner(p),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                        child: SegmentedButton<int>(
                          showSelectedIcon: false,
                          segments: const [
                            ButtonSegment(value: 0, label: Text('Sūrahs')),
                            ButtonSegment(value: 1, label: Text('Juz')),
                            ButtonSegment(value: 2, label: Text('Revealed')),
                          ],
                          selected: {_tab},
                          onSelectionChanged: (s) => setState(() => _tab = s.first),
                        ),
                      ),
                      Expanded(
                        child: switch (_tab) {
                          1 => const JuzListScreen(),
                          2 => _revelationList(p, dark),
                          _ => _surahList(p, dark),
                        },
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _continueBanner(QPalette p) {
    return ValueListenableBuilder<ReadPosition?>(
      valueListenable: Library.instance.lastRead,
      builder: (context, pos, _) {
        if (pos == null) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
          child: Material(
            color: p.accent.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => SurahScreen(surahNo: pos.surahNumber, initialAyah: pos.ayahNumber),
              )),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Icon(Icons.play_circle_fill, color: p.accent),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Continue reading',
                              style: TextStyle(
                                  fontSize: 11, letterSpacing: 1, fontWeight: FontWeight.w700, color: p.accent)),
                          const SizedBox(height: 2),
                          Text('${pos.surahName ?? 'Sūrah ${pos.surahNumber}'} · ${pos.surahNumber}:${pos.ayahNumber}',
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right, color: p.muted),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _surahList(QPalette p, bool dark) {
    final surahs = _surahs!
        .where((s) =>
            _query.isEmpty ||
            s.name.toLowerCase().contains(_query.toLowerCase()) ||
            s.translation.toLowerCase().contains(_query.toLowerCase()) ||
            s.surahNo.toString() == _query)
        .toList();
    return Column(
      children: [
        _searchField('Search sūrah…'),
        Expanded(
          child: ListView.builder(
            itemCount: surahs.length,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemBuilder: (context, i) {
              final s = surahs[i];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => SurahScreen(surahNo: s.surahNo)),
                  ),
                  leading: _Medallion(number: s.surahNo, dark: dark),
                  title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${s.translation} · ${s.totalAyah} āyāt',
                      style: TextStyle(fontSize: 12, color: p.muted)),
                  trailing: Text(s.arabicName,
                      textDirection: TextDirection.rtl, style: quranStyle(size: 22, height: 1.5)),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _searchField(String hint) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: TextField(
        onChanged: (v) => setState(() => _query = v),
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
          isDense: true,
        ),
      ),
    );
  }

  // Surahs in the chronological order they were revealed (Tanzil ordering).
  Widget _revelationList(QPalette p, bool dark) {
    final byNo = {for (final s in _surahs!) s.surahNo: s};
    final q = _query.toLowerCase();
    final entries = <({int order, SurahInfo info, bool meccan})>[];
    for (var i = 0; i < revelationOrderSurahs.length; i++) {
      final info = byNo[revelationOrderSurahs[i]];
      if (info == null) continue;
      final order = i + 1;
      if (_query.isNotEmpty &&
          !info.name.toLowerCase().contains(q) &&
          !info.translation.toLowerCase().contains(q) &&
          info.surahNo.toString() != _query &&
          order.toString() != _query) {
        continue;
      }
      entries.add((order: order, info: info, meccan: i < meccanCount));
    }
    return Column(
      children: [
        _searchField('Search by name or order…'),
        Expanded(
          child: ListView.builder(
            itemCount: entries.length,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemBuilder: (context, i) {
              final e = entries[i];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 4),
                child: ListTile(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => SurahScreen(surahNo: e.info.surahNo)),
                  ),
                  leading: _Medallion(number: e.info.surahNo, dark: dark),
                  title: Text(e.info.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Row(
                    children: [
                      Text('Revealed #${e.order}',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600, color: p.accent)),
                      Text('  ·  ${e.meccan ? 'Meccan' : 'Medinan'}',
                          style: TextStyle(fontSize: 12, color: p.muted)),
                    ],
                  ),
                  trailing: Text(e.info.arabicName,
                      textDirection: TextDirection.rtl, style: quranStyle(size: 22, height: 1.5)),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _Medallion extends StatelessWidget {
  final int number;
  final bool dark;
  const _Medallion({required this.number, required this.dark});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 40,
      height: 40,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Transform.rotate(
            angle: 0.785398,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(7),
                border: Border.all(color: dark ? QColors.nightGold : QColors.gold),
                color: (dark ? QColors.nightGold : QColors.goldSoft).withValues(alpha: 0.15),
              ),
            ),
          ),
          Text('$number',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: dark ? QColors.nightGold : QColors.goldText)),
        ],
      ),
    );
  }
}
