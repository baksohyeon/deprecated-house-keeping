import {
  CACHE_MANAGER,
  Controller,
  Get,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import ms from 'ms';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginRequestUserDto } from './dto/login-request.dto';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private logger: Logger = new Logger(AuthController.name);

  @UseGuards(GoogleOauthGaurd)
  @Get('google/login')
  handleLogin() {
    // Guard redirects
  }

  @Get('test')
  test() {
    return this.authService.test();
  }

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  async googleAuthCallback(
    @RequestUser() data: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('x-refresh-token', data.tokens.refreshToken.token, {
      path: 'api/auth/google/refresh',
      maxAge: ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')),
      secure: false, // only in development
    });

    const accessToken = data.tokens.accessToken.token;
    const refreshToken = data.tokens.refreshToken.token;
    return {
      accessToken,
      refreshToken,
    };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/google/profile/logout/:userId')
  async logOut(
    @RequestUser() user: any,
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
  ) {
    const refreshToken = user.data.tokens.refreshToken.token;
    this.authService.revokeRefreshTokensAtRedis(userId);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('google/profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('google/refresh')
  async reissuanceAccessToken(
    @RequestUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    //TODO: refresh 토큰 확인하고 access 토큰 재발급
  }
}
