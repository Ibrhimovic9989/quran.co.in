// Learn to Read — the Noorani-Qāʿidah arc for readers coming from
// transliteration. Honest framing: transliteration is scaffolding to shed. The
// hub shows gentle progress (lessons completed, no streak) over four stages.

import 'package:flutter/material.dart';

import '../core/learn_progress.dart';
import '../core/theme.dart';
import '../data/learn_lessons.dart';
import 'learn_lesson_screen.dart';

class LearnScreen extends StatelessWidget {
  const LearnScreen({super.key});

  static const _stages = [
    ('The Letters', 1, 3),
    ('Vowels & Sounds', 4, 9),
    ('Rests & Doubling', 10, 15),
    ('Reading the Qurʾān', 16, 17),
  ];

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Learn to Read')),
      body: AnimatedBuilder(
        animation: LearnProgress.instance,
        builder: (context, _) {
          final done = LearnProgress.instance.completedCount;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
            children: [
              Text('FROM TRANSLITERATION TO THE SCRIPT',
                  style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
              const SizedBox(height: 8),
              Text(
                'If you read the Qurʾān through English letters, this is the way off them. Step by step — the letters, their sounds, the vowels — until you read the script itself. Transliteration got you here; these lessons help you leave it behind.',
                style: readingStyle(context, size: 14, color: p.muted),
              ),
              const SizedBox(height: 16),
              _progressCard(p, done),
              const SizedBox(height: 24),
              for (final stage in _stages) ...[
                Text(stage.$1.toUpperCase(),
                    style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
                const SizedBox(height: 10),
                for (var n = stage.$2; n <= stage.$3; n++) _lessonCard(context, p, n - 1),
                const SizedBox(height: 18),
              ],
              Text(
                'Tajwīd always comes first — beautiful recitation is layered on top of correct reading. Spoken audio for each letter, recorded by a qārī, is on the way.',
                style: TextStyle(fontSize: 12, color: p.muted, height: 1.5),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _progressCard(QPalette p, int done) {
    final pct = done / kLearnLessons.length;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.accent.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('$done', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: p.ink)),
              Text(' / ${kLearnLessons.length} lessons', style: TextStyle(fontSize: 14, color: p.muted)),
              const Spacer(),
              if (done > 0)
                Text('${(pct * 100).round()}%',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: p.accent)),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 7,
              backgroundColor: p.line,
              valueColor: AlwaysStoppedAnimation(p.accent),
            ),
          ),
        ],
      ),
    );
  }

  Widget _lessonCard(BuildContext context, QPalette p, int index) {
    final l = kLearnLessons[index];
    final done = LearnProgress.instance.isDone(l.slug);
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () =>
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => LearnLessonScreen(index: index))),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: done ? p.accent : p.accent.withValues(alpha: 0.10),
                ),
                child: done
                    ? const Icon(Icons.check, size: 20, color: Colors.white)
                    : Text('${l.number}',
                        style: TextStyle(fontWeight: FontWeight.w700, color: p.accent, fontSize: 15)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l.title, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 1),
                    Text(l.titleAr,
                        textDirection: TextDirection.rtl,
                        style: quranStyle(size: 15, height: 1.3, color: p.muted)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: p.muted),
            ],
          ),
        ),
      ),
    );
  }
}
