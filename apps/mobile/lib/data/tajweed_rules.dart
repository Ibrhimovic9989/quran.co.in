// Tajwīd rule metadata — the quran.com rule-class names → KFGQPC-faithful
// color + learner-friendly explanation. Used to color spans and to power the
// tap-a-letter "learn the rule" sheet and the legend.

import 'package:flutter/material.dart';

class TajweedRule {
  final String name; // English display name
  final String arabic; // Arabic name
  final Color color;
  final String how; // one-line "how to pronounce it"

  const TajweedRule(this.name, this.arabic, this.color, this.how);
}

const Map<String, TajweedRule> kTajweedRules = {
  'ham_wasl': TajweedRule('Hamzat al-Waṣl', 'همزة الوصل', Color(0xFFAAAAAA),
      'A connecting hamza — silent when continuing from the previous word; sounded only when you start on it.'),
  'laam_shamsiyah': TajweedRule('Lām Shamsiyyah', 'لام شمسية', Color(0xFFAAAAAA),
      "The 'l' of ‘al-’ is silent and the next letter is doubled — say ash-shams, not al-shams."),
  'slnt': TajweedRule('Silent Letter', 'حرف ساكن', Color(0xFFAAAAAA),
      'Written but not pronounced.'),
  'madda_normal': TajweedRule('Natural Prolongation', 'مد طبيعي', Color(0xFF537FFF),
      'Stretch this vowel for 2 counts (madd ṭabīʿī).'),
  'madda_permissible': TajweedRule('Permissible Prolongation', 'مد جائز', Color(0xFF4050FF),
      'May be stretched 2, 4 or 6 counts — pick one length and keep it consistent.'),
  'madda_necessary': TajweedRule('Necessary Prolongation', 'مد لازم', Color(0xFF000EBC),
      'Stretch for a full 6 counts (madd lāzim).'),
  'madda_obligatory': TajweedRule('Obligatory Prolongation', 'مد واجب', Color(0xFF2144C1),
      'Stretch for 4–5 counts (madd wājib muttaṣil).'),
  'qalaqah': TajweedRule('Qalqalah', 'قلقلة', Color(0xFFDD0008),
      'Give a slight bounce/echo on this letter when it carries sukūn (ق ط ب ج د).'),
  'ghunnah': TajweedRule('Ghunnah', 'غنة', Color(0xFFFF7E1E),
      'Nasalize through the nose for about 2 counts.'),
  'ikhafa': TajweedRule('Ikhfāʾ', 'إخفاء', Color(0xFF9400A8),
      'Hide the nūn sākinah / tanwīn into the next letter with a light ghunnah.'),
  'ikhafa_shafawi': TajweedRule('Ikhfāʾ Shafawī', 'إخفاء شفوي', Color(0xFFD500B7),
      'Hide the mīm sākinah before bāʾ with a light ghunnah of the lips.'),
  'idgham_ghunnah': TajweedRule('Idghām with Ghunnah', 'إدغام بغنة', Color(0xFF169777),
      'Merge the nūn sākinah / tanwīn into the next letter (ي ن م و) with ghunnah.'),
  'idgham_wo_ghunnah': TajweedRule('Idghām without Ghunnah', 'إدغام بلا غنة', Color(0xFF169200),
      'Merge the nūn sākinah / tanwīn into ل or ر without ghunnah.'),
  'idgham_shafawi': TajweedRule('Idghām Shafawī', 'إدغام شفوي', Color(0xFF58B800),
      'Merge mīm sākinah into a following mīm, with ghunnah.'),
  'idgham_mutajanisayn': TajweedRule('Idghām Mutajānisayn', 'إدغام متجانسين', Color(0xFFA1A1A1),
      'Two letters from the same articulation point merge together.'),
  'idgham_mutaqaribayn': TajweedRule('Idghām Mutaqāribayn', 'إدغام متقاربين', Color(0xFFA1A1A1),
      'Two letters with near articulation points merge together.'),
  'iqlab': TajweedRule('Iqlāb', 'إقلاب', Color(0xFF26BFFD),
      'Turn the nūn sākinah / tanwīn into a hidden mīm before bāʾ, with ghunnah.'),
};

/// Rules in a sensible teaching order for the legend.
const List<String> kTajweedLegendOrder = [
  'ghunnah', 'qalaqah', 'ikhafa', 'ikhafa_shafawi',
  'idgham_ghunnah', 'idgham_wo_ghunnah', 'idgham_shafawi', 'iqlab',
  'madda_normal', 'madda_permissible', 'madda_obligatory', 'madda_necessary',
  'ham_wasl', 'laam_shamsiyah', 'slnt',
];
