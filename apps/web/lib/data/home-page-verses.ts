// Home Page Verses & Reminders
// Contextually relevant Quranic verses and reminders for each section
// Strategically placed to enhance spiritual connection and interactivity

export interface HomePageVerse {
  text: string;
  arabic?: string;
  source: string;
  context: 'hero' | 'value' | 'features' | 'benefits' | 'how-it-works' | 'trust' | 'cta';
  type: 'quran' | 'hadith' | 'reminder';
}

export const homePageVerses: HomePageVerse[] = [
  // Hero Section - About the Quran itself
  {
    text: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    source: "Al-Baqarah 2:2",
    context: 'hero',
    type: 'quran'
  },
  {
    text: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    source: "Al-Qamar 54:17",
    context: 'hero',
    type: 'quran'
  },

  // Value Proposition - Seeking Knowledge & Understanding
  {
    text: "And your Lord says, 'Call upon Me; I will respond to you.'",
    arabic: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    source: "Ghafir 40:60",
    context: 'value',
    type: 'quran'
  },
  {
    text: "And We send down of the Quran that which is healing and mercy for the believers.",
    arabic: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    source: "Al-Isra 17:82",
    context: 'value',
    type: 'quran'
  },
  {
    text: "Seeking knowledge is an obligation upon every Muslim.",
    source: "Hadith",
    context: 'value',
    type: 'hadith'
  },

  // Features Showcase - Reading & Listening
  {
    text: "And recite the Quran with measured recitation.",
    arabic: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    source: "Al-Muzzammil 73:4",
    context: 'features',
    type: 'quran'
  },
  {
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Hadith",
    context: 'features',
    type: 'hadith'
  },
  {
    text: "Whoever recites a letter from the Book of Allah, he will be credited with a good deed, and a good deed gets a ten-fold reward.",
    source: "Hadith",
    context: 'features',
    type: 'hadith'
  },

  // Benefits Section - Spiritual Growth
  {
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    source: "Al-Baqarah 2:152",
    context: 'benefits',
    type: 'quran'
  },
  {
    text: "And whoever does righteous deeds - whether male or female - while being a believer, they will enter Paradise.",
    arabic: "وَمَن يَعْمَلْ مِنَ الصَّالِحَاتِ مِن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَأُولَٰئِكَ يَدْخُلُونَ الْجَنَّةَ",
    source: "An-Nisa 4:124",
    context: 'benefits',
    type: 'quran'
  },
  {
    text: "The Quran is an intercessor, something given permission to intercede, and it is rightfully believed in.",
    source: "Hadith",
    context: 'benefits',
    type: 'hadith'
  },

  // How It Works - Ease of Access
  {
    text: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    source: "Al-Qamar 54:17",
    context: 'how-it-works',
    type: 'quran'
  },
  {
    text: "Indeed, it is We who sent down the Quran and indeed, We will be its guardian.",
    arabic: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    source: "Al-Hijr 15:9",
    context: 'how-it-works',
    type: 'quran'
  },

  // Trust Indicators - Authenticity & Truth
  {
    text: "Indeed, it is We who sent down the Quran and indeed, We will be its guardian.",
    arabic: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    source: "Al-Hijr 15:9",
    context: 'trust',
    type: 'quran'
  },
  {
    text: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    source: "Al-Baqarah 2:2",
    context: 'trust',
    type: 'quran'
  },
  {
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    source: "Hadith",
    context: 'trust',
    type: 'hadith'
  },

  // CTA Section - Taking Action
  {
    text: "And whoever fears Allah - He will make for him a way out.",
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    source: "At-Talaq 65:2",
    context: 'cta',
    type: 'quran'
  },
  {
    text: "Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.",
    source: "Hadith",
    context: 'cta',
    type: 'hadith'
  },
  {
    text: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your preoccupation, and your life before your death.",
    source: "Hadith",
    context: 'cta',
    type: 'hadith'
  },
];

/**
 * Get a random verse for a specific context
 */
export function getVerseForContext(context: HomePageVerse['context']): HomePageVerse | undefined {
  const contextVerses = homePageVerses.filter(v => v.context === context);
  if (contextVerses.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * contextVerses.length);
  return contextVerses[randomIndex];
}

/**
 * Get all verses for a specific context
 */
export function getVersesForContext(context: HomePageVerse['context']): HomePageVerse[] {
  return homePageVerses.filter(v => v.context === context);
}
