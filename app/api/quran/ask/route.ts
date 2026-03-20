import { NextRequest } from 'next/server';
import { AzureOpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { getCanonicalAyahs } from '@/lib/data/canonical-context';

const prisma = new PrismaClient();

const embedClient = new AzureOpenAI({
  apiKey:     process.env.AZURE_OPENAI_API_KEY!,
  endpoint:   process.env.AZURE_OPENAI_ENDPOINT!,
  deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
});

const chatClient = new AzureOpenAI({
  apiKey:     process.env.AZURE_OPENAI_API_KEY!,
  endpoint:   process.env.AZURE_OPENAI_ENDPOINT!,
  deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_CHAT_API_VERSION ?? '2024-04-01-preview',
});

// ── System prompts ────────────────────────────────────────────────────────────

const FOCUSED_PROMPT = `You are a knowledgeable and respectful assistant for Quran.co.in.
You help users understand the Quran using ayahs automatically retrieved by the system.

Formatting rules (strictly follow these):
- Structure longer answers with clear section headings. Format each heading as: ## Heading Text
- Use bullet points (starting with - ) for lists of points.
- Cite every ayah you reference inline as [Surah Name, Surah:Ayah] — e.g. [Al-Baqarah, 2:214].
- When quoting or explaining a specific dua (supplication) or ayah, ALWAYS include the Arabic text AND its English translation on two consecutive lines in this exact format:
  ARABIC: <arabic text here>
  TRANSLATION: <english translation here>
- Never say "the verses you provided" — they are system-retrieved, not user-provided.
- Maintain full conversation context. If the user says "yes", "tell me more", "continue" etc., continue naturally.
- Do not give personal religious rulings (fatwas).
- Write in plain English. Do NOT use **bold** markers or *italic* markers.`;

const OPEN_PROMPT = `You are a knowledgeable and respectful Islamic scholar assistant for Quran.co.in.
You have deep knowledge of the entire Quran.

Formatting rules (strictly follow these):
- Structure longer answers with clear section headings. Format each heading as: ## Heading Text
- Use bullet points (starting with - ) for lists of points.
- Cite every ayah you reference inline as [Surah Name, Surah:Ayah] — e.g. [Al-Baqarah, 2:214].
- When quoting or explaining a specific dua (supplication) or ayah, ALWAYS include the Arabic text AND its English translation on two consecutive lines in this exact format:
  ARABIC: <arabic text here>
  TRANSLATION: <english translation here>
- When the user asks about a specific ayah, explain it clearly with its meaning, context, and lesson.
- Maintain full conversation context. If the user says "yes", "continue", "tell me more" etc., continue naturally.
- Do not give personal religious rulings (fatwas).
- Write in plain English. Do NOT use **bold** markers or *italic* markers.`;

// ── Surah name → number lookup (common English & transliterated names) ────────

const SURAH_NAMES: Record<string, number> = {
  'fatiha': 1, 'al-fatiha': 1, 'fatihah': 1,
  'baqarah': 2, 'al-baqarah': 2, 'bakara': 2,
  'imran': 3, "al-imran": 3, 'imraan': 3,
  'nisa': 4, 'nisa\'': 4, 'an-nisa': 4, 'nisaa': 4,
  'maidah': 5, 'al-maidah': 5, 'maida': 5,
  'anam': 6, 'al-anam': 6, 'an\'am': 6,
  'araf': 7, 'al-araf': 7,
  'anfal': 8, 'al-anfal': 8,
  'tawbah': 9, 'at-tawbah': 9, 'taubah': 9, 'bara\'ah': 9,
  'yunus': 10, 'jonah': 10,
  'hud': 11,
  'yusuf': 12, 'joseph': 12,
  'rad': 13, 'ar-rad': 13,
  'ibrahim': 14, 'abraham': 14,
  'hijr': 15, 'al-hijr': 15,
  'nahl': 16, 'an-nahl': 16,
  'isra': 17, 'al-isra': 17, 'bani-israel': 17,
  'kahf': 18, 'al-kahf': 18,
  'maryam': 19, 'mary': 19,
  'taha': 20,
  'anbiya': 21, 'al-anbiya': 21,
  'hajj': 22, 'al-hajj': 22,
  'muminun': 23, 'al-muminun': 23, 'mu\'minun': 23,
  'nur': 24, 'an-nur': 24,
  'furqan': 25, 'al-furqan': 25,
  'shuara': 26, 'ash-shuara': 26,
  'naml': 27, 'an-naml': 27,
  'qasas': 28, 'al-qasas': 28,
  'ankabut': 29, 'al-ankabut': 29,
  'rum': 30, 'ar-rum': 30,
  'luqman': 31,
  'sajdah': 32, 'as-sajdah': 32,
  'ahzab': 33, 'al-ahzab': 33,
  'saba': 34, "saba'": 34,
  'fatir': 35,
  'yasin': 36, 'yaseen': 36,
  'saffat': 37, 'as-saffat': 37,
  'sad': 38,
  'zumar': 39, 'az-zumar': 39,
  'ghafir': 40, 'mu\'min': 40,
  'fussilat': 41,
  'shura': 42, 'ash-shura': 42,
  'zukhruf': 43, 'az-zukhruf': 43,
  'dukhan': 44, 'ad-dukhan': 44,
  'jathiyah': 45, 'al-jathiyah': 45,
  'ahqaf': 46, 'al-ahqaf': 46,
  'muhammad': 47,
  'fath': 48, 'al-fath': 48,
  'hujurat': 49, 'al-hujurat': 49,
  'qaf': 50,
  'dhariyat': 51, 'adh-dhariyat': 51,
  'tur': 52, 'at-tur': 52,
  'najm': 53, 'an-najm': 53,
  'qamar': 54, 'al-qamar': 54,
  'rahman': 55, 'ar-rahman': 55,
  'waqiah': 56, 'al-waqiah': 56, "waqi'ah": 56,
  'hadid': 57, 'al-hadid': 57,
  'mujadila': 58, 'al-mujadila': 58,
  'hashr': 59, 'al-hashr': 59,
  'mumtahanah': 60, 'al-mumtahanah': 60,
  'saff': 61, 'as-saff': 61,
  'jumuah': 62, 'al-jumuah': 62,
  'munafiqun': 63, 'al-munafiqun': 63,
  'taghabun': 64, 'at-taghabun': 64,
  'talaq': 65, 'at-talaq': 65,
  'tahrim': 66, 'at-tahrim': 66,
  'mulk': 67, 'al-mulk': 67,
  'qalam': 68, 'al-qalam': 68,
  'haqqah': 69, 'al-haqqah': 69,
  'maarij': 70, 'al-maarij': 70,
  'nuh': 71,
  'jinn': 72, 'al-jinn': 72,
  'muzzammil': 73, 'al-muzzammil': 73,
  'muddaththir': 74, 'al-muddaththir': 74,
  'qiyamah': 75, 'al-qiyamah': 75,
  'insan': 76, 'al-insan': 76, 'dahr': 76,
  'mursalat': 77, 'al-mursalat': 77,
  'naba': 78, "an-naba'": 78,
  'naziat': 79, 'an-naziat': 79,
  'abasa': 80,
  'takwir': 81, 'at-takwir': 81,
  'infitar': 82, 'al-infitar': 82,
  'mutaffifin': 83, 'al-mutaffifin': 83,
  'inshiqaq': 84, 'al-inshiqaq': 84,
  'buruj': 85, 'al-buruj': 85,
  'tariq': 86, 'at-tariq': 86,
  'ala': 87, "al-a'la": 87,
  'ghashiyah': 88, 'al-ghashiyah': 88,
  'fajr': 89, 'al-fajr': 89,
  'balad': 90, 'al-balad': 90,
  'shams': 91, 'ash-shams': 91,
  'layl': 92, 'al-layl': 92,
  'duha': 93, 'ad-duha': 93,
  'sharh': 94, 'ash-sharh': 94, 'inshirah': 94,
  'tin': 95, 'at-tin': 95,
  'alaq': 96, "al-'alaq": 96,
  'qadr': 97, 'al-qadr': 97,
  'bayyinah': 98, 'al-bayyinah': 98,
  'zalzalah': 99, 'az-zalzalah': 99,
  'adiyat': 100, "al-'adiyat": 100,
  'qariah': 101, "al-qari'ah": 101,
  'takathur': 102, 'at-takathur': 102,
  'asr': 103, "al-'asr": 103,
  'humazah': 104, 'al-humazah': 104,
  'fil': 105, 'al-fil': 105,
  'quraysh': 106,
  'maun': 107, "al-ma'un": 107,
  'kawthar': 108, 'al-kawthar': 108,
  'kafirun': 109, 'al-kafirun': 109,
  'nasr': 110, 'an-nasr': 110,
  'masad': 111, 'al-masad': 111, 'lahab': 111,
  'ikhlas': 112, 'al-ikhlas': 112,
  'falaq': 113, 'al-falaq': 113,
  'nas': 114, 'an-nas': 114,
};

function extractDirectRef(q: string): { surah: number; ayah: number } | null {
  const lower = q.toLowerCase();

  // Pattern 1: numeric "2:214" or "2-214"
  const numericMatch = q.match(/\b(\d{1,3})\s*[:\-]\s*(\d{1,3})\b/);
  if (numericMatch) {
    const s = parseInt(numericMatch[1]);
    const a = parseInt(numericMatch[2]);
    if (s >= 1 && s <= 114 && a >= 1) return { surah: s, ayah: a };
  }

  // Pattern 2: "surah <name> <number>" or "<name> <number> ayah/ayat/verse"
  for (const [name, num] of Object.entries(SURAH_NAMES)) {
    if (lower.includes(name)) {
      // Look for an ayah number after the surah name (or anywhere in the query)
      const afterName = lower.slice(lower.indexOf(name) + name.length);
      const ayahMatch = afterName.match(/\b(\d{1,3})\b/) ?? q.match(/\b(\d{1,3})\b/);
      if (ayahMatch) {
        const a = parseInt(ayahMatch[1]);
        if (a >= 1) return { surah: num, ayah: a };
      }
    }
  }

  return null;
}

type AyahRow = {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
};

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const { question, mode = 'focused', history = [] } = await req.json() as {
    question?: string;
    mode?: 'focused' | 'open';
    history?: HistoryMessage[];
  };

  if (!question || question.trim().length < 3) {
    return new Response(JSON.stringify({ error: 'Question is required' }), { status: 400 });
  }

  const q = question.trim();

  try {
    // 1a. Detect direct ayah reference (e.g. "2:214")
    const directRef = extractDirectRef(q);
    let directAyah: AyahRow | null = null;

    if (directRef) {
      const found = await prisma.ayah.findFirst({
        where: { surahNumber: directRef.surah, number: directRef.ayah, apiProvider: 'TEMPORARY_API' },
        select: {
          surahNumber: true,
          number: true,
          arabicText: true,
          translationText: true,
          surah: { select: { englishName: true } },
        },
      });
      if (found) {
        directAyah = {
          surahNumber: found.surahNumber,
          ayahNumber: found.number,
          arabicText: found.arabicText,
          translationText: found.translationText,
          englishName: found.surah?.englishName ?? `Surah ${found.surahNumber}`,
        };
      }
    }

    // 1b. Canonical guaranteed ayahs (e.g. "duas for parents" always includes 14:41)
    const canonicalRefs = getCanonicalAyahs(q);
    const canonicalAyahs: AyahRow[] = [];

    if (canonicalRefs.length > 0) {
      const fetched = await Promise.all(
        canonicalRefs.map(({ surah, ayah }) =>
          prisma.ayah.findFirst({
            where: { surahNumber: surah, number: ayah, apiProvider: 'TEMPORARY_API' },
            select: {
              surahNumber: true,
              number: true,
              arabicText: true,
              translationText: true,
              surah: { select: { englishName: true } },
            },
          })
        )
      );
      for (const found of fetched) {
        if (found) {
          canonicalAyahs.push({
            surahNumber: found.surahNumber,
            ayahNumber: found.number,
            arabicText: found.arabicText,
            translationText: found.translationText,
            englishName: found.surah?.englishName ?? `Surah ${found.surahNumber}`,
          });
        }
      }
    }

    // 2. Semantic search for related ayahs
    const embRes = await embedClient.embeddings.create({
      input: [q],
      model: 'text-embedding-3-small',
    });
    const vector = `[${embRes.data[0].embedding.join(',')}]`;

    const semanticRows = await prisma.$queryRaw<AyahRow[]>`
      WITH verse_scores AS (
        SELECT ve."ayahId", ve."surahNumber", ve."ayahNumber",
               ve.embedding <=> ${vector}::vector AS dist
        FROM verse_embeddings ve
      ),
      tafsir_scores AS (
        SELECT te."ayahId", te."surahNumber", te."ayahNumber",
               te.embedding <=> ${vector}::vector AS dist
        FROM tafsir_embeddings te
      ),
      best_scores AS (
        SELECT "ayahId", "surahNumber", "ayahNumber", MIN(dist) AS dist
        FROM (SELECT * FROM verse_scores UNION ALL SELECT * FROM tafsir_scores) combined
        GROUP BY "ayahId", "surahNumber", "ayahNumber"
      )
      SELECT
        b."surahNumber",
        b."ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName"
      FROM best_scores b
      JOIN ayahs  a ON a.id     = b."ayahId"
      JOIN surahs s ON s.number = b."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      ORDER BY b.dist
      LIMIT 8
    `;

    // 3. Merge: direct → canonical → semantic (all deduplicated)
    const seen = new Set<string>();
    const rows: AyahRow[] = [];

    const addRow = (r: AyahRow) => {
      const key = `${r.surahNumber}:${r.ayahNumber}`;
      if (!seen.has(key)) { seen.add(key); rows.push(r); }
    };

    if (directAyah) addRow(directAyah);
    for (const r of canonicalAyahs) addRow(r);
    for (const r of semanticRows) addRow(r);

    if (!rows.length) {
      return new Response(JSON.stringify({ error: 'No relevant ayahs found' }), { status: 404 });
    }

    // 4. Build context block
    const context = rows
      .map((r) =>
        `[${r.englishName}, ${r.surahNumber}:${r.ayahNumber}]\n` +
        `Arabic: ${r.arabicText}\n` +
        `Translation: ${r.translationText ?? 'Not available'}`
      )
      .join('\n\n');

    const label = mode === 'open' ? 'Context Ayahs (retrieved by system)' : 'Retrieved Ayahs (system-fetched context)';
    const userMessage = `Question: ${q}\n\n${label}:\n\n${context}`;

    // 5. Build full message history for context continuity
    // Keep last 10 turns (20 messages) to stay within token limits
    const recentHistory = history.slice(-20);

    const stream = await chatClient.chat.completions.create({
      model: 'gpt-5.2-chat',
      messages: [
        { role: 'system', content: mode === 'open' ? OPEN_PROMPT : FOCUSED_PROMPT },
        ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user',   content: userMessage },
      ],
      stream: true,
      max_completion_tokens: 1024,
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sourcesChunk = JSON.stringify({
          type: 'sources',
          ayahs: rows.map((r) => ({
            surahNumber: r.surahNumber,
            ayahNumber: r.ayahNumber,
            englishName: r.englishName,
            translationText: r.translationText,
          })),
        });
        controller.enqueue(encoder.encode(`data: ${sourcesChunk}\n\n`));

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error('[ask-quran]', err);
    return new Response(JSON.stringify({ error: 'Failed to generate answer' }), { status: 500 });
  }
}
