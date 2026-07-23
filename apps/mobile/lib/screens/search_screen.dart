// Semantic search — meaning-based verse search, plus curated topic tiles.

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';
import '../widgets/verse_actions.dart';
import 'surah_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _input = TextEditingController();
  List<SearchResult>? _results;
  bool _loading = false;
  String? _error;
  String _query = '';

  static const _topics = [
    'Patience', 'Gratitude', 'Mercy', 'Forgiveness', 'Charity',
    'Prayer', 'Paradise', 'Repentance', 'Trust in Allah', 'Parents',
    'Knowledge', 'Justice',
  ];

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    q = q.trim();
    if (q.isEmpty) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
      _query = q;
    });
    try {
      final data = await Api.instance
          .getJson('/api/search/semantic?q=${Uri.encodeQueryComponent(q)}&limit=20')
          as Map<String, dynamic>;
      final list = (data['results'] as List? ?? [])
          .map((e) => SearchResult.fromJson(e as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _results = list);
    } catch (_) {
      if (mounted) setState(() => _error = 'Search failed — please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _open(int surah, int ayah) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => SurahScreen(surahNo: surah, initialAyah: ayah)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 6),
            child: TextField(
              controller: _input,
              onSubmitted: _search,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Search by meaning — e.g. "overcoming hardship"',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                isDense: true,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text(_error!))
                    : _results == null
                        ? _topicGrid(p)
                        : _resultList(p),
          ),
        ],
      ),
    );
  }

  Widget _topicGrid(QPalette p) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('EXPLORE BY TOPIC',
            style: TextStyle(fontSize: 11, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            for (final t in _topics)
              ActionChip(
                label: Text(t),
                onPressed: () {
                  _input.text = t;
                  _search(t);
                },
              ),
          ],
        ),
      ],
    );
  }

  Widget _resultList(QPalette p) {
    if (_results!.isEmpty) {
      return Center(child: Text('No verses found for "$_query".', style: TextStyle(color: p.muted)));
    }
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Text('${_results!.length} verses for "$_query"',
            style: TextStyle(fontSize: 12, color: p.muted)),
        const SizedBox(height: 8),
        for (final r in _results!)
          VerseResultCard(result: r, onOpen: () => _open(r.surahNumber, r.ayahNumber)),
      ],
    );
  }
}
