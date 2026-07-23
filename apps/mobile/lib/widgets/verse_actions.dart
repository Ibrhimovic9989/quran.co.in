// Shared bottom sheets for a single ayah: tafsir commentary and similar
// verses. Used by the surah reader and search results alike.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';

Future<void> showTafsirSheet(BuildContext context, int surah, int ayah) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      minChildSize: 0.4,
      builder: (context, controller) =>
          _TafsirBody(surah: surah, ayah: ayah, controller: controller),
    ),
  );
}

class _TafsirBody extends StatefulWidget {
  final int surah;
  final int ayah;
  final ScrollController controller;
  const _TafsirBody({required this.surah, required this.ayah, required this.controller});

  @override
  State<_TafsirBody> createState() => _TafsirBodyState();
}

class _TafsirBodyState extends State<_TafsirBody> {
  List<TafsirEntry>? _entries;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await Api.instance
          .getJson('/api/quran/tafsir/${widget.surah}/${widget.ayah}') as Map<String, dynamic>;
      final t = data['tafsir'] as Map<String, dynamic>?;
      final list = (t?['tafsirs'] as List? ?? [])
          .map((e) => TafsirEntry.fromJson(e as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _entries = list);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load tafsir.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return ListView(
      controller: widget.controller,
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 32),
      children: [
        Text('Tafsir · ${widget.surah}:${widget.ayah}',
            style: TextStyle(fontSize: 12, letterSpacing: 1.5, fontWeight: FontWeight.w700, color: p.gold)),
        const SizedBox(height: 12),
        if (_error != null)
          Padding(padding: const EdgeInsets.only(top: 40), child: Center(child: Text(_error!)))
        else if (_entries == null)
          const Padding(padding: EdgeInsets.only(top: 60), child: Center(child: CircularProgressIndicator()))
        else if (_entries!.isEmpty)
          const Padding(padding: EdgeInsets.only(top: 40), child: Center(child: Text('No tafsir available.')))
        else
          for (final e in _entries!) ...[
            Text(e.author, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: p.accent)),
            const SizedBox(height: 8),
            MarkdownText(e.content, context),
            const SizedBox(height: 24),
          ],
      ],
    );
  }
}

Future<void> showSimilarSheet(BuildContext context, int surah, int ayah,
    void Function(int surah, int ayah) onOpen) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.95,
      minChildSize: 0.4,
      builder: (context, controller) =>
          _SimilarBody(surah: surah, ayah: ayah, controller: controller, onOpen: onOpen),
    ),
  );
}

class _SimilarBody extends StatefulWidget {
  final int surah;
  final int ayah;
  final ScrollController controller;
  final void Function(int surah, int ayah) onOpen;
  const _SimilarBody(
      {required this.surah, required this.ayah, required this.controller, required this.onOpen});

  @override
  State<_SimilarBody> createState() => _SimilarBodyState();
}

class _SimilarBodyState extends State<_SimilarBody> {
  List<SearchResult>? _results;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await Api.instance.getJson(
          '/api/search/similar?surah=${widget.surah}&ayah=${widget.ayah}&limit=15') as Map<String, dynamic>;
      final list = (data['results'] as List? ?? [])
          .map((e) => SearchResult.fromJson(e as Map<String, dynamic>))
          .where((r) => !(r.surahNumber == widget.surah && r.ayahNumber == widget.ayah))
          .toList();
      if (mounted) setState(() => _results = list);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not load similar verses.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return ListView(
      controller: widget.controller,
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text('Similar to ${widget.surah}:${widget.ayah}',
              style: TextStyle(fontSize: 12, letterSpacing: 1.5, fontWeight: FontWeight.w700, color: p.gold)),
        ),
        const SizedBox(height: 12),
        if (_error != null)
          Padding(padding: const EdgeInsets.only(top: 40), child: Center(child: Text(_error!)))
        else if (_results == null)
          const Padding(padding: EdgeInsets.only(top: 60), child: Center(child: CircularProgressIndicator()))
        else if (_results!.isEmpty)
          const Padding(padding: EdgeInsets.only(top: 40), child: Center(child: Text('No similar verses found.')))
        else
          for (final r in _results!)
            VerseResultCard(
              result: r,
              onOpen: () {
                Navigator.of(context).pop();
                widget.onOpen(r.surahNumber, r.ayahNumber);
              },
            ),
      ],
    );
  }
}

/// A verse card used by search results and the similar-verses sheet.
class VerseResultCard extends StatelessWidget {
  final SearchResult result;
  final VoidCallback onOpen;
  const VerseResultCard({super.key, required this.result, required this.onOpen});

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onOpen,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${result.englishName} · ${result.surahNumber}:${result.ayahNumber}',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: p.gold)),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: Text(result.arabicText,
                    textDirection: TextDirection.rtl,
                    textAlign: TextAlign.right,
                    style: quranStyle(size: 22, height: 1.9)),
              ),
              if (result.translationText != null) ...[
                const SizedBox(height: 8),
                Text(result.translationText!, style: readingStyle(context, size: 14)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

void copyAyah(BuildContext context, String arabic, String? translation, String ref) {
  final text = [arabic, if (translation != null) translation, '— $ref'].join('\n');
  Clipboard.setData(ClipboardData(text: text));
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('Copied'), duration: Duration(seconds: 1)),
  );
}

/// A deliberately small markdown renderer — enough for tafsir content
/// (headings, bold, paragraphs). Avoids pulling in a heavy dependency.
class MarkdownText extends StatelessWidget {
  final String source;
  final BuildContext ctx;
  const MarkdownText(this.source, this.ctx, {super.key});

  @override
  Widget build(BuildContext context) {
    final lines = source.replaceAll('\\-', '-').replaceAll('\r', '').split('\n');
    final widgets = <Widget>[];
    for (var raw in lines) {
      final line = raw.trim();
      if (line.isEmpty) {
        widgets.add(const SizedBox(height: 8));
        continue;
      }
      double size = 15;
      FontWeight weight = FontWeight.w400;
      String text = line;
      if (line.startsWith('### ')) {
        text = line.substring(4);
        size = 15;
        weight = FontWeight.w700;
      } else if (line.startsWith('## ')) {
        text = line.substring(3);
        size = 16;
        weight = FontWeight.w700;
      } else if (line.startsWith('# ')) {
        text = line.substring(2);
        size = 18;
        weight = FontWeight.w700;
      }
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: _inline(context, text, size, weight),
      ));
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: widgets);
  }

  Widget _inline(BuildContext context, String text, double size, FontWeight weight) {
    // Split on ** for bold; keep the rest as-is.
    final spans = <TextSpan>[];
    final parts = text.split('**');
    for (var i = 0; i < parts.length; i++) {
      spans.add(TextSpan(
        text: parts[i],
        style: TextStyle(fontWeight: i.isOdd ? FontWeight.w700 : weight),
      ));
    }
    final base = readingStyle(context, size: size).copyWith(fontWeight: weight);
    return RichText(text: TextSpan(style: base, children: spans));
  }
}
