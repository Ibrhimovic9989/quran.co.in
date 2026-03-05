// Loading Messages Data
// Collection of Quranic verses, istighfars, duas, and beneficial reminders
// Displays during loading states to provide value to users

export interface LoadingMessage {
  text: string;
  source: string;
  type: 'quran' | 'istighfar' | 'dua' | 'reminder';
}

export const loadingMessages: LoadingMessage[] = [
  // Quranic Verses
  {
    text: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    source: "Al-Qamar 54:17",
    type: 'quran'
  },
  {
    text: "And recite the Quran with measured recitation.",
    source: "Al-Muzzammil 73:4",
    type: 'quran'
  },
  {
    text: "Indeed, it is We who sent down the Quran and indeed, We will be its guardian.",
    source: "Al-Hijr 15:9",
    type: 'quran'
  },
  {
    text: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    source: "Al-Baqarah 2:2",
    type: 'quran'
  },
  {
    text: "And We send down of the Quran that which is healing and mercy for the believers.",
    source: "Al-Isra 17:82",
    type: 'quran'
  },
  {
    text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    source: "Al-Baqarah 2:152",
    type: 'quran'
  },
  {
    text: "And whoever does righteous deeds - whether male or female - while being a believer, they will enter Paradise.",
    source: "An-Nisa 4:124",
    type: 'quran'
  },
  {
    text: "And your Lord says, 'Call upon Me; I will respond to you.'",
    source: "Ghafir 40:60",
    type: 'quran'
  },
  {
    text: "And it is He who sends down rain from the sky, and We produce thereby vegetation of every kind.",
    source: "Al-An'am 6:99",
    type: 'quran'
  },
  {
    text: "And whoever fears Allah - He will make for him a way out.",
    source: "At-Talaq 65:2",
    type: 'quran'
  },

  // Istighfars (Seeking Forgiveness)
  {
    text: "Astaghfirullah (I seek forgiveness from Allah)",
    source: "Istighfar",
    type: 'istighfar'
  },
  {
    text: "Astaghfirullah al-'Azeem (I seek forgiveness from Allah, the Most Great)",
    source: "Istighfar",
    type: 'istighfar'
  },
  {
    text: "Rabbighfirli (My Lord, forgive me)",
    source: "Istighfar",
    type: 'istighfar'
  },
  {
    text: "Allahumma anta rabbi, la ilaha illa anta, khalaqtani wa ana 'abduka (O Allah, You are my Lord, there is no god but You, You created me and I am Your servant)",
    source: "Istighfar",
    type: 'istighfar'
  },
  {
    text: "Astaghfirullah wa atubu ilayh (I seek forgiveness from Allah and repent to Him)",
    source: "Istighfar",
    type: 'istighfar'
  },
  {
    text: "Rabbana zalamna anfusana wa-in lam taghfir lana wa tarhamna lanakoonanna mina alkhasireen (Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers)",
    source: "Al-A'raf 7:23",
    type: 'istighfar'
  },

  // Duas (Supplications)
  {
    text: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina 'adhaban-nar (Our Lord, give us good in this world and good in the Hereafter and protect us from the punishment of the Fire)",
    source: "Al-Baqarah 2:201",
    type: 'dua'
  },
  {
    text: "Rabbana la tuzigh quloobana ba'da idh hadaytana wa hab lana min ladunka rahmah (Our Lord, do not let our hearts deviate after You have guided us and grant us from Yourself mercy)",
    source: "Ali 'Imran 3:8",
    type: 'dua'
  },
  {
    text: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan (O Allah, I ask You for beneficial knowledge, good provision, and acceptable deeds)",
    source: "Dua",
    type: 'dua'
  },
  {
    text: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'ala alqawmi alkafireen (Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people)",
    source: "Al-Baqarah 2:250",
    type: 'dua'
  },
  {
    text: "Allahumma barik lana fi ma razaqtana wa qina 'adhaban-nar (O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire)",
    source: "Dua",
    type: 'dua'
  },
  {
    text: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama (Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous)",
    source: "Al-Furqan 25:74",
    type: 'dua'
  },

  // Beneficial Reminders
  {
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "Whoever recites a letter from the Book of Allah, he will be credited with a good deed, and a good deed gets a ten-fold reward.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The Quran is an intercessor, something given permission to intercede, and it is rightfully believed in. Whoever puts it in front of him, it will lead him to Paradise.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The example of a believer who recites the Quran is like that of a citron, which tastes good and smells good.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The best time to seek knowledge is when you are young, and the best time to act upon it is when you are old.",
    source: "Islamic Wisdom",
    type: 'reminder'
  },
  {
    text: "Knowledge without action is like a tree without fruit.",
    source: "Islamic Wisdom",
    type: 'reminder'
  },
  {
    text: "The most beloved deed to Allah is the most regular and constant, even if it is little.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your preoccupation, and your life before your death.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The best remembrance is 'La ilaha illa Allah' (There is no god but Allah), and the best supplication is 'Alhamdulillah' (Praise be to Allah).",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "Whoever seeks knowledge, Allah will make the path to Paradise easy for him.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "Seeking knowledge is an obligation upon every Muslim.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "The best of people are those who are most beneficial to others.",
    source: "Hadith",
    type: 'reminder'
  },
  {
    text: "A person's true wealth is the good deeds that he does in this world.",
    source: "Hadith",
    type: 'reminder'
  },
];

/**
 * Get a random loading message
 */
export function getRandomLoadingMessage(): LoadingMessage {
  const randomIndex = Math.floor(Math.random() * loadingMessages.length);
  return loadingMessages[randomIndex];
}

/**
 * Get a random loading message of a specific type
 */
export function getRandomLoadingMessageByType(type: LoadingMessage['type']): LoadingMessage {
  const filtered = loadingMessages.filter(msg => msg.type === type);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
