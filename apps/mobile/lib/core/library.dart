// The user's library: bookmarks + last-read position.
// Signed-in users sync through the API (source of truth); signed-out users
// keep everything on-device. On sign-in, local bookmarks are merged up.

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models.dart';
import 'api.dart';

class Library {
  Library._();
  static final Library instance = Library._();

  static const _kBookmarks = 'local_bookmarks';
  static const _kLastRead = 'local_last_read';

  final ValueNotifier<List<Bookmark>> bookmarks = ValueNotifier([]);
  final ValueNotifier<ReadPosition?> lastRead = ValueNotifier(null);

  SharedPreferences? _prefs;
  bool get _signedIn => Api.instance.hasToken;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _loadLocal();
    if (_signedIn) await _syncFromServer();
  }

  /// Called when auth state flips. On sign-in we push local-only bookmarks up
  /// then pull the merged set; on sign-out we fall back to whatever is local.
  Future<void> onAuthChanged() async {
    if (_signedIn) {
      await _pushLocalBookmarks();
      await _syncFromServer();
    } else {
      _loadLocal();
    }
  }

  // ---- bookmarks ----

  bool isBookmarked(int surah, int? ayah) =>
      bookmarks.value.any((b) => b.surahNumber == surah && b.ayahNumber == ayah);

  Future<void> toggleBookmark(Bookmark b) async {
    final exists = bookmarks.value
        .any((x) => x.surahNumber == b.surahNumber && x.ayahNumber == b.ayahNumber);
    final next = List<Bookmark>.from(bookmarks.value);
    if (exists) {
      next.removeWhere(
          (x) => x.surahNumber == b.surahNumber && x.ayahNumber == b.ayahNumber);
    } else {
      next.insert(0, b);
    }
    bookmarks.value = next;
    _saveLocalBookmarks();

    if (_signedIn) {
      try {
        if (exists) {
          final path = b.ayahNumber != null
              ? '/api/bookmarks/${b.surahNumber}/${b.ayahNumber}'
              : '/api/bookmarks/${b.surahNumber}';
          await Api.instance.deleteJson(path);
        } else {
          await Api.instance.postJson('/api/bookmarks', b.toJson());
        }
      } catch (_) {
        // best-effort; local copy already reflects the change
      }
    }
  }

  Future<void> _pushLocalBookmarks() async {
    for (final b in bookmarks.value) {
      try {
        await Api.instance.postJson('/api/bookmarks', b.toJson());
      } catch (_) {}
    }
  }

  Future<void> _syncFromServer() async {
    try {
      final data = await Api.instance.getJson('/api/bookmarks');
      final list = data is List ? data : (data['bookmarks'] as List? ?? []);
      final server = list
          .map((e) => Bookmark.fromJson(e as Map<String, dynamic>))
          .toList();
      bookmarks.value = server;
      _saveLocalBookmarks();
    } catch (_) {
      // keep local view on failure
    }
  }

  // ---- reading position ----

  Future<void> recordRead(ReadPosition pos) async {
    lastRead.value = pos;
    _prefs?.setString(_kLastRead, jsonEncode(pos.toJson()));
    if (_signedIn) {
      try {
        await Api.instance.postJson('/api/reading-history', {
          'surahNumber': pos.surahNumber,
          'ayahNumber': pos.ayahNumber,
        });
      } catch (_) {}
    }
  }

  Future<void> refreshLastRead() async {
    if (_signedIn) {
      try {
        final data = await Api.instance.getJson('/api/reading-history');
        final j = data is Map<String, dynamic>
            ? (data['history'] ?? data['readingHistory'] ?? data)
            : data;
        if (j is Map<String, dynamic> && j['surahNumber'] != null) {
          // preserve any local surah name if server omits it
          final local = lastRead.value;
          final pos = ReadPosition.fromJson(j);
          lastRead.value = pos.surahName == null && local != null
              ? ReadPosition(
                  surahNumber: pos.surahNumber,
                  ayahNumber: pos.ayahNumber,
                  surahName: local.surahName)
              : pos;
          return;
        }
      } catch (_) {}
    }
  }

  // ---- local persistence ----

  void _loadLocal() {
    final raw = _prefs?.getString(_kBookmarks);
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List;
        bookmarks.value =
            list.map((e) => Bookmark.fromJson(e as Map<String, dynamic>)).toList();
      } catch (_) {}
    }
    final lr = _prefs?.getString(_kLastRead);
    if (lr != null) {
      try {
        lastRead.value = ReadPosition.fromJson(jsonDecode(lr) as Map<String, dynamic>);
      } catch (_) {}
    }
  }

  void _saveLocalBookmarks() {
    _prefs?.setString(
      _kBookmarks,
      jsonEncode(bookmarks.value.map((b) => b.toJson()).toList()),
    );
  }
}
