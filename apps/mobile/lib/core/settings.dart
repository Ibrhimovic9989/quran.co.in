// Persisted reader preferences: theme, transliteration visibility, reciter.
// Backed by shared_preferences; exposed as a ChangeNotifier so the whole app
// rebuilds when the reader changes a setting.

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'theme.dart';

class Settings extends ChangeNotifier {
  Settings._();
  static final Settings instance = Settings._();

  static const _kTheme = 'pref_theme';
  static const _kTranslit = 'pref_translit';
  static const _kReciter = 'pref_reciter';

  SharedPreferences? _prefs;

  ThemeChoice _theme = ThemeChoice.system;
  // Default ON: our readers come from transliteration and lean on it heavily.
  bool _showTransliteration = true;
  String _reciterId = '1';

  ThemeChoice get theme => _theme;
  bool get showTransliteration => _showTransliteration;
  String get reciterId => _reciterId;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    final t = _prefs!.getString(_kTheme);
    _theme = ThemeChoice.values.firstWhere(
      (c) => c.name == t,
      orElse: () => ThemeChoice.system,
    );
    _showTransliteration = _prefs!.getBool(_kTranslit) ?? true;
    _reciterId = _prefs!.getString(_kReciter) ?? '1';
    notifyListeners();
  }

  void setTheme(ThemeChoice choice) {
    _theme = choice;
    _prefs?.setString(_kTheme, choice.name);
    notifyListeners();
  }

  void setTransliteration(bool value) {
    _showTransliteration = value;
    _prefs?.setBool(_kTranslit, value);
    notifyListeners();
  }

  void setReciter(String id) {
    _reciterId = id;
    _prefs?.setString(_kReciter, id);
    notifyListeners();
  }
}
