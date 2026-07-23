// Surah index — gold medallions + mushaf-script names, matching the web.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';
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

  @override
  void initState() {
    super.initState();
    _load();
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
    final dark = Theme.of(context).brightness == Brightness.dark;
    final surahs = _surahs
        ?.where((s) =>
            _query.isEmpty ||
            s.name.toLowerCase().contains(_query.toLowerCase()) ||
            s.translation.toLowerCase().contains(_query.toLowerCase()) ||
            s.surahNo.toString() == _query)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('القرآن الكريم', style: quranStyle(size: 26, height: 1.4)),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _error != null
            ? ListView(children: [
                const SizedBox(height: 120),
                Center(child: Text(_error!)),
              ])
            : surahs == null
                ? const Center(child: CircularProgressIndicator())
                : Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                        child: TextField(
                          onChanged: (v) => setState(() => _query = v),
                          decoration: InputDecoration(
                            hintText: 'Search sūrah…',
                            prefixIcon: const Icon(Icons.search),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            isDense: true,
                          ),
                        ),
                      ),
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
                                  MaterialPageRoute(
                                    builder: (_) => SurahScreen(surahNo: s.surahNo),
                                  ),
                                ),
                                leading: _Medallion(number: s.surahNo, dark: dark),
                                title: Text(
                                  s.name,
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                subtitle: Text(
                                  '${s.translation} · ${s.totalAyah} āyāt',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: dark ? QColors.nightMuted : QColors.muted,
                                  ),
                                ),
                                trailing: Text(
                                  s.arabicName,
                                  textDirection: TextDirection.rtl,
                                  style: quranStyle(size: 22, height: 1.5),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
      ),
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
            angle: 0.785398, // 45°
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
          Text(
            '$number',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: dark ? QColors.nightGold : QColors.goldText,
            ),
          ),
        ],
      ),
    );
  }
}
