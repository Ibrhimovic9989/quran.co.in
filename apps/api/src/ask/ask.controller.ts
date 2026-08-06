// POST /api/quran/ask — RAG chat with SSE streaming.
// Same path + frame format as the old Next route so the web reader
// (apps/web/app/ask/page.tsx) is unchanged:
//   data: {"type":"sources","ayahs":[...]}\n\n
//   data: {"type":"token","text":"..."}\n\n   (repeated)
//   data: {"type":"done"}\n\n

import { Body, Controller, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AskService } from './ask.service';
import { AskRequestDto } from './dto/ask-request.dto';
import { AskAccessGuard } from './ask-access.guard';
import { runAskStream } from './ask-stream';
import { enforceRateLimit } from '../common/rate-limit';

const ASK_RATE_LIMIT = 15; // requests per minute per IP
const ASK_RATE_WINDOW_MS = 60_000;

@ApiTags('quran')
@Controller('quran')
export class AskController {
  private readonly logger = new Logger(AskController.name);

  constructor(private readonly ask: AskService) {}

  @Post('ask')
  @UseGuards(AskAccessGuard)
  async askQuestion(@Req() req: Request, @Res() res: Response, @Body() body: AskRequestDto) {
    // Rate limit per client IP before doing any expensive work.
    enforceRateLimit(req, res, 'ask', ASK_RATE_LIMIT, ASK_RATE_WINDOW_MS);
    await runAskStream(this.ask, res, body, this.logger);
  }
}
