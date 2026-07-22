// GET /api/user/me — same path + flat response shape as the old Next route.

import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.service';
import { UserRepository } from './user.repository';

@Controller('user')
export class UsersController {
  constructor(private readonly users: UserRepository) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() jwtUser: JwtUser) {
    const user = await this.users.findById(jwtUser.userId);
    if (!user) throw new NotFoundException({ error: 'User not found' });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  }
}
