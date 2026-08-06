// Shared RAG-answer streamer for the Ask endpoints. Validates the request,
// retrieves context, and streams the answer as SSE frames:
//   data: {"type":"sources","ayahs":[...]}\n\n
//   data: {"type":"token","text":"..."}\n\n   (repeated)
//   data: {"type":"done"}\n\n
// Used by the first-party POST /api/quran/ask and the OAuth POST /api/v1/ask so
// the two stay identical.

import type { Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AskService, type HistoryMessage } from './ask.service';

const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CONTENT_LENGTH = 4000;

export interface AskInput {
  question?: unknown;
  mode?: unknown;
  history?: unknown;
}

/** Validate + stream. Writes the whole HTTP response itself (status, SSE, end). */
export async function runAskStream(
  ask: AskService,
  res: Response,
  body: AskInput | undefined,
  logger: Logger,
): Promise<void> {
  const question = typeof body?.question === 'string' ? body.question : '';
  const rawMode = body?.mode;

  if (!question || question.trim().length < 3) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    res.status(400).json({ error: 'Question is too long' });
    return;
  }
  if (rawMode !== undefined && rawMode !== 'focused' && rawMode !== 'open') {
    res.status(400).json({ error: 'Invalid mode' });
    return;
  }
  const mode: 'focused' | 'open' = rawMode === 'open' ? 'open' : 'focused';

  // Sanitize client-supplied history: validate role, cap count and length.
  const history = Array.isArray(body?.history) ? body.history : [];
  const safeHistory: HistoryMessage[] = history
    .filter(
      (m): m is HistoryMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CONTENT_LENGTH) }));

  const q = question.trim();

  try {
    // May be empty when embeddings are unavailable — the chat falls back to
    // answering without retrieved context rather than failing.
    const rows = await ask.retrieveContext(q);
    const stream = await ask.createChatStream(q, mode, rows, safeHistory);

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sourcesChunk = JSON.stringify({
      type: 'sources',
      ayahs: rows.map((r) => ({
        surahNumber: r.surahNumber,
        ayahNumber: r.ayahNumber,
        englishName: r.englishName,
        translationText: r.translationText,
      })),
    });
    res.write(`data: ${sourcesChunk}\n\n`);

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        res.write(`data: ${JSON.stringify({ type: 'token', text })}\n\n`);
      }
    }

    res.write('data: {"type":"done"}\n\n');
    res.end();
  } catch (err) {
    logger.error('[ask-stream]', err as Error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate answer' });
    } else {
      res.end();
    }
  }
}
