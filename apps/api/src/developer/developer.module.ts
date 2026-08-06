import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DeveloperController } from './developer.controller';
import { OAuthAppsController } from './oauth-apps.controller';
import { AskAccessController } from './ask-access.controller';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKeyGuard } from './api-key.guard';
import { OAuthModule } from '../oauth/oauth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [OAuthModule, UsersModule], // Logto (app registration) + UserRepository
  controllers: [DeveloperController, OAuthAppsController, AskAccessController],
  providers: [
    ApiKeyRepository,
    // Global, but pass-through for anonymous requests — see ApiKeyGuard.
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class DeveloperModule {}
