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
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import tokenConfig from 'src/config/token.config';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { RedisService } from 'src/auth/redis/redis.service';
import { ms } from 'src/util/convert-milliseconds.util';
import { AuthService } from './auth.service';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';
import { LoginResponse } from 'src/interfaces/login-response.interface';
import { triggerAsyncId } from 'async_hooks';
import { ReissuedTokenResult } from 'src/interfaces/reissued-token-result';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(tokenConfig.KEY)
    private tokenOpts: ConfigType<typeof tokenConfig>,
    private configService: ConfigService,
  ) {}

  private logger: Logger = new Logger(AuthController.name);

  @UseGuards(GoogleOauthGaurd)
  @Get('google/login')
  handleLogin() {
    // Guard redirects
  }

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  async googleAuthCallback(
    @RequestUser() data: LoginResponse,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('refresh-token', data.refreshToken, {
      domain: this.configService.get<string>('FRONTEND_URL'),
      path: '/',
      maxAge: this.tokenOpts.refresh.expiresIn,
      httpOnly: true,
    });
    res.cookie('access-token', data.accessToken, {
      domain: this.configService.get<string>('FRONTEND_URL'),
      path: '/',
      maxAge: this.tokenOpts.access.expiresIn,
      httpOnly: true,
    });
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/google/profile/logout/:userId')
  async logOut(
    @RequestUser() data: ReissuedTokenResult,
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
  ) {
    // TODO: 로그아웃 api 짜기
    const refreshToken = data.reissuedTokens.refreshToken;
    const accessToken = data.reissuedTokens.accessToken;
    res.cookie('access-token', null, {
      maxAge: 0,
      httpOnly: true,
    });
    res.cookie('refresh-token', null, {
      maxAge: 0,
      httpOnly: true,
    });
    // this.redisService.revokeRefreshTokens(userId);
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
    //TODO: refresh api 수정 및 테스트 코드 짜기
  }
}
