// Learn-to-read progress: which lessons the user has marked complete. Local
// only (shared_preferences) — no account needed. Deliberately gentle: we track
// "lessons completed", never a punishing daily streak.

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LearnProgress extends ChangeNotifier {
  LearnProgress._();
  static final LearnProgress instance = LearnProgress._();

  static const _key = 'pref_learn_done';
  SharedPreferences? _prefs;
  final Set<String> _done = {};

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _done
      ..clear()
      ..addAll(_prefs!.getStringList(_key) ?? const []);
    notifyListeners();
  }

  bool isDone(String slug) => _done.contains(slug);
  int get completedCount => _done.length;

  void toggle(String slug) {
    if (!_done.remove(slug)) _done.add(slug);
    _prefs?.setStringList(_key, _done.toList());
    notifyListeners();
  }

  void markDone(String slug) {
    if (_done.add(slug)) {
      _prefs?.setStringList(_key, _done.toList());
      notifyListeners();
    }
  }
}
