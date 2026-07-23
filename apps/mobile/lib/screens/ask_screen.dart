// Ask the Quran — native chat over the API's SSE stream, with persistent
// conversation history (a drawer of past chats, new-chat, restore, delete).

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/api.dart';
import '../core/chat_store.dart';
import '../core/theme.dart';
import '../models.dart';
import 'surah_screen.dart';

class AskScreen extends StatefulWidget {
  const AskScreen({super.key});

  @override
  State<AskScreen> createState() => _AskScreenState();
}

class _AskScreenState extends State<AskScreen> {
  final List<ChatMessage> _messages = [];
  String? _convoId;
  String? _title;

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

  int get _nowMs => DateTime.now().millisecondsSinceEpoch;

  void _newChat() {
    setState(() {
      _messages.clear();
      _convoId = null;
      _title = null;
    });
  }

  void _openConversation(Conversation c) {
    setState(() {
      _convoId = c.id;
      _title = c.title;
      _messages
        ..clear()
        ..addAll(c.messages.map((m) => ChatMessage(m.role, m.content, sources: m.sources)));
    });
  }

  void _persist() {
    if (_convoId == null || _messages.isEmpty) return;
    ChatStore.instance.save(Conversation(
      id: _convoId!,
      title: _title ?? 'Conversation',
      updatedAt: _nowMs,
      messages: _messages
          .map((m) => ChatMessage(m.role, m.content, sources: m.sources))
          .toList(),
    ));
  }

  Future<void> _ask(String question) async {
    final q = question.trim();
    if (q.isEmpty || _loading) return;
    _input.clear();

    final history = _messages
        .map((m) => {'role': m.role, 'content': m.content})
        .toList(growable: false);

    setState(() {
      if (_convoId == null) {
        _convoId = '$_nowMs';
        _title = q.length > 48 ? '${q.substring(0, 48)}…' : q;
      }
      _messages.add(ChatMessage('user', q));
      _messages.add(ChatMessage('assistant', ''));
      _loading = true;
    });

    try {
      // Inactivity guard: a free-tier model can occasionally hang. 75s tolerates
      // a Render cold start before the first frame; once tokens flow they're
      // far faster, so this only trips on a genuinely stuck stream.
      final stream = Api.instance
          .askStream(question: q, mode: _mode, history: history)
          .timeout(const Duration(seconds: 75));
      await for (final event in stream) {
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
          _messages.last.content = _messages.last.content.isEmpty
              ? 'Something went wrong — please try again.'
              : _messages.last.content;
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
      _persist();
    }
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      drawer: _HistoryDrawer(
        currentId: _convoId,
        onNew: _newChat,
        onOpen: _openConversation,
      ),
      appBar: AppBar(
        title: const Text('Ask the Quran'),
        actions: [
          IconButton(
            tooltip: 'New chat',
            icon: const Icon(Icons.add_comment_outlined),
            onPressed: _messages.isEmpty ? null : _newChat,
          ),
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
                                              builder: (_) => SurahScreen(
                                                  surahNo: s.surahNumber, initialAyah: s.ayahNumber),
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
                                          : '${m.content}\n\nSources: $cites\n— quran.co.in');
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

class _HistoryDrawer extends StatelessWidget {
  final String? currentId;
  final VoidCallback onNew;
  final void Function(Conversation) onOpen;
  const _HistoryDrawer({required this.currentId, required this.onNew, required this.onOpen});

  String _ago(int ms) {
    final d = DateTime.now().difference(DateTime.fromMillisecondsSinceEpoch(ms));
    if (d.inMinutes < 1) return 'just now';
    if (d.inMinutes < 60) return '${d.inMinutes}m ago';
    if (d.inHours < 24) return '${d.inHours}h ago';
    if (d.inDays < 7) return '${d.inDays}d ago';
    return '${(d.inDays / 7).floor()}w ago';
  }

  @override
  Widget build(BuildContext context) {
    final p = QPalette.of(context);
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  Text('History',
                      style: TextStyle(
                          fontSize: 12, letterSpacing: 2, fontWeight: FontWeight.w700, color: p.gold)),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      onNew();
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('New'),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ValueListenableBuilder<List<Conversation>>(
                valueListenable: ChatStore.instance.conversations,
                builder: (context, convos, _) {
                  if (convos.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text('No past conversations yet.',
                            style: TextStyle(color: p.muted), textAlign: TextAlign.center),
                      ),
                    );
                  }
                  return ListView.builder(
                    itemCount: convos.length,
                    itemBuilder: (context, i) {
                      final c = convos[i];
                      final selected = c.id == currentId;
                      return ListTile(
                        selected: selected,
                        selectedTileColor: p.accent.withValues(alpha: 0.08),
                        leading: Icon(Icons.chat_bubble_outline, size: 20, color: p.muted),
                        title: Text(c.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                        subtitle: Text('${_ago(c.updatedAt)} · ${c.messages.length ~/ 2} Q',
                            style: TextStyle(fontSize: 11, color: p.muted)),
                        trailing: IconButton(
                          icon: Icon(Icons.close, size: 18, color: p.muted),
                          onPressed: () => ChatStore.instance.delete(c.id),
                        ),
                        onTap: () {
                          Navigator.of(context).pop();
                          onOpen(c);
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
