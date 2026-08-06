// Ask (AI) developer-access requests. A signed-in developer requests access
// (with a use-case); an admin approves or denies it. Approval flips their
// account's askAccess to "approved", which the Ask gate checks for any API key
// they own. Admins are the emails in ADMIN_EMAILS.
//   GET  /api/developer/ask-access                 -> your status
//   POST /api/developer/ask-access   { useCase }   -> request access
//   GET  /api/developer/ask-access/requests        -> all requests (admin)
//   POST /api/developer/ask-access/:userId/decision { decision } -> decide (admin)
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { UserRepository } from '../users/user.repository';
import { RequestAskAccessDto, AskDecisionDto } from './dto/ask-access.dto';

@ApiTags('developer')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('developer/ask-access')
@UseGuards(JwtAuthGuard)
export class AskAccessController {
  constructor(private readonly users: UserRepository) {}

  @Get()
  @ApiOperation({ summary: 'Your Ask (AI) access status.' })
  status(@CurrentUser() user: JwtUser) {
    return this.users.getAskAccess(user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Request Ask (AI) access for your account (owner-reviewed).' })
  async request(@CurrentUser() user: JwtUser, @Body() dto: RequestAskAccessDto) {
    const current = await this.users.getAskAccess(user.userId);
    if (current?.askAccess === 'approved') return current; // already granted
    const useCase = (dto?.useCase ?? '').trim();
    if (useCase.length < 20) {
      throw new BadRequestException({
        error: 'Describe your use-case in at least 20 characters.',
      });
    }
    return this.users.requestAskAccess(user.userId, useCase.slice(0, 2000));
  }

  // ── Owner admin ──────────────────────────────────────────────────────────
  @Get('requests')
  @ApiOperation({ summary: 'List Ask access requests (admins only).' })
  async list(@CurrentUser() user: JwtUser) {
    this.assertAdmin(user);
    return { requests: await this.users.listAskRequests() };
  }

  @Post(':userId/decision')
  @ApiOperation({ summary: 'Approve or deny a developer’s Ask access (admins only).' })
  async decide(
    @CurrentUser() user: JwtUser,
    @Param('userId') userId: string,
    @Body() dto: AskDecisionDto,
  ) {
    this.assertAdmin(user);
    if (dto?.decision !== 'approved' && dto?.decision !== 'denied') {
      throw new BadRequestException({ error: 'decision must be "approved" or "denied".' });
    }
    return this.users.decideAskAccess(userId, dto.decision);
  }

  /** Whether the caller is an admin — configured via ADMIN_EMAILS (comma-separated). */
  isAdmin(user: JwtUser): boolean {
    const admins = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return admins.includes(user.email.toLowerCase());
  }

  private assertAdmin(user: JwtUser) {
    if (!this.isAdmin(user)) throw new ForbiddenException({ error: 'Admins only.' });
  }
}
