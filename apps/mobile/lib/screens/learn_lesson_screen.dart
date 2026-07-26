// One Learn-to-read lesson: a teaching card, the letters or reading rows,
// confusable-pair contrasts, and a bridge into the real muṣḥaf. Audio streams
// Ḥuṣarī "Muʿallim" recitation for words/āyāt; per-letter audio arrives later.

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../core/learn_progress.dart';
import '../core/theme.dart';
import '../data/learn_lessons.dart';
import '../widgets/learn_widgets.dart';
import 'surah_screen.dart';

class LearnLessonScreen extends StatefulWidget {
  final int index; // into kLearnLessons
  const LearnLessonScreen({super.key, required this.index});

  @override
  State<LearnLessonScreen> createState() => _LearnLessonScreenState();
}

class _LearnLessonScreenState extends State<LearnLessonScreen> {
  final _player = AudioPlayer();
  late int _index = widget.index;

  LearnLesson get l => kLearnLessons[_index];

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _play(String ref) async {
    try {
      await _player.setUrl(ayahAudioUrl(ref));
      await _player.play();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Couldn’t play the recitation just now.')));
      }
    }
  }

  void _go(int to) {
    _player.stop();
    setState(() => _index = to);
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    final isLetters = l.kind == LearnKind.letters || l.kind == LearnKind.forms;
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(child: Text(l.title, overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 8),
            Text(l.titleAr, textDirection: TextDirection.rtl, style: quranStyle(size: 18, height: 1.3, color: p.gold)),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          Text('LESSON ${l.number} / 17',
              style: TextStyle(fontSize: 11, letterSpacing: 1.8, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 10),

          // Teaching card.
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: p.accent.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(l.teach, style: readingStyle(context, size: 14.5)),
                if (l.tip != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.lightbulb_outline, size: 18, color: p.gold),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(l.tip!,
                            style: TextStyle(fontSize: 13, color: p.muted, height: 1.5, fontWeight: FontWeight.w500)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          if (isLetters && l.letters.isNotEmpty) ...[
            _label(p, l.kind == LearnKind.letters ? 'TAP A LETTER TO LEARN IT' : 'TAP TO SEE ITS FORMS'),
            const SizedBox(height: 12),
            LetterGrid(indices: l.letters),
            const SizedBox(height: 20),
          ],

          if (l.rows.isNotEmpty) ...[
            _label(p, isLetters ? 'THEN READ THESE' : 'READ ACROSS'),
            const SizedBox(height: 12),
            ReadingRows(rows: l.rows, onPlay: (t) => t.audioRef != null ? _play(t.audioRef!) : null),
            const SizedBox(height: 8),
          ],

          if (l.contrasts.isNotEmpty) ...[
            const SizedBox(height: 12),
            _label(p, 'TELL THEM APART'),
            const SizedBox(height: 10),
            for (final c in l.contrasts) _contrastRow(p, c),
          ],

          if (l.bridge != null) ...[
            const SizedBox(height: 20),
            _bridgeCard(context, p, l.bridge!),
          ],

          const SizedBox(height: 24),
          _completeButton(p),
          const SizedBox(height: 12),
          _navRow(p),
        ],
      ),
    );
  }

  Widget _label(QPalette p, String s) =>
      Text(s, style: TextStyle(fontSize: 11, letterSpacing: 1.6, fontWeight: FontWeight.w700, color: p.gold));

  Widget _contrastRow(QPalette p, LearnContrast c) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(c.a, textDirection: TextDirection.rtl, style: quranStyle(size: 30, height: 1.2, color: p.ink)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text('vs', style: TextStyle(fontSize: 12, color: p.muted)),
          ),
          Text(c.b, textDirection: TextDirection.rtl, style: quranStyle(size: 30, height: 1.2, color: p.ink)),
          const SizedBox(width: 14),
          Expanded(child: Text(c.note, style: TextStyle(fontSize: 12.5, color: p.muted, height: 1.4))),
        ],
      ),
    );
  }

  Widget _bridgeCard(BuildContext context, QPalette p, LearnBridge b) {
    final parts = b.ref.split(':');
    final surah = int.parse(parts[0]);
    final ayah = int.parse(parts[1]);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: p.gold.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('FROM THE QURʾĀN',
              style: TextStyle(fontSize: 10.5, letterSpacing: 1.6, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 10),
          Center(
            child: Text(b.word,
                textDirection: TextDirection.rtl,
                textAlign: TextAlign.center,
                style: quranStyle(size: 30, height: 1.9, color: p.ink)),
          ),
          const SizedBox(height: 4),
          Center(child: Text(b.translit, style: TextStyle(fontSize: 13, color: p.muted, fontStyle: FontStyle.italic))),
          const SizedBox(height: 12),
          Text(b.note, style: TextStyle(fontSize: 13.5, color: p.ink, height: 1.5)),
          const SizedBox(height: 10),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () => _play(b.ref),
                icon: const Icon(Icons.volume_up, size: 18),
                label: const Text('Hear it'),
                style: OutlinedButton.styleFrom(foregroundColor: p.accent, side: BorderSide(color: p.line)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => SurahScreen(surahNo: surah, initialAyah: ayah))),
                  icon: const Icon(Icons.menu_book_outlined, size: 18),
                  label: const Text('Read in the muṣḥaf'),
                  style: FilledButton.styleFrom(backgroundColor: p.accent),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _completeButton(QPalette p) {
    return AnimatedBuilder(
      animation: LearnProgress.instance,
      builder: (context, _) {
        final done = LearnProgress.instance.isDone(l.slug);
        return FilledButton.icon(
          onPressed: () => LearnProgress.instance.toggle(l.slug),
          icon: Icon(done ? Icons.check_circle : Icons.check_circle_outline, size: 20),
          label: Text(done ? 'Completed' : 'Mark as complete'),
          style: FilledButton.styleFrom(
            backgroundColor: done ? p.accent : p.surface,
            foregroundColor: done ? Colors.white : p.accent,
            side: BorderSide(color: p.accent),
            minimumSize: const Size.fromHeight(48),
            elevation: 0,
          ),
        );
      },
    );
  }

  Widget _navRow(QPalette p) {
    return Row(
      children: [
        if (_index > 0)
          Expanded(
            child: TextButton.icon(
              onPressed: () => _go(_index - 1),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: Text('Lesson ${l.number - 1}'),
              style: TextButton.styleFrom(foregroundColor: p.muted),
            ),
          ),
        if (_index < kLearnLessons.length - 1)
          Expanded(
            child: TextButton(
              onPressed: () {
                LearnProgress.instance.markDone(l.slug);
                _go(_index + 1);
              },
              style: TextButton.styleFrom(foregroundColor: p.accent),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [Text('Next: ${kLearnLessons[_index + 1].title}'), const Icon(Icons.arrow_forward, size: 18)],
              ),
            ),
          ),
      ],
    );
  }
}
