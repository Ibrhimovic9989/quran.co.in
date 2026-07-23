// Ask the Quran — native chat over the API's SSE stream.

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/api.dart';
import '../core/theme.dart';
import '../models.dart';
import 'surah_screen.dart';

class _Message {
  final String role; // user | assistant
  String content;
  List<AskSource> sources = const [];
  _Message(this.role, this.content);
}

class AskScreen extends StatefulWidget {
  const AskScreen({super.key});

  @override
  State<AskScreen> createState() => _AskScreenState();
}

class _AskScreenState extends State<AskScreen> {
  final List<_Message> _messages = [];
  final _input = TextEditingController();
  final _scroll = ScrollController();
  bool _loading = false;
  String _mode = 'focused'; // focused = grounded only; open = broader answer

  static const _suggestions = [
    'What does the Quran say about patience?',
    'Ayahs about gratitude',
    'What is Ayat Al-Kursi about?',
    'Duas for parents in the Quran',
  ];

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _ask(String question) async {
    final q = question.trim();
    if (q.isEmpty || _loading) return;
    _input.clear();

    final history = _messages
        .map((m) => {'role': m.role, 'content': m.content})
        .toList(growable: false);

    setState(() {
      _messages.add(_Message('user', q));
      _messages.add(_Message('assistant', ''));
      _loading = true;
    });

    try {
      await for (final event in Api.instance.askStream(question: q, mode: _mode, history: history)) {
        if (!mounted) return;
        setState(() {
          final last = _messages.last;
          switch (event['type']) {
            case 'sources':
              last.sources = (event['ayahs'] as List? ?? [])
                  .map((s) => AskSource.fromJson(s as Map<String, dynamic>))
                  .toList();
            case 'token':
              last.content += event['text'] as String? ?? '';
          }
        });
        if (_scroll.hasClients) {
          _scroll.jumpTo(_scroll.position.maxScrollExtent);
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _messages.last.content =
              _messages.last.content.isEmpty ? 'Something went wrong — please try again.' : _messages.last.content;
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ask the Quran'),
        actions: [
          PopupMenuButton<String>(
            tooltip: 'Answer mode',
            initialValue: _mode,
            onSelected: (v) => setState(() => _mode = v),
            icon: Icon(_mode == 'focused' ? Icons.center_focus_strong : Icons.public),
            itemBuilder: (context) => const [
              PopupMenuItem(
                value: 'focused',
                child: ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.center_focus_strong),
                  title: Text('Focused'),
                  subtitle: Text('Grounded strictly in the cited ayāt'),
                ),
              ),
              PopupMenuItem(
                value: 'open',
                child: ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.public),
                  title: Text('Open'),
                  subtitle: Text('Broader answer with context'),
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      const SizedBox(height: 24),
                      Icon(Icons.auto_awesome,
                          size: 40, color: dark ? QColors.nightAccent : QColors.accent),
                      const SizedBox(height: 12),
                      const Center(
                        child: Text(
                          'Answers grounded in the ayāt —\nevery response is cited.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ..._suggestions.map(
                        (s) => Card(
                          margin: const EdgeInsets.symmetric(vertical: 5),
                          child: ListTile(
                            dense: true,
                            title: Text(s, style: const TextStyle(fontSize: 14)),
                            onTap: () => _ask(s),
                          ),
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.all(14),
                    itemCount: _messages.length,
                    itemBuilder: (context, i) {
                      final m = _messages[i];
                      final isUser = m.role == 'user';
                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          constraints: const BoxConstraints(maxWidth: 320),
                          decoration: BoxDecoration(
                            color: isUser
                                ? (dark ? QColors.nightAccent : QColors.accent)
                                : (dark ? QColors.nightSurface : QColors.surface),
                            borderRadius: BorderRadius.circular(16),
                            border: isUser
                                ? null
                                : Border.all(color: dark ? QColors.nightLine : QColors.line),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (m.content.isEmpty && !isUser)
                                const SizedBox(
                                  width: 40,
                                  child: LinearProgressIndicator(minHeight: 2),
                                )
                              else
                                Text(
                                  m.content,
                                  style: isUser
                                      ? const TextStyle(color: Colors.white)
                                      : readingStyle(context, size: 14),
                                ),
                              if (m.sources.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: m.sources
                                      .map(
                                        (s) => ActionChip(
                                          visualDensity: VisualDensity.compact,
                                          label: Text(
                                            '${s.surahNumber}:${s.ayahNumber}',
                                            style: const TextStyle(fontSize: 11),
                                          ),
                                          onPressed: () => Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (_) =>
                                                  SurahScreen(surahNo: s.surahNumber),
                                            ),
                                          ),
                                        ),
                                      )
                                      .toList(),
                                ),
                              ],
                              if (!isUser && m.content.isNotEmpty && !_loading)
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: IconButton(
                                    visualDensity: VisualDensity.compact,
                                    tooltip: 'Share',
                                    icon: const Icon(Icons.share_outlined, size: 18),
                                    onPressed: () {
                                      final cites = m.sources
                                          .map((s) => '${s.surahNumber}:${s.ayahNumber}')
                                          .join(', ');
                                      Share.share(cites.isEmpty
                                            ? m.content
                                            : '${m.content}\n\nSources: $cites\n— quran.co.in',
                                      );
                                    },
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 6, 12, 10),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      onSubmitted: _ask,
                      textInputAction: TextInputAction.send,
                      decoration: InputDecoration(
                        hintText: 'Ask about any topic in the Quran…',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _loading ? null : () => _ask(_input.text),
                    icon: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
