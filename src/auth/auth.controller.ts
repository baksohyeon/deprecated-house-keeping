import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleOauthGaurd } from './guards/google-oauth-guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('google'))
  @Get('google/login')
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  handleRedirect() {
    return { msg: 'OK' };
  }
}
