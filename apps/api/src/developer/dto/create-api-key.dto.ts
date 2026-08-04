import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'A name for your app, so you can tell your keys apart.',
    example: 'My Qurʾān widget',
    maxLength: 80,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
