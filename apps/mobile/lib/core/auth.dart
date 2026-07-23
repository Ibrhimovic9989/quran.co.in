// Auth: sign-in runs the WEB flow in a secure in-app browser sheet
// (ASWebAuthenticationSession / Chrome Custom Tab — Google blocks raw
// embedded WebViews for OAuth). The API finishes with
//   quranapp://auth#access_token=...&refresh_token=...
// which lands back here; everything after that is native Bearer calls.

import 'package:flutter/foundation.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

import 'api.dart';

class QUser {
  final String id;
  final String email;
  final String name;
  final String? imageUrl;
  QUser({required this.id, required this.email, required this.name, this.imageUrl});

  factory QUser.fromJson(Map<String, dynamic> j) => QUser(
        id: j['id'] as String,
        email: j['email'] as String,
        name: j['name'] as String? ?? '',
        imageUrl: j['imageUrl'] as String?,
      );
}

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final ValueNotifier<QUser?> user = ValueNotifier<QUser?>(null);

  Future<void> init() async {
    await Api.instance.loadTokens();
    if (Api.instance.hasToken) {
      await _loadMe();
    }
  }

  Future<void> _loadMe() async {
    try {
      final data = await Api.instance.getJson('/api/auth/me') as Map<String, dynamic>;
      user.value = QUser.fromJson(data['user'] as Map<String, dynamic>);
    } catch (_) {
      user.value = null;
    }
  }

  /// Full sign-in via the web flow. Returns true when signed in.
  Future<bool> signIn() async {
    try {
      final result = await FlutterWebAuth2.authenticate(
        url: '$kApiBase/api/auth/google?client=mobile',
        callbackUrlScheme: 'quranapp',
      );
      // quranapp://auth#access_token=...&refresh_token=...
      final fragment = Uri.parse(result).fragment;
      final params = Uri.splitQueryString(fragment);
      final access = params['access_token'];
      final refresh = params['refresh_token'];
      if (access == null || refresh == null) return false;
      await Api.instance.saveTokens(access: access, refresh: refresh);
      await _loadMe();
      return user.value != null;
    } catch (_) {
      return false; // user cancelled or flow failed
    }
  }

  Future<void> signOut() async {
    await Api.instance.clearTokens();
    user.value = null;
  }
}
