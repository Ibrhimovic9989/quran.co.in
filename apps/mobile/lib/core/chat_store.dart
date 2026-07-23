// Persistent Ask history — past conversations, saved on-device so they
// survive app restarts. Each conversation is a titled thread of messages
// (with their cited sources).

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models.dart';

class ChatMessage {
  final String role; // user | assistant
  String content;
  List<AskSource> sources;

  ChatMessage(this.role, this.content, {this.sources = const []});

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
        'sources': sources
            .map((s) => {
                  'surahNumber': s.surahNumber,
                  'ayahNumber': s.ayahNumber,
                  'englishName': s.englishName,
                  'translationText': s.translationText,
                })
            .toList(),
      };

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
        j['role'] as String,
        j['content'] as String? ?? '',
        sources: (j['sources'] as List? ?? [])
            .map((s) => AskSource.fromJson(s as Map<String, dynamic>))
            .toList(),
      );
}

class Conversation {
  final String id;
  String title;
  int updatedAt; // epoch ms, passed in (Date.now is unavailable in some ctxs)
  final List<ChatMessage> messages;

  Conversation({
    required this.id,
    required this.title,
    required this.updatedAt,
    required this.messages,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'updatedAt': updatedAt,
        'messages': messages.map((m) => m.toJson()).toList(),
      };

  factory Conversation.fromJson(Map<String, dynamic> j) => Conversation(
        id: j['id'] as String,
        title: j['title'] as String? ?? 'Conversation',
        updatedAt: j['updatedAt'] as int? ?? 0,
        messages: (j['messages'] as List? ?? [])
            .map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
            .toList(),
      );
}

class ChatStore {
  ChatStore._();
  static final ChatStore instance = ChatStore._();

  static const _kConversations = 'ask_conversations';
  static const _maxConversations = 50;

  final ValueNotifier<List<Conversation>> conversations = ValueNotifier([]);
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    final raw = _prefs?.getString(_kConversations);
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List;
        conversations.value =
            list.map((e) => Conversation.fromJson(e as Map<String, dynamic>)).toList();
      } catch (_) {}
    }
  }

  /// Insert or update a conversation, keeping the list newest-first.
  void save(Conversation convo) {
    final list = List<Conversation>.from(conversations.value);
    list.removeWhere((c) => c.id == convo.id);
    list.insert(0, convo);
    if (list.length > _maxConversations) list.removeRange(_maxConversations, list.length);
    conversations.value = list;
    _persist();
  }

  void delete(String id) {
    final list = List<Conversation>.from(conversations.value)..removeWhere((c) => c.id == id);
    conversations.value = list;
    _persist();
  }

  void clear() {
    conversations.value = [];
    _persist();
  }

  void _persist() {
    _prefs?.setString(
      _kConversations,
      jsonEncode(conversations.value.map((c) => c.toJson()).toList()),
    );
  }
}
