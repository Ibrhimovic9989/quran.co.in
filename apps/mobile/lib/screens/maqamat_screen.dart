// Maqāmāt — learn the melodic modes of recitation. Teaching-first: a short
// concept intro (the three registers), then guided lessons that draw each
// mode's melodic shape and walk you through it, and a compare view.

import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/maqam_lessons.dart';
import '../data/maqamat.dart';
import '../widgets/maqam_ribbon.dart';
import 'maqam_compare_screen.dart';
import 'maqam_lesson_screen.dart';

class MaqamatScreen extends StatelessWidget {
  const MaqamatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Maqāmāt')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          Text('THE MELODIES OF RECITATION',
              style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 8),
          Text(
            'Maqāmāt are the melodies of recitation. Every reciter moves the voice through three levels — and each maqām is a different path through them. Here you don’t just listen; you learn the shape.',
            style: readingStyle(context, size: 14, color: p.muted),
          ),
          const SizedBox(height: 16),
          _registerIntro(p),
          const SizedBox(height: 24),

          Text('LESSONS',
              style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 4),
          Text('Each teaches one maqām on Sūrah Al-Fātiḥah — watch the shape, hear a master recite it.',
              style: TextStyle(fontSize: 13, color: p.muted)),
          const SizedBox(height: 12),
          for (final lesson in kMaqamLessons) _lessonCard(context, p, lesson),

          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const MaqamCompareScreen())),
            icon: const Icon(Icons.compare_arrows),
            label: const Text('See the shapes side by side'),
            style: OutlinedButton.styleFrom(
              foregroundColor: p.accent,
              side: BorderSide(color: p.accent),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),

          const SizedBox(height: 28),
          Text('ALL EIGHT MODES',
              style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 4),
          Text('The full teaching canon. More guided lessons coming.',
              style: TextStyle(fontSize: 13, color: p.muted)),
          const SizedBox(height: 10),
          for (final m in kMaqamat) _modeRow(p, m),
        ],
      ),
    );
  }

  Widget _registerIntro(QPalette p) {
    Widget band(String label, String note, double t) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              SizedBox(
                width: 66,
                child: Text(label,
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: p.accent)),
              ),
              Expanded(child: Text(note, style: TextStyle(fontSize: 13, color: p.muted))),
            ],
          ),
        );
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.accent.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('The three registers', style: TextStyle(fontWeight: FontWeight.w700, color: p.ink)),
          const SizedBox(height: 10),
          band('High', 'The peak — reaching out, the emotional climax.', 1),
          band('Middle', 'Rising — the voice answers and builds.', 0.5),
          band('Low', 'Home — calm and grounded. Recitation starts and ends here.', 0),
          const SizedBox(height: 8),
          Text('A maqām climbs low → high, then resolves home. Its scale and path give it its feeling.',
              style: TextStyle(fontSize: 12, color: p.muted, height: 1.5)),
        ],
      ),
    );
  }

  Widget _lessonCard(BuildContext context, QPalette p, MaqamLesson l) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.of(context)
            .push(MaterialPageRoute(builder: (_) => MaqamLessonScreen(lesson: l))),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l.maqam, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        Text(l.mood, style: TextStyle(fontSize: 12, color: p.accent, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  Text(l.arabic,
                      textDirection: TextDirection.rtl, style: quranStyle(size: 24, height: 1.4, color: p.gold)),
                ],
              ),
              const SizedBox(height: 10),
              // Mini-shape preview.
              MaqamRibbon(phrases: l.phrases, height: 96),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(l.shape,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 13, color: p.muted, height: 1.4)),
                  ),
                  const SizedBox(width: 8),
                  Text('Start  →', style: TextStyle(color: p.accent, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _modeRow(QPalette p, Maqam m) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(m.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(m.mood, style: TextStyle(fontSize: 12, color: p.accent, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(m.character, style: TextStyle(fontSize: 12.5, color: p.muted, height: 1.4)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(m.arabic, textDirection: TextDirection.rtl, style: quranStyle(size: 18, height: 1.3, color: p.gold)),
        ],
      ),
    );
  }
}
