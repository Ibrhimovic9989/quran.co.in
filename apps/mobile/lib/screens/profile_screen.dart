// Profile — sign-in runs the web auth flow in a secure browser sheet;
// once tokens land, everything is native.

import 'package:flutter/material.dart';

import '../core/auth.dart';
import '../core/theme.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _busy = false;

  Future<void> _signIn() async {
    setState(() => _busy = true);
    final ok = await AuthService.instance.signIn();
    if (mounted) {
      setState(() => _busy = false);
      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sign-in was not completed.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            tooltip: 'Settings',
            icon: const Icon(Icons.tune),
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
        ],
      ),
      body: ValueListenableBuilder<QUser?>(
        valueListenable: AuthService.instance.user,
        builder: (context, user, _) {
          if (user == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('بِسْمِ ٱللَّهِ',
                        textDirection: TextDirection.rtl,
                        style: quranStyle(size: 34, height: 1.6)),
                    const SizedBox(height: 16),
                    const Text(
                      'Sign in to sync your bookmarks and\nget a personalised verse each day.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: _busy ? null : _signIn,
                      icon: _busy
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.login),
                      label: const Text('Continue with Google'),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: CircleAvatar(
                  radius: 36,
                  backgroundColor: dark ? QColors.nightSurface : QColors.accentSoft,
                  backgroundImage:
                      user.imageUrl != null ? NetworkImage(user.imageUrl!) : null,
                  child: user.imageUrl == null
                      ? Text(
                          user.name.isNotEmpty ? user.name[0].toUpperCase() : '؟',
                          style: const TextStyle(fontSize: 24),
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(user.name,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              Center(
                child: Text(user.email,
                    style: TextStyle(
                        fontSize: 13, color: dark ? QColors.nightMuted : QColors.muted)),
              ),
              const SizedBox(height: 32),
              OutlinedButton.icon(
                onPressed: () => AuthService.instance.signOut(),
                icon: const Icon(Icons.logout),
                label: const Text('Sign out'),
              ),
            ],
          );
        },
      ),
    );
  }
}
