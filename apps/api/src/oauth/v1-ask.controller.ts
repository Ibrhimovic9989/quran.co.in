// Ask (AI), on behalf of a user, for third-party OAuth2 apps. Authorized by a
// Logto access token carrying the `ask:use` scope (the user consented to AI use)
// AND requires the app's developer to be approved for Ask — the same manual gate
// as the API-key path, because the AI has real per-call cost. Streams SSE
// identically to the first-party POST /api/quran/ask.
import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AskService } from '../ask/ask.service';
import { runAskStream } from '../ask/ask-stream';
import { AskRequestDto } from '../ask/dto/ask-request.dto';
import { UserRepository } from '../users/user.repository';
import { LogtoService } from './logto.service';
import { LogtoAuthGuard } from './logto-auth.guard';
import { RequiredScopes } from './scopes.decorator';

@ApiTags('oauth')
@ApiSecurity('oauth2')
@Controller('v1/ask')
export class V1AskController {
  private readonly logger = new Logger(V1AskController.name);

  constructor(
    private readonly ask: AskService,
    private readonly logto: LogtoService,
    private readonly users: UserRepository,
  ) {}

  @Post()
  @UseGuards(LogtoAuthGuard)
  @RequiredScopes('ask:use')
  @ApiOperation({
    summary:
      'Ask the Qurʼan (AI) on the user’s behalf. Scope: ask:use. The app’s developer must be approved for Ask.',
  })
  async askQuestion(
    @Req() req: Request & { oauthClientId?: string },
    @Res() res: Response,
    @Body() body: AskRequestDto,
  ) {
    // The AI has real cost: the developer behind this app must be Ask-approved.
    const clientId = req.oauthClientId;
    const ownerId = clientId ? await this.logto.appOwnerId(clientId) : undefined;
    const access = ownerId ? await this.users.getAskAccess(ownerId) : null;
    if (access?.askAccess !== 'approved') {
      res.status(403).json({
        error:
          'This app is not approved for Ask. The app’s developer must request Ask access in the developer console.',
      });
      return;
    }

    await runAskStream(this.ask, res, body, this.logger);
  }
}
