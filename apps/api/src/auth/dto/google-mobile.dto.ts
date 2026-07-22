import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class GoogleMobileDto {
  @ApiProperty({ description: 'Google ID token from native Google Sign-In (Flutter)' })
  @Allow()
  idToken!: string;
}
