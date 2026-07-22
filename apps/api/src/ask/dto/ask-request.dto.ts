// Request body for POST /api/quran/ask.
// Validation stays manual in the controller (preserves legacy error shapes);
// @Allow() keeps the global whitelist ValidationPipe from stripping fields.

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class AskHistoryMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @Allow()
  role!: 'user' | 'assistant';

  @ApiProperty()
  @Allow()
  content!: string;
}

export class AskRequestDto {
  @ApiProperty({ description: 'The question to ask (3–1000 chars)', example: 'What does the Quran say about patience?' })
  @Allow()
  question!: string;

  @ApiPropertyOptional({ enum: ['focused', 'open'], default: 'focused' })
  @Allow()
  mode?: 'focused' | 'open';

  @ApiPropertyOptional({ type: [AskHistoryMessageDto], description: 'Prior conversation turns (last 20 kept)' })
  @Allow()
  history?: AskHistoryMessageDto[];
}
