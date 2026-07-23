// Quran.co.in mobile — native app over api.quran.co.in.
// Auth runs the web flow in a secure browser sheet; everything else native.

import 'package:flutter/material.dart';

import 'core/auth.dart';
import 'core/theme.dart';
import 'screens/ask_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/surah_list_screen.dart';
import 'screens/today_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthService.instance.init();
  runApp(const QuranApp());
}

class QuranApp extends StatelessWidget {
  const QuranApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quran',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildNightTheme(),
      themeMode: ThemeMode.system,
      home: const _Shell(),
    );
  }
}

class _Shell extends StatefulWidget {
  const _Shell();

  @override
  State<_Shell> createState() => _ShellState();
}

class _ShellState extends State<_Shell> {
  int _index = 0;

  static const _screens = [
    SurahListScreen(),
    TodayScreen(),
    AskScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Quran'),
          NavigationDestination(icon: Icon(Icons.wb_sunny_outlined), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), label: 'Ask'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
