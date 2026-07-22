// Search endpoints — same paths + shapes as the old Next routes.
//   GET /api/search/semantic?q=&limit=
//   GET /api/search/similar?surah=&ayah=&limit=&offset=

import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SearchService } from './search.service';
import { enforceRateLimit } from '../common/rate-limit';

const MAX_QUERY_LENGTH = 200;
const SEARCH_RATE_LIMIT = 30; // per minute per IP
const SIMILAR_RATE_LIMIT = 40;
const MAX_OFFSET = 200; // bound fan-out: fetchLimit = (limit + offset) * 4
const WINDOW_MS = 60_000;

function parseIntOr(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
}

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly search: SearchService) {}

  @Get('semantic')
  async semantic(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('q') qRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const q = (qRaw ?? '').trim().slice(0, MAX_QUERY_LENGTH);
    const limit = Math.min(Math.max(parseIntOr(limitRaw, 8), 1), 20);

    if (q.length < 3) return { results: [] };

    // Rate limit per IP before spending an embedding call.
    enforceRateLimit(req, res, 'search', SEARCH_RATE_LIMIT, WINDOW_MS);

    // Vector search when an embedding provider is up; otherwise (or on
    // embedding failure) degrade to Postgres full-text keyword search.
    try {
      if (this.search.canVectorSearch()) {
        try {
          const vector = await this.search.embedQuery(q);
          const results = await this.search.semanticSearch(vector, limit);
          return { results };
        } catch (embedError) {
          this.logger.warn(`vector search unavailable, keyword fallback: ${String(embedError)}`);
        }
      }
      const results = await this.search.keywordSearch(q, limit);
      return { results };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('[semantic-search]', error as Error);
      throw new InternalServerErrorException({ error: 'Search failed' });
    }
  }

  @Get('similar')
  async similar(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('surah') surahRaw?: string,
    @Query('ayah') ayahRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('offset') offsetRaw?: string,
  ) {
    const surah = parseIntOr(surahRaw, 0);
    const ayah = parseIntOr(ayahRaw, 0);
    const limit = Math.min(Math.max(parseIntOr(limitRaw, 5), 1), 20);
    const offset = Math.min(Math.max(parseIntOr(offsetRaw, 0), 0), MAX_OFFSET);

    if (!surah || !ayah) {
      throw new BadRequestException({ error: 'surah and ayah params required' });
    }

    enforceRateLimit(req, res, 'similar', SIMILAR_RATE_LIMIT, WINDOW_MS);

    try {
      const result = await this.search.similarAyahs(surah, ayah, limit, offset);
      if (!result) {
        throw new NotFoundException({ error: 'Ayah not found in embeddings' });
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('[similar-ayahs]', error as Error);
      throw new InternalServerErrorException({ error: 'Search failed' });
    }
  }
}
