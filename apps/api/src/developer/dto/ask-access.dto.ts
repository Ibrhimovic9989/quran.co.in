import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class RequestAskAccessDto {
  @ApiProperty({
    description: 'What you will build with Ask, and your expected request volume.',
  })
  @Allow()
  useCase!: string;
}

export class AskDecisionDto {
  @ApiProperty({ enum: ['approved', 'denied'] })
  @Allow()
  decision!: 'approved' | 'denied';
}
