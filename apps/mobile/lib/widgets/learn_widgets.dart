// Building blocks for the Learn-to-read module: the letter grid, the
// tap-a-letter detail sheet (four forms + makhraj + a teacher's self-check),
// and the reading-row renderer used by every lesson.

import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/learn_lessons.dart';

/// A tappable grid of letters. Tapping one opens its detail sheet.
class LetterGrid extends StatelessWidget {
  final List<int> indices;
  const LetterGrid({super.key, required this.indices});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        for (final i in indices)
          InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => showLetterSheet(context, kLetters[i]),
            child: Container(
              width: 74,
              height: 84,
              decoration: BoxDecoration(
                color: p.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: p.line),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(kLetters[i].glyph,
                      textDirection: TextDirection.rtl,
                      style: quranStyle(size: 34, height: 1.1, color: p.ink)),
                  const SizedBox(height: 2),
                  Text(kLetters[i].name,
                      style: TextStyle(fontSize: 11, color: p.muted, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// The tap-a-letter "learn this letter" sheet.
Future<void> showLetterSheet(BuildContext context, QLetter l) {
  final p = QPalette.of(context);
  final forms = l.forms;

  Widget chip(String label, Color c) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: c.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(20)),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: c)),
      );

  Widget form(String label, String glyph, bool available) => Column(
        children: [
          Container(
            width: 62,
            height: 62,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: available ? p.accent.withValues(alpha: 0.06) : p.line.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: p.line),
            ),
            child: Text(glyph,
                textDirection: TextDirection.rtl, style: quranStyle(size: 30, height: 1.1, color: p.ink)),
          ),
          const SizedBox(height: 5),
          Text(label, style: TextStyle(fontSize: 10.5, color: p.muted, fontWeight: FontWeight.w500)),
        ],
      );

  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.72,
      maxChildSize: 0.95,
      minChildSize: 0.45,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(22, 4, 22, 32),
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(l.glyph, textDirection: TextDirection.rtl, style: quranStyle(size: 58, height: 1.0, color: p.ink)),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${l.name}  ·  “${l.sound}”',
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700)),
                    Text(l.nameAr,
                        textDirection: TextDirection.rtl,
                        style: quranStyle(size: 22, height: 1.3, color: p.muted)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 6, runSpacing: 6, children: [
                      chip(l.region, p.accent),
                      if (l.heavy) chip('Heavy', const Color(0xFFB4791E)),
                      if (l.qalqalah) chip('Qalqalah', const Color(0xFFDD0008)),
                      chip(l.sun ? 'Sun letter' : 'Moon letter', p.gold),
                    ]),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _sectionLabel(p, 'HOW TO SAY IT'),
          const SizedBox(height: 6),
          Text(l.makhraj, style: readingStyle(context, size: 15)),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.touch_app_outlined, size: 18, color: p.accent),
              const SizedBox(width: 8),
              Expanded(
                child: Text(l.tip,
                    style: TextStyle(fontSize: 13.5, color: p.muted, height: 1.5, fontStyle: FontStyle.italic)),
              ),
            ],
          ),
          const SizedBox(height: 22),
          _sectionLabel(p, 'ITS FOUR FORMS'),
          const SizedBox(height: 4),
          Text(
            l.connects
                ? 'How it looks at the start, middle and end of a word.'
                : '${l.name} never joins to its left — its start looks like its isolated form.',
            style: TextStyle(fontSize: 12.5, color: p.muted),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              form('Isolated', forms.isolated, true),
              form('Initial', forms.initial, l.connects),
              form('Medial', forms.medial, true),
              form('Final', forms.end, true),
            ],
          ),
          const SizedBox(height: 22),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: p.gold.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.graphic_eq, size: 18, color: p.gold),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    letterAudioUrl(l) != null
                        ? 'Tap to hear a qārī pronounce it.'
                        : 'Spoken pronunciation for each letter is coming soon — recorded by a qārī.',
                    style: TextStyle(fontSize: 12.5, color: p.muted, height: 1.4),
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

Widget _sectionLabel(QPalette p, String s) =>
    Text(s, style: TextStyle(fontSize: 11, letterSpacing: 1.8, fontWeight: FontWeight.w700, color: p.gold));

/// Renders a lesson's reading rows. Tapping a token reveals its spell-out and
/// (when available) plays word audio via [onPlay].
class ReadingRows extends StatelessWidget {
  final List<LearnRow> rows;
  final void Function(LearnToken token)? onPlay;
  const ReadingRows({super.key, required this.rows, this.onPlay});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final row in rows)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              runSpacing: 10,
              textDirection: TextDirection.rtl,
              children: [
                for (final t in row.tokens)
                  InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => _showToken(context, t),
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 72),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: p.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: p.line),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(t.ar,
                              textDirection: TextDirection.rtl,
                              textAlign: TextAlign.center,
                              style: quranStyle(size: 30, height: 1.6, color: p.ink)),
                          const SizedBox(height: 2),
                          Directionality(
                            textDirection: TextDirection.ltr,
                            child: Text(t.translit,
                                style: TextStyle(fontSize: 12.5, color: p.muted, fontStyle: FontStyle.italic)),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  void _showToken(BuildContext context, LearnToken t) {
    final p = QPalette.of(context);
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (context) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 4, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(t.ar,
                textDirection: TextDirection.rtl,
                textAlign: TextAlign.center,
                style: quranStyle(size: 46, height: 1.7, color: p.ink)),
            const SizedBox(height: 6),
            Text(t.translit, style: TextStyle(fontSize: 16, color: p.accent, fontWeight: FontWeight.w600)),
            if (t.spell != null) ...[
              const SizedBox(height: 12),
              Text('SPELL IT OUT',
                  style: TextStyle(fontSize: 10.5, letterSpacing: 1.6, fontWeight: FontWeight.w700, color: p.gold)),
              const SizedBox(height: 4),
              Text(t.spell!,
                  textDirection: TextDirection.rtl, style: TextStyle(fontSize: 15, color: p.muted, height: 1.5)),
            ],
            if (t.audioRef != null && onPlay != null) ...[
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: () => onPlay!(t),
                icon: const Icon(Icons.volume_up, size: 18),
                label: const Text('Hear it recited'),
                style: FilledButton.styleFrom(backgroundColor: p.accent),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
