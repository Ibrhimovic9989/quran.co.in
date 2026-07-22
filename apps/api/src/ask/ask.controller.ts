// POST /api/quran/ask — RAG chat with SSE streaming.
// Same path + frame format as the old Next route so the web reader
// (apps/web/app/ask/page.tsx) is unchanged:
//   data: {"type":"sources","ayahs":[...]}\n\n
//   data: {"type":"token","text":"..."}\n\n   (repeated)
//   data: {"type":"done"}\n\n

import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AskService, type HistoryMessage } from './ask.service';
import { enforceRateLimit } from '../common/rate-limit';

// Input limits — cap attacker-controlled payload to bound token cost.
const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CONTENT_LENGTH = 4000;

const ASK_RATE_LIMIT = 15; // requests per minute per IP
const ASK_RATE_WINDOW_MS = 60_000;

interface AskBody {
  question?: string;
  mode?: 'focused' | 'open';
  history?: HistoryMessage[];
}

@Controller('quran')
export class AskController {
  private readonly logger = new Logger(AskController.name);

  constructor(private readonly ask: AskService) {}

  @Post('ask')
  async askQuestion(@Req() req: Request, @Res() res: Response, @Body() body: AskBody) {
    // Rate limit per client IP before doing any expensive work.
    enforceRateLimit(req, res, 'ask', ASK_RATE_LIMIT, ASK_RATE_WINDOW_MS);

    const { question, mode = 'focused', history = [] } = body ?? {};

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      res.status(400).json({ error: 'Question is too long' });
      return;
    }
    if (mode !== 'focused' && mode !== 'open') {
      res.status(400).json({ error: 'Invalid mode' });
      return;
    }

    // Sanitize client-supplied history: validate role, cap count and length.
    const safeHistory: HistoryMessage[] = (Array.isArray(history) ? history : [])
      .filter(
        (m): m is HistoryMessage =>
          !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CONTENT_LENGTH) }));

    const q = question.trim();

    try {
      const rows = await this.ask.retrieveContext(q);

      if (!rows.length) {
        res.status(404).json({ error: 'No relevant ayahs found' });
        return;
      }

      const stream = await this.ask.createChatStream(q, mode, rows, safeHistory);

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
      this.logger.error('[ask-quran]', err as Error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate answer' });
      } else {
        res.end();
      }
    }
  }
}
