import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { LogtoService } from './logto.service';
import { LogtoAuthGuard } from './logto-auth.guard';
import { LogtoMeController } from './logto-me.controller';

// Third-party OAuth2 via Logto: token verification + scope enforcement +
// mapping a Logto user to our own User. Reused by any endpoint a third-party
// app may call on a user's behalf.
@Module({
  imports: [UsersModule],
  controllers: [LogtoMeController],
  providers: [LogtoService, LogtoAuthGuard],
  exports: [LogtoService, LogtoAuthGuard],
})
export class OAuthModule {}
