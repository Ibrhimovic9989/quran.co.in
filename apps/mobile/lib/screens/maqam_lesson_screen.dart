// A guided maqām lesson: watch the melody's shape on the ribbon while a master
// reciter demonstrates it phrase by phrase, with a plain cue for each phrase.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../core/theme.dart';
import '../data/maqam_lessons.dart';
import '../widgets/maqam_ribbon.dart';
import 'surah_screen.dart';

class MaqamLessonScreen extends StatefulWidget {
  final MaqamLesson lesson;
  const MaqamLessonScreen({super.key, required this.lesson});

  @override
  State<MaqamLessonScreen> createState() => _MaqamLessonScreenState();
}

class _MaqamLessonScreenState extends State<MaqamLessonScreen> {
  final _player = AudioPlayer();
  int _active = -1; // playing phrase index, -1 when idle
  bool _playing = false;
  bool _slow = false;
  bool _built = false;

  MaqamLesson get l => widget.lesson;

  @override
  void initState() {
    super.initState();
    _player.currentIndexStream.listen((i) {
      if (i != null && mounted) setState(() => _active = i);
    });
    _player.playerStateStream.listen((s) {
      if (s.processingState == ProcessingState.completed && mounted) {
        setState(() {
          _playing = false;
          _active = -1;
        });
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _listen() async {
    if (_playing) {
      await _player.pause();
      setState(() => _playing = false);
      return;
    }
    setState(() => _playing = true);
    try {
      if (!_built) {
        await _player.setAudioSource(ConcatenatingAudioSource(
          children: [for (var i = 0; i < l.phrases.length; i++) AudioSource.uri(Uri.parse(l.audioUrl(i)))],
        ));
        _built = true;
      }
      if (_active < 0) await _player.seek(Duration.zero, index: 0);
      await _player.setSpeed(_slow ? 0.75 : 1.0);
      await _player.play();
    } catch (_) {
      if (mounted) setState(() => _playing = false);
    }
  }

  Future<void> _restart() async {
    if (!_built) return;
    await _player.seek(Duration.zero, index: 0);
    if (!_playing) {
      setState(() => _playing = true);
      await _player.play();
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    final show = _active >= 0 ? _active : 0;
    final phrase = l.phrases[show];
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l.maqam),
            const SizedBox(width: 8),
            Text(l.arabic, textDirection: TextDirection.rtl, style: quranStyle(size: 20, height: 1.3, color: p.gold)),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
        children: [
          Text(l.mood, style: TextStyle(color: p.accent, fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          Text(l.shape, style: readingStyle(context, size: 14, color: p.muted)),
          const SizedBox(height: 16),

          MaqamRibbon(phrases: l.phrases, activeIndex: _active),
          const SizedBox(height: 18),

          // Current phrase card.
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: p.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: p.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PHRASE ${show + 1} / ${l.phrases.length}',
                    style: TextStyle(fontSize: 11, letterSpacing: 1.5, fontWeight: FontWeight.w700, color: p.gold)),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(phrase.arabic,
                      textDirection: TextDirection.rtl,
                      textAlign: TextAlign.right,
                      style: quranStyle(size: 26, height: 1.9)),
                ),
                const SizedBox(height: 8),
                Text(phrase.translit,
                    style: TextStyle(fontStyle: FontStyle.italic, fontSize: 14, color: p.muted)),
                const SizedBox(height: 14),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.graphic_eq, size: 18, color: p.accent),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(phrase.cue,
                          style: TextStyle(fontSize: 15, height: 1.5, fontWeight: FontWeight.w500, color: p.ink)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Controls.
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: _listen,
                  icon: Icon(_playing ? Icons.pause : Icons.play_arrow),
                  label: Text(_playing ? 'Pause' : 'Listen'),
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
              const SizedBox(width: 10),
              _pill(p, _slow ? '0.75×' : '1×', Icons.slow_motion_video, _slow, () {
                setState(() => _slow = !_slow);
                if (_playing) _player.setSpeed(_slow ? 0.75 : 1.0);
              }),
              const SizedBox(width: 8),
              _pill(p, 'Restart', Icons.replay, false, _restart),
            ],
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => SurahScreen(surahNo: 1, initialAyah: show + 1))),
              child: Text('Read Al-Fātiḥah in context  →', style: TextStyle(color: p.accent)),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'The shape is a teaching guide — reciters express each maqām differently. Tajwīd always comes first; the melody is beauty layered on top.',
            style: TextStyle(fontSize: 12, color: p.muted, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _pill(QPalette p, String label, IconData icon, bool active, VoidCallback onTap) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: active ? p.accent : p.muted,
        side: BorderSide(color: active ? p.accent : p.line),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }
}
