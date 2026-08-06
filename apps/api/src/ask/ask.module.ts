import { Module } from '@nestjs/common';
import { AskController } from './ask.controller';
import { AskService } from './ask.service';
import { AskAccessGuard } from './ask-access.guard';

// AuthService (for AskAccessGuard) comes from the global AuthModule.
@Module({
  controllers: [AskController],
  providers: [AskService, AskAccessGuard],
})
export class AskModule {}
