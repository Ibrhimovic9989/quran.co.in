// Saved verses — synced when signed in, on-device otherwise.

import 'package:flutter/material.dart';

import '../core/auth.dart';
import '../core/library.dart';
import '../core/theme.dart';
import '../models.dart';
import 'surah_screen.dart';

class BookmarksScreen extends StatelessWidget {
  const BookmarksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Saved')),
      body: ValueListenableBuilder<List<Bookmark>>(
        valueListenable: Library.instance.bookmarks,
        builder: (context, items, _) {
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bookmark_border, size: 44, color: p.muted),
                    const SizedBox(height: 12),
                    Text('No saved verses yet.',
                        style: TextStyle(color: p.muted), textAlign: TextAlign.center),
                    const SizedBox(height: 6),
                    Text('Tap the bookmark icon on any ayah to save it here.',
                        style: TextStyle(color: p.muted, fontSize: 13), textAlign: TextAlign.center),
                    if (AuthService.instance.user.value == null) ...[
                      const SizedBox(height: 12),
                      Text('Sign in to sync across devices.',
                          style: TextStyle(color: p.muted, fontSize: 12), textAlign: TextAlign.center),
                    ],
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: items.length,
            itemBuilder: (context, i) {
              final b = items[i];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 5),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: p.surface,
                    child: Text('${b.surahNumber}',
                        style: TextStyle(color: p.gold, fontWeight: FontWeight.w700, fontSize: 13)),
                  ),
                  title: Text(b.surahName ?? 'Sūrah ${b.surahNumber}',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(b.ayahNumber != null
                      ? 'Ayah ${b.surahNumber}:${b.ayahNumber}'
                      : 'Whole sūrah'),
                  trailing: IconButton(
                    icon: Icon(Icons.close, color: p.muted, size: 20),
                    onPressed: () => Library.instance.toggleBookmark(b),
                  ),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => SurahScreen(surahNo: b.surahNumber, initialAyah: b.ayahNumber),
                  )),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
