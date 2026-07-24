// Compare the maqām shapes — see Bayati's gentle hill next to Hijaz's cliff,
// Saba's downward pull, Ajam's bright climb. Tap one to open its lesson.

import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/maqam_lessons.dart';
import '../widgets/maqam_ribbon.dart';
import 'maqam_lesson_screen.dart';

class MaqamCompareScreen extends StatelessWidget {
  const MaqamCompareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Compare the shapes')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 28),
        children: [
          Text('The same sūrah — four different journeys. Notice where each one climbs, '
              'lingers and resolves. Tap any shape to learn it.',
              style: readingStyle(context, size: 14, color: p.muted)),
          const SizedBox(height: 18),
          for (final l in kMaqamLessons)
            Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => Navigator.of(context)
                    .push(MaterialPageRoute(builder: (_) => MaqamLessonScreen(lesson: l))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(l.maqam, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        const SizedBox(width: 8),
                        Text(l.arabic,
                            textDirection: TextDirection.rtl,
                            style: quranStyle(size: 18, height: 1.3, color: p.gold)),
                        const Spacer(),
                        Text(l.mood.split(' · ').first,
                            style: TextStyle(fontSize: 12, color: p.accent, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    MaqamRibbon(phrases: l.phrases, height: 120),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
