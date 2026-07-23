// Mushaf page mode — the page-faithful Madinah layout (604 pages),
// reconstructed line-by-line from per-word page/line data.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/theme.dart';

class MushafScreen extends StatefulWidget {
  final int pageNo;
  const MushafScreen({super.key, required this.pageNo});

  @override
  State<MushafScreen> createState() => _MushafScreenState();
}

class _MushafScreenState extends State<MushafScreen> {
  late int _page = widget.pageNo;
  List<_Line>? _lines;
  String? _error;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await Api.instance.getJson('/api/quran/page/$_page') as Map<String, dynamic>;
      final words = (data['words'] as List? ?? []).cast<Map<String, dynamic>>();
      final byLine = <int, List<String>>{};
      for (final w in words) {
        final line = w['lineNumber'] as int? ?? 0;
        final text = w['textUthmani'] as String? ?? '';
        (byLine[line] ??= []).add(text);
      }
      final lines = byLine.keys.toList()..sort();
      if (mounted) {
        setState(() {
          _lines = [for (final l in lines) _Line(l, byLine[l]!.join(' '))];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Could not load page $_page.';
          _loading = false;
        });
      }
    }
  }

  void _go(int page) {
    if (page < 1 || page > 604) return;
    setState(() => _page = page);
    _load();
  }

  Future<void> _jump() async {
    final controller = TextEditingController(text: '$_page');
    final result = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Go to page'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          decoration: const InputDecoration(hintText: '1–604'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, int.tryParse(controller.text)),
            child: const Text('Go'),
          ),
        ],
      ),
    );
    if (result != null) _go(result);
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('Mushaf · Page $_page'),
        actions: [IconButton(onPressed: _jump, icon: const Icon(Icons.search))],
      ),
      body: _error != null
          ? Center(child: Text(_error!))
          : _lines == null || _loading
              ? const Center(child: CircularProgressIndicator())
              : GestureDetector(
                  onHorizontalDragEnd: (d) {
                    final v = d.primaryVelocity ?? 0;
                    // RTL: swipe left → next page, swipe right → previous.
                    if (v < -200) _go(_page + 1);
                    if (v > 200) _go(_page - 1);
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          for (final line in _lines!)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Text(
                                line.text,
                                textDirection: TextDirection.rtl,
                                textAlign: TextAlign.center,
                                style: quranStyle(size: 24, height: 2.0, color: p.ink),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
      bottomNavigationBar: BottomAppBar(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton.icon(
              onPressed: _page < 604 ? () => _go(_page + 1) : null,
              icon: const Icon(Icons.chevron_left),
              label: const Text('Next'),
            ),
            Text('$_page / 604', style: TextStyle(color: p.muted)),
            TextButton.icon(
              onPressed: _page > 1 ? () => _go(_page - 1) : null,
              icon: const Text('Prev'),
              label: const Icon(Icons.chevron_right),
            ),
          ],
        ),
      ),
    );
  }
}

class _Line {
  final int number;
  final String text;
  _Line(this.number, this.text);
}
