// Renders an ayah as colored tajwīd spans. Each colored letter is tappable and
// opens a "learn the rule" sheet. Also provides the tajwīd legend sheet.

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/tajweed_rules.dart';

/// One run of ayah text: [text] carries [rule] (a tajwīd class) or null (plain).
class TajweedRun {
  final String text;
  final String? rule;
  const TajweedRun(this.text, this.rule);

  factory TajweedRun.fromJson(Map<String, dynamic> j) =>
      TajweedRun(j['t'] as String? ?? '', j['r'] as String?);
}

/// An ayah rendered with tajwīd colors. Owns its tap recognizers.
class TajweedAyah extends StatefulWidget {
  final List<TajweedRun> runs;
  final double size;
  final double height;
  const TajweedAyah({super.key, required this.runs, this.size = 26, this.height = 2.0});

  @override
  State<TajweedAyah> createState() => _TajweedAyahState();
}

class _TajweedAyahState extends State<TajweedAyah> {
  final List<TapGestureRecognizer> _recognizers = [];

  @override
  void dispose() {
    for (final r in _recognizers) {
      r.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseColor = QPalette.of(context).ink;
    final spans = <InlineSpan>[];
    for (final run in widget.runs) {
      final rule = run.rule == null ? null : kTajweedRules[run.rule];
      if (rule == null) {
        spans.add(TextSpan(text: run.text, style: quranStyle(size: widget.size, height: widget.height, color: baseColor)));
      } else {
        final rec = TapGestureRecognizer()
          ..onTap = () => showTajweedRuleSheet(context, run.rule!);
        _recognizers.add(rec);
        spans.add(TextSpan(
          text: run.text,
          style: quranStyle(size: widget.size, height: widget.height, color: rule.color),
          recognizer: rec,
        ));
      }
    }
    return Text.rich(
      TextSpan(children: spans),
      textDirection: TextDirection.rtl,
      textAlign: TextAlign.right,
    );
  }
}

/// Bottom sheet explaining a single tajwīd rule.
Future<void> showTajweedRuleSheet(BuildContext context, String ruleClass) {
  final rule = kTajweedRules[ruleClass];
  if (rule == null) return Future.value();
  final p = QPalette.of(context);
  return showModalBottomSheet(
    context: context,
    showDragHandle: true,
    builder: (context) => Padding(
      padding: const EdgeInsets.fromLTRB(24, 4, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(color: rule.color, borderRadius: BorderRadius.circular(9)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(rule.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    Text(rule.arabic,
                        textDirection: TextDirection.rtl,
                        style: quranStyle(size: 20, height: 1.4, color: p.muted)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(rule.how, style: readingStyle(context, size: 15)),
        ],
      ),
    ),
  );
}

/// Bottom sheet listing all tajwīd rules with their colors.
Future<void> showTajweedLegendSheet(BuildContext context) {
  final p = QPalette.of(context);
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.95,
      minChildSize: 0.4,
      builder: (context, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(20, 4, 20, 32),
        children: [
          Text('TAJWĪD RULES',
              style: TextStyle(fontSize: 12, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
          const SizedBox(height: 4),
          Text('Tap any colored letter while reading to learn its rule.',
              style: TextStyle(fontSize: 13, color: p.muted)),
          const SizedBox(height: 16),
          for (final key in kTajweedLegendOrder)
            if (kTajweedRules[key] != null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      margin: const EdgeInsets.only(top: 2),
                      decoration: BoxDecoration(
                          color: kTajweedRules[key]!.color, borderRadius: BorderRadius.circular(6)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(kTajweedRules[key]!.name,
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                              const SizedBox(width: 8),
                              Text(kTajweedRules[key]!.arabic,
                                  textDirection: TextDirection.rtl,
                                  style: quranStyle(size: 15, height: 1.3, color: p.muted)),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(kTajweedRules[key]!.how,
                              style: TextStyle(fontSize: 13, color: p.muted, height: 1.4)),
                        ],
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
