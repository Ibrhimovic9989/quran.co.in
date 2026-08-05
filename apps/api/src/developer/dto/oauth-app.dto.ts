import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

const REDIRECT_URI_RULES = { require_tld: false, require_protocol: true, protocols: ['http', 'https'] };

export class CreateOAuthAppDto {
  @ApiProperty({ example: 'My Qurʾān app', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({
    example: ['https://myapp.com/callback'],
    description: 'Exact URLs users are returned to after authorizing. localhost is allowed for development.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @IsUrl(REDIRECT_URI_RULES, { each: true })
  redirectUris!: string[];
}

export class UpdateOAuthAppDto {
  @ApiProperty({ example: ['https://myapp.com/callback'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @IsUrl(REDIRECT_URI_RULES, { each: true })
  redirectUris!: string[];
}
