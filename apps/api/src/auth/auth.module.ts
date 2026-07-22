import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';

// Global so feature modules can use JwtAuthGuard/OptionalJwtAuthGuard without
// re-importing (secrets are passed explicitly at sign/verify time).
@Global()
@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
