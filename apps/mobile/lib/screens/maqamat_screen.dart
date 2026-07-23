// Maqāmāt — learn the melodic modes of recitation. A curated teaching module:
// each mode's character + a master reciter's example you can play inline.

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
  int? _playing; // index of the maqam currently playing

  @override
  void initState() {
    super.initState();
    _player.playerStateStream.listen((s) {
      if (s.processingState == ProcessingState.completed && mounted) {
        setState(() => _playing = null);
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _toggle(int i) async {
    if (_playing == i) {
      await _player.stop();
      setState(() => _playing = null);
      return;
    }
    setState(() => _playing = i);
    try {
      await _player.setUrl(kMaqamat[i].audioUrl);
      await _player.play();
    } catch (_) {
      if (mounted) setState(() => _playing = null);
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
            padding: const EdgeInsets.fromLTRB(4, 4, 4, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('THE MELODIES OF RECITATION',
                    style: TextStyle(
                        fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
                const SizedBox(height: 8),
                Text(
                  'Maqāmāt are the melodic modes a reciter moves through — each carries a different emotional colour. Once you read with tajwīd, these are how recitation becomes beautiful. Listen to each, then try to imitate it.',
                  style: readingStyle(context, size: 14, color: p.muted),
                ),
              ],
            ),
          ),
          for (var i = 0; i < kMaqamat.length; i++) _card(p, i, kMaqamat[i]),
        ],
      ),
    );
  }

  Widget _card(QPalette p, int i, Maqam m) {
    final playing = _playing == i;
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
                    onPressed: () => _toggle(i),
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
