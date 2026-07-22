import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './jwt-auth.guard';
import type { JwtUser } from './auth.service';

/**
 * Injects the JWT-authenticated user ({ userId, email }) into a handler param.
 * Returns undefined under OptionalJwtAuthGuard when the request is anonymous.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user;
  },
);
