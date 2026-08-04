import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DeveloperController } from './developer.controller';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  controllers: [DeveloperController],
  providers: [
    ApiKeyRepository,
    // Global, but pass-through for anonymous requests — see ApiKeyGuard.
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class DeveloperModule {}
