// The pitch-ribbon: draws a maqām's melodic shape as a smooth glowing contour
// over three register bands (low / mid / high). Phrase dots are sized by
// loudness; the active phrase glows and a playhead marks it.

import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../data/maqam_lessons.dart';

class MaqamRibbon extends StatelessWidget {
  final List<LessonPhrase> phrases;
  final int activeIndex; // -1 = none
  final double height;
  final List<double>? userContour; // learner's pitch as 0..1 levels over progress
  const MaqamRibbon({
    super.key,
    required this.phrases,
    this.activeIndex = -1,
    this.height = 180,
    this.userContour,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: CustomPaint(
        size: Size(double.infinity, height),
        painter: _RibbonPainter(phrases, activeIndex, userContour),
      ),
    );
  }
}

class _RibbonPainter extends CustomPainter {
  final List<LessonPhrase> phrases;
  final int active;
  final List<double>? userContour;
  _RibbonPainter(this.phrases, this.active, this.userContour);

  static const _bg = Color(0xFF0C1F1A);
  static const _gold = QColors.nightGold;
  static const _dim = Color(0x33FFFFFF);

  @override
  void paint(Canvas canvas, Size size) {
    final r = RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(18));
    canvas.drawRRect(r, Paint()..color = _bg);

    const padL = 44.0, padR = 20.0, padT = 18.0, padB = 20.0;
    final chartW = size.width - padL - padR;
    final chartH = size.height - padT - padB;

    // Three register bands + labels.
    final bandLabels = ['high', 'mid', 'low'];
    final labelStyle = const TextStyle(color: Color(0x66FFFFFF), fontSize: 10);
    for (var b = 0; b < 3; b++) {
      final y = padT + chartH * (b / 3);
      canvas.drawLine(Offset(padL, y + chartH / 6), Offset(size.width - padR, y + chartH / 6),
          Paint()..color = _dim..strokeWidth = 0.5);
      final tp = TextPainter(
        text: TextSpan(text: bandLabels[b], style: labelStyle),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(8, y + chartH / 6 - tp.height / 2));
    }

    if (phrases.isEmpty) return;

    // Phrase points: x evenly spaced, y from pitch (1 = top).
    Offset pt(int i) {
      final x = padL + (phrases.length == 1 ? chartW / 2 : chartW * i / (phrases.length - 1));
      final y = padT + chartH * (1 - phrases[i].pitch);
      return Offset(x, y);
    }

    final points = [for (var i = 0; i < phrases.length; i++) pt(i)];

    // Smooth Catmull-Rom path through the points.
    final path = Path()..moveTo(points.first.dx, points.first.dy);
    for (var i = 0; i < points.length - 1; i++) {
      final p0 = points[i == 0 ? 0 : i - 1];
      final p1 = points[i];
      final p2 = points[i + 1];
      final p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];
      final c1 = Offset(p1.dx + (p2.dx - p0.dx) / 6, p1.dy + (p2.dy - p0.dy) / 6);
      final c2 = Offset(p2.dx - (p3.dx - p1.dx) / 6, p2.dy - (p3.dy - p1.dy) / 6);
      path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, p2.dx, p2.dy);
    }

    // Glow + line.
    canvas.drawPath(
        path,
        Paint()
          ..color = _gold.withValues(alpha: 0.25)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 10
          ..strokeCap = StrokeCap.round
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6));
    canvas.drawPath(
        path,
        Paint()
          ..shader = const LinearGradient(colors: [Color(0xFFE3C97E), _gold])
              .createShader(Offset.zero & size)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.5
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round);

    // Playhead at the active phrase.
    if (active >= 0 && active < points.length) {
      final x = points[active].dx;
      canvas.drawLine(Offset(x, padT - 6), Offset(x, size.height - padB + 6),
          Paint()..color = _gold.withValues(alpha: 0.5)..strokeWidth = 1.5);
    }

    // Learner's live pitch line (green).
    final uc = userContour;
    if (uc != null && uc.length > 1) {
      final up = Path();
      for (var i = 0; i < uc.length; i++) {
        final x = padL + chartW * i / (uc.length - 1);
        final y = padT + chartH * (1 - uc[i].clamp(0.0, 1.0));
        if (i == 0) {
          up.moveTo(x, y);
        } else {
          up.lineTo(x, y);
        }
      }
      canvas.drawPath(
          up,
          Paint()
            ..color = const Color(0xFF34B18A)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.5
            ..strokeCap = StrokeCap.round
            ..strokeJoin = StrokeJoin.round);
    }

    // Phrase dots: radius from loudness; active glows.
    for (var i = 0; i < points.length; i++) {
      final isActive = i == active;
      final radius = 3.0 + phrases[i].dynamic * 4.0;
      if (isActive) {
        canvas.drawCircle(points[i], radius + 7,
            Paint()..color = _gold.withValues(alpha: 0.35)..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5));
      }
      canvas.drawCircle(points[i], radius,
          Paint()..color = isActive ? const Color(0xFFF3EDD9) : _gold.withValues(alpha: 0.85));
    }
  }

  @override
  bool shouldRepaint(covariant _RibbonPainter old) =>
      old.active != active || old.phrases != phrases || old.userContour != userContour;
}
