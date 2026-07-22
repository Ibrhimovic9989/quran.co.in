import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class RecordReadingDto {
  @ApiProperty({ minimum: 1, maximum: 114 })
  @Allow()
  surahNumber!: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Allow()
  ayahNumber?: number;
}
