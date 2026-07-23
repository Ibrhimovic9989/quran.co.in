// Quran.co.in mobile — native app over api.quran.co.in.
// Auth runs the web flow in a secure browser sheet; everything else native.

import 'package:flutter/material.dart';

import 'core/auth.dart';
import 'core/library.dart';
import 'core/settings.dart';
import 'core/theme.dart';
import 'screens/ask_screen.dart';
import 'screens/bookmarks_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/surah_list_screen.dart';
import 'screens/today_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Settings.instance.init();
  await AuthService.instance.init();
  await Library.instance.init();
  runApp(const QuranApp());
}

class QuranApp extends StatelessWidget {
  const QuranApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Settings.instance,
      builder: (context, _) {
        final choice = Settings.instance.theme;
        final light = buildLightTheme();
        final night = buildNightTheme();
        final sepia = buildSepiaTheme();

        ThemeData theme;
        ThemeData darkTheme;
        ThemeMode mode;
        switch (choice) {
          case ThemeChoice.system:
            theme = light;
            darkTheme = night;
            mode = ThemeMode.system;
          case ThemeChoice.light:
            theme = light;
            darkTheme = light;
            mode = ThemeMode.light;
          case ThemeChoice.sepia:
            theme = sepia;
            darkTheme = sepia;
            mode = ThemeMode.light;
          case ThemeChoice.night:
            theme = night;
            darkTheme = night;
            mode = ThemeMode.dark;
        }

        return MaterialApp(
          title: 'Quran',
          debugShowCheckedModeBanner: false,
          theme: theme,
          darkTheme: darkTheme,
          themeMode: mode,
          home: const _Shell(),
        );
      },
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
    BookmarksScreen(),
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
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Read'),
          NavigationDestination(icon: Icon(Icons.wb_sunny_outlined), label: 'Today'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), label: 'Ask'),
          NavigationDestination(icon: Icon(Icons.bookmark_border), label: 'Saved'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
