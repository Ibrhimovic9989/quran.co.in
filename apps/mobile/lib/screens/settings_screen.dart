// Reader preferences — theme and transliteration.

import 'package:flutter/material.dart';

import '../core/settings.dart';
import '../core/theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: AnimatedBuilder(
        animation: Settings.instance,
        builder: (context, _) {
          final s = Settings.instance;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('THEME',
                  style: TextStyle(
                      fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
              const SizedBox(height: 8),
              _themeTile(context, s, ThemeChoice.system, 'System', 'Follow device light/dark'),
              _themeTile(context, s, ThemeChoice.light, 'Paper', 'Light — warm off-white'),
              _themeTile(context, s, ThemeChoice.sepia, 'Sepia', 'Warm reading tone'),
              _themeTile(context, s, ThemeChoice.night, 'Night', 'True dark'),
              const Divider(height: 32),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Show transliteration'),
                subtitle: const Text('Latin pronunciation under each ayah'),
                value: s.showTransliteration,
                onChanged: s.setTransliteration,
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _themeTile(
      BuildContext context, Settings s, ThemeChoice choice, String title, String subtitle) {
    return RadioListTile<ThemeChoice>(
      contentPadding: EdgeInsets.zero,
      value: choice,
      groupValue: s.theme,
      title: Text(title),
      subtitle: Text(subtitle),
      onChanged: (v) {
        if (v != null) s.setTheme(v);
      },
    );
  }
}
