import { Global, Module } from '@nestjs/common';
import { LlmService } from './llm.service';

// Global: chat + embedding provider chain shared by Ask and Search.
@Global()
@Module({
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
