// Maqāmāt — learn the melodic modes of recitation. Leads with the "hear the
// difference" comparison player (one sūrah across all 8 modes), then a card per
// mode with its character + an example you can play.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../core/theme.dart';
import '../data/maqamat.dart';
import 'surah_screen.dart';

class MaqamatScreen extends StatefulWidget {
  const MaqamatScreen({super.key});

  @override
  State<MaqamatScreen> createState() => _MaqamatScreenState();
}

class _MaqamatScreenState extends State<MaqamatScreen> {
  final _player = AudioPlayer();
  String? _playingKey; // 'cmp:<maqam>' or 'card:<index>'
  String? _nowPlaying; // label shown under the comparison chips

  @override
  void initState() {
    super.initState();
    _player.playerStateStream.listen((s) {
      if (s.processingState == ProcessingState.completed && mounted) {
        setState(() {
          _playingKey = null;
          _nowPlaying = null;
        });
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  /// Play [primary]; if it fails, fall back to [fallback]. [key] identifies the
  /// currently-playing control so the UI can highlight it.
  Future<void> _play(String key, String primary, {String? fallback, String? label}) async {
    if (_playingKey == key) {
      await _player.stop();
      setState(() {
        _playingKey = null;
        _nowPlaying = null;
      });
      return;
    }
    setState(() {
      _playingKey = key;
      _nowPlaying = label;
    });
    try {
      await _player.setUrl(primary);
      await _player.play();
    } catch (_) {
      if (fallback == null) {
        if (mounted) setState(() => _playingKey = null);
        return;
      }
      try {
        await _player.setUrl(fallback);
        await _player.play();
      } catch (_) {
        if (mounted) setState(() => _playingKey = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Maqāmāt')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(14, 8, 14, 28),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 4, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('THE MELODIES OF RECITATION',
                    style: TextStyle(
                        fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
                const SizedBox(height: 8),
                Text(
                  'Maqāmāt are the melodic modes a reciter moves through — each carries a different emotional colour. Once you read with tajwīd, these are how recitation becomes beautiful.',
                  style: readingStyle(context, size: 14, color: p.muted),
                ),
              ],
            ),
          ),
          _comparisonCard(p),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 4, 8),
            child: Text('EACH MODE',
                style: TextStyle(
                    fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
          ),
          for (var i = 0; i < kMaqamat.length; i++) _card(p, i, kMaqamat[i]),
        ],
      ),
    );
  }

  Widget _comparisonCard(QPalette p) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      color: const Color(0xFF0C1F1A),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('HEAR THE DIFFERENCE',
                style: TextStyle(
                    fontSize: 11, letterSpacing: 3, fontWeight: FontWeight.w700, color: QColors.nightGold)),
            const SizedBox(height: 8),
            Text(kComparisonPassage,
                style: quranStyle(size: 22, height: 1.5, color: const Color(0xFFF3EDD9))),
            const SizedBox(height: 6),
            const Text(
              'The same sūrah, eight melodies. Tap each mode and hear how the tune — not the words — changes the feeling.',
              style: TextStyle(color: Color(0xFFCFE8DD), fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final c in kMaqamComparison) _chip(c),
              ],
            ),
            if (_nowPlaying != null) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.graphic_eq, size: 16, color: QColors.nightGold),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('Now playing · $_nowPlaying',
                        style: const TextStyle(color: Color(0xFFCFE8DD), fontSize: 12)),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _chip(MaqamClip c) {
    final key = 'cmp:${c.maqam}';
    final active = _playingKey == key;
    return GestureDetector(
      onTap: () => _play(key, c.primaryUrl,
          fallback: c.fallbackUrl, label: '${c.maqam} · ${c.reciter}'),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: active ? QColors.nightGold : const Color(0xFF16302A),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: QColors.nightGold.withValues(alpha: active ? 1 : 0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(active ? Icons.stop : Icons.play_arrow,
                size: 16, color: active ? const Color(0xFF0C1F1A) : QColors.nightGold),
            const SizedBox(width: 6),
            Text(c.maqam,
                style: TextStyle(
                    color: active ? const Color(0xFF0C1F1A) : const Color(0xFFF3EDD9),
                    fontWeight: FontWeight.w600,
                    fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _card(QPalette p, int i, Maqam m) {
    final key = 'card:$i';
    final playing = _playingKey == key;
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(m.mood, style: TextStyle(fontSize: 12, color: p.accent, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Text(m.arabic,
                    textDirection: TextDirection.rtl, style: quranStyle(size: 26, height: 1.4, color: p.gold)),
              ],
            ),
            const SizedBox(height: 12),
            Text(m.character, style: readingStyle(context, size: 14)),
            const SizedBox(height: 10),
            Text('Often used for: ${m.whenUsed}',
                style: TextStyle(fontSize: 13, color: p.muted, height: 1.4)),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
              decoration: BoxDecoration(
                color: p.accent.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m.reciter, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        Text('${m.surahName} · ${m.surah}:${m.ayah}',
                            style: TextStyle(fontSize: 12, color: p.muted)),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: () => _play(key, m.audioUrl, label: '${m.name} · ${m.reciter}'),
                    icon: Icon(playing ? Icons.stop : Icons.play_arrow),
                  ),
                ],
              ),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => SurahScreen(surahNo: m.surah, initialAyah: m.ayah),
                )),
                child: Text('Read in context  →', style: TextStyle(color: p.accent)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
