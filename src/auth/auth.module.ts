import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/google-strategy';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy],
})
export class AuthModule {}
