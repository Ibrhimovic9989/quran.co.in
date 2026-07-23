// Design language shared with the web app:
// "the mushaf text carries the tradition; the chrome stays quiet."
// Paper / ink / emerald / gold — plus a genuinely-dark night theme.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class QColors {
  // Paper (light)
  static const paper = Color(0xFFFAF7F0);
  static const surface = Color(0xFFFFFFFF);
  static const ink = Color(0xFF1C2B27);
  static const inkSoft = Color(0xFF3D4F49);
  static const muted = Color(0xFF6B7A74);
  static const line = Color(0xFFE7E0D2);
  static const accent = Color(0xFF0F6B4F);
  static const accentSoft = Color(0xFFE8F2EE);
  static const gold = Color(0xFFC8A24B);
  static const goldSoft = Color(0xFFECDFC0);
  static const goldText = Color(0xFF7A5F27);

  // Night
  static const nightBg = Color(0xFF0B1210);
  static const nightSurface = Color(0xFF121B17);
  static const nightInk = Color(0xFFE8E4D9);
  static const nightMuted = Color(0xFF8F8C7E);
  static const nightLine = Color(0xFF223029);
  static const nightAccent = Color(0xFF34B18A);
  static const nightGold = Color(0xFFD9B45C);

  // Sepia (warm reading tone)
  static const sepiaBg = Color(0xFFF2E7CE);
  static const sepiaSurface = Color(0xFFFBF3DE);
  static const sepiaInk = Color(0xFF43361F);
  static const sepiaMuted = Color(0xFF8A785A);
  static const sepiaLine = Color(0xFFE2D3B2);
  static const sepiaAccent = Color(0xFF0F6B4F);
  static const sepiaGold = Color(0xFF9A7A34);
}

/// Which colour scheme the reader has chosen. `system` follows the OS
/// light/dark setting; the others force a specific look.
enum ThemeChoice { system, light, sepia, night }

const String kQuranFont = 'UthmanicHafs';

ThemeData buildLightTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: QColors.paper,
    colorScheme: ColorScheme.fromSeed(
      seedColor: QColors.accent,
      brightness: Brightness.light,
      surface: QColors.surface,
      primary: QColors.accent,
    ),
  );
  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: QColors.ink,
      displayColor: QColors.ink,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: QColors.paper,
      foregroundColor: QColors.ink,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: const CardThemeData(
      color: QColors.surface,
      elevation: 1,
      shadowColor: Color(0x14000000),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: QColors.line),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: QColors.paper,
      indicatorColor: QColors.accentSoft,
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected) ? QColors.accent : QColors.muted,
        ),
      ),
    ),
  );
}

ThemeData buildNightTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: QColors.nightBg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: QColors.nightAccent,
      brightness: Brightness.dark,
      surface: QColors.nightSurface,
      primary: QColors.nightAccent,
    ),
  );
  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: QColors.nightInk,
      displayColor: QColors.nightInk,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: QColors.nightBg,
      foregroundColor: QColors.nightInk,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: const CardThemeData(
      color: QColors.nightSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: QColors.nightLine),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: QColors.nightBg,
      indicatorColor: const Color(0xFF12352A),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected)
              ? QColors.nightAccent
              : QColors.nightMuted,
        ),
      ),
    ),
  );
}

ThemeData buildSepiaTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: QColors.sepiaBg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: QColors.sepiaAccent,
      brightness: Brightness.light,
      surface: QColors.sepiaSurface,
      primary: QColors.sepiaAccent,
    ),
  );
  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: QColors.sepiaInk,
      displayColor: QColors.sepiaInk,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: QColors.sepiaBg,
      foregroundColor: QColors.sepiaInk,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: const CardThemeData(
      color: QColors.sepiaSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
        side: BorderSide(color: QColors.sepiaLine),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: QColors.sepiaBg,
      indicatorColor: const Color(0xFFE7D9B8),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected)
              ? QColors.sepiaAccent
              : QColors.sepiaMuted,
        ),
      ),
    ),
  );
}

/// Palette accessor so widgets can pick the right accent/gold/muted for the
/// active theme without hard-coding light vs night vs sepia everywhere.
class QPalette {
  final Color accent, gold, muted, line, surface, ink;
  const QPalette(this.accent, this.gold, this.muted, this.line, this.surface, this.ink);

  static QPalette of(BuildContext context) {
    final b = Theme.of(context);
    if (b.brightness == Brightness.dark) {
      return const QPalette(QColors.nightAccent, QColors.nightGold, QColors.nightMuted,
          QColors.nightLine, QColors.nightSurface, QColors.nightInk);
    }
    // Distinguish sepia from paper by the scaffold colour.
    if (b.scaffoldBackgroundColor == QColors.sepiaBg) {
      return const QPalette(QColors.sepiaAccent, QColors.sepiaGold, QColors.sepiaMuted,
          QColors.sepiaLine, QColors.sepiaSurface, QColors.sepiaInk);
    }
    return const QPalette(QColors.accent, QColors.goldText, QColors.muted, QColors.line,
        QColors.surface, QColors.ink);
  }
}

/// Serif style for translations (Lora — matches the web reading font).
TextStyle readingStyle(BuildContext context, {double size = 16, Color? color}) {
  return GoogleFonts.lora(
    fontSize: size,
    height: 1.7,
    color: color ?? Theme.of(context).textTheme.bodyMedium?.color,
  );
}

/// The Quran script style — authentic KFGQPC Hafs, never letter-spaced.
TextStyle quranStyle({double size = 28, Color? color, double height = 2.0}) {
  return TextStyle(
    fontFamily: kQuranFont,
    fontSize: size,
    height: height,
    color: color,
  );
}
