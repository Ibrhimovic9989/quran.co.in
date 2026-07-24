// A guided maqām lesson: watch the melody's shape on the ribbon while a master
// reciter demonstrates it phrase by phrase, with a plain cue for each phrase.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../core/pitch.dart';
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

  // "Your turn" mic practice.
  final _pitch = PitchSession();
  final List<double> _samplesHz = [];
  List<double> _userLevels = [];
  bool _recording = false;
  int? _score;
  String? _micError;

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
    _pitch.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    await _player.pause();
    setState(() {
      _playing = false;
      _micError = null;
      _score = null;
      _samplesHz.clear();
      _userLevels = [];
    });
    final err = await _pitch.start((hz) {
      _samplesHz.add(hz);
      if (mounted) setState(() => _userLevels = [..._userLevels, pitchToLevel(hz)]);
    });
    if (err != null) {
      if (mounted) setState(() => _micError = err);
      return;
    }
    if (mounted) setState(() => _recording = true);
  }

  Future<void> _stopRecording() async {
    await _pitch.stop();
    if (mounted) {
      setState(() {
        _recording = false;
        _score = shapeMatch(_samplesHz, l.phrases.map((p) => p.pitch).toList());
      });
    }
  }

  String _feedback(int s) {
    if (s >= 75) return 'Beautiful — your voice followed the shape. Try again, a little slower and fuller.';
    if (s >= 55) return 'Good — you’re getting the journey. Watch where the line climbs and settles home.';
    if (s >= 35) return 'A start. Listen once more, then let your voice rise and fall with the line.';
    return 'Keep going — press Listen, hum along with the shape, then try again. Recite the whole sūrah for the best trace.';
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

          MaqamRibbon(
            phrases: l.phrases,
            activeIndex: _active,
            userContour: _userLevels.length > 1 ? _userLevels : null,
          ),
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
          const SizedBox(height: 18),

          // Your turn.
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: p.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: p.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Your turn', style: TextStyle(fontWeight: FontWeight.w700, color: p.ink)),
                          const SizedBox(height: 2),
                          Text('Recite Al-Fātiḥah — follow the shape. We’ll trace your melody.',
                              style: TextStyle(fontSize: 12, color: p.muted)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    FilledButton.icon(
                      onPressed: _recording ? _stopRecording : _startRecording,
                      icon: Icon(_recording ? Icons.stop : Icons.mic, size: 18),
                      label: Text(_recording ? 'Stop' : 'Your turn'),
                      style: FilledButton.styleFrom(
                        backgroundColor: _recording ? Colors.red.shade600 : p.accent,
                      ),
                    ),
                  ],
                ),
                if (_recording)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Row(
                      children: [
                        Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text('Listening… recite now, watch your line.',
                            style: TextStyle(fontSize: 12, color: p.accent)),
                      ],
                    ),
                  ),
                if (_micError != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(_micError!, style: TextStyle(fontSize: 12, color: Colors.red.shade600)),
                  ),
                if (_score != null && !_recording)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text('$_score%',
                                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: p.ink)),
                            const SizedBox(width: 8),
                            Text('shape match',
                                style: TextStyle(fontWeight: FontWeight.w600, color: p.accent)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(_feedback(_score!),
                            style: TextStyle(fontSize: 13, color: p.muted, height: 1.5)),
                      ],
                    ),
                  ),
              ],
            ),
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
