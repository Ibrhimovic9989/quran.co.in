// Verse of the day — the deep-emerald + gold card, matching the web /today.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';
import 'surah_screen.dart';

class TodayScreen extends StatefulWidget {
  const TodayScreen({super.key});

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  DailyAyah? _ayah;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final data =
          await Api.instance.getJson('/api/quran/ayah-of-the-day') as Map<String, dynamic>;
      final ayahJson = data['ayah'] as Map<String, dynamic>?;
      if (ayahJson == null) throw Exception('empty');
      if (mounted) {
        setState(() => _ayah = DailyAyah.fromJson(ayahJson, data['type'] as String? ?? 'daily'));
      }
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load today\'s verse.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final a = _ayah;
    return Scaffold(
      appBar: AppBar(title: const Text('Verse of the Day')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 80),
                child: Center(child: Text(_error!)),
              )
            else if (a == null)
              const Padding(
                padding: EdgeInsets.only(top: 120),
                child: Center(child: CircularProgressIndicator()),
              )
            else
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0C1F1A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: QColors.nightGold.withValues(alpha: 0.4)),
                ),
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
                child: Column(
                  children: [
                    Text(
                      a.type == 'personalised' ? 'CHOSEN FOR YOU' : 'AYAH OF THE DAY',
                      style: const TextStyle(
                        color: QColors.nightGold,
                        fontSize: 10,
                        letterSpacing: 3,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      a.arabicText,
                      textDirection: TextDirection.rtl,
                      textAlign: TextAlign.center,
                      style: quranStyle(size: 27, height: 2.0, color: const Color(0xFFF3EDD9)),
                    ),
                    if (a.translationText != null) ...[
                      const SizedBox(height: 18),
                      Text(
                        a.translationText!,
                        textAlign: TextAlign.center,
                        style: readingStyle(context, size: 15, color: const Color(0xFFCFE8DD)),
                      ),
                    ],
                    const SizedBox(height: 18),
                    TextButton(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => SurahScreen(surahNo: a.surahNumber)),
                      ),
                      child: Text(
                        '${a.englishName} · ${a.surahNumber}:${a.ayahNumber} →',
                        style: const TextStyle(color: QColors.nightGold),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
