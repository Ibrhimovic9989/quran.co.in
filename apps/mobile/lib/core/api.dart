// API client for api.quran.co.in — Bearer token auth (mobile transport),
// automatic refresh-on-401, and SSE streaming for /quran/ask.

import 'dart:async';
import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'https://api.quran.co.in',
);

class Api {
  Api._();
  static final Api instance = Api._();

  static const _storage = FlutterSecureStorage();
  static const _kAccess = 'access_token';
  static const _kRefresh = 'refresh_token';

  String? _accessToken;

  Future<void> loadTokens() async {
    _accessToken = await _storage.read(key: _kAccess);
  }

  bool get hasToken => _accessToken != null;

  Future<void> saveTokens({required String access, required String refresh}) async {
    _accessToken = access;
    await _storage.write(key: _kAccess, value: access);
    await _storage.write(key: _kRefresh, value: refresh);
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }

  Map<String, String> _headers({bool json = false}) => {
        if (json) 'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  Future<bool> _tryRefresh() async {
    final refresh = await _storage.read(key: _kRefresh);
    if (refresh == null) return false;
    try {
      final res = await http.post(
        Uri.parse('$kApiBase/api/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refresh}),
      );
      if (res.statusCode != 200 && res.statusCode != 201) return false;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      await saveTokens(
        access: data['accessToken'] as String,
        refresh: data['refreshToken'] as String,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<http.Response> _send(
    Future<http.Response> Function() run,
  ) async {
    var res = await run();
    if (res.statusCode == 401 && await _tryRefresh()) {
      res = await run();
    }
    return res;
  }

  Future<dynamic> getJson(String path) async {
    final res = await _send(
      () => http.get(Uri.parse('$kApiBase$path'), headers: _headers()),
    );
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, res.body);
    }
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  Future<dynamic> postJson(String path, Map<String, dynamic> body) async {
    final res = await _send(
      () => http.post(
        Uri.parse('$kApiBase$path'),
        headers: _headers(json: true),
        body: jsonEncode(body),
      ),
    );
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, res.body);
    }
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  /// SSE stream for POST /api/quran/ask — yields decoded event maps
  /// ({type: sources|token|done, ...}).
  Stream<Map<String, dynamic>> askStream({
    required String question,
    String mode = 'focused',
    List<Map<String, String>> history = const [],
  }) async* {
    final req = http.Request('POST', Uri.parse('$kApiBase/api/quran/ask'))
      ..headers.addAll(_headers(json: true))
      ..body = jsonEncode({'question': question, 'mode': mode, 'history': history});

    final res = await http.Client().send(req);
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, 'ask failed');
    }

    var buffer = '';
    await for (final chunk in res.stream.transform(utf8.decoder)) {
      buffer += chunk;
      final frames = buffer.split('\n\n');
      buffer = frames.removeLast();
      for (final frame in frames) {
        if (!frame.startsWith('data: ')) continue;
        try {
          yield jsonDecode(frame.substring(6)) as Map<String, dynamic>;
        } catch (_) {
          // malformed frame — skip
        }
      }
    }
  }
}

class ApiException implements Exception {
  final int status;
  final String body;
  ApiException(this.status, this.body);
  @override
  String toString() => 'ApiException($status)';
}
