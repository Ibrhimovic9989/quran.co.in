import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DeveloperController } from './developer.controller';
import { OAuthAppsController } from './oauth-apps.controller';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKeyGuard } from './api-key.guard';
import { OAuthModule } from '../oauth/oauth.module';

@Module({
  imports: [OAuthModule], // LogtoService, for third-party app registration
  controllers: [DeveloperController, OAuthAppsController],
  providers: [
    ApiKeyRepository,
    // Global, but pass-through for anonymous requests — see ApiKeyGuard.
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class DeveloperModule {}
