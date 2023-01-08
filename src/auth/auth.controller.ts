import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
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

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  async googleAuthCallback(
    @RequestUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const accessCookieConfig =
        await this.authService.getAccessTokenCookieConfig(user);
      const refreshCookieConfig =
        await this.authService.getRefreshTokenCookieConfig(user);

      // const { accessToken, ...accessCookieOptions } = accessTokenConfig;
      this.authService.saveHashedRefreshToken(
        refreshCookieConfig.refreshToken,
        user.id,
      );
      // 레디스 써서 해결: 구글 로그인할 때 DB를 보지않고 레디스를 봄 ->
      // 레디스에서 조립하고 DB 찌른다 ~ 기존 유저들은?
      // 레디스에서 없으면 DB까지 확인하면 레디스
      res.cookie(
        'access_token',
        accessCookieConfig.accessToken,
        accessCookieConfig.accessCookieOptions,
      );
      res.cookie(
        'refresh_token',
        refreshCookieConfig.refreshToken,
        refreshCookieConfig.refreshCookieOptions,
      );
      res.redirect(this.configService.get<string>('FRONTEND_URL'));
    } catch (e: any) {
      this.logger.error(e.message);
      throw new InternalServerErrorException(e.message ?? 'error has occurred');
    }
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('/google/logout')
  async logOut(
    @RequestUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resetCookieOptions = this.authService.resetCookieOptions();
    res.clearCookie('access_token', resetCookieOptions);
    res.clearCookie('refresh_token', resetCookieOptions);
    await this.authService.resetRefreshToken(user.id);
    return {
      status: 400,
      msg: 'OK',
    };
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('google/profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('test')
  test(@Req() req: Request) {
    return req.cookies;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('google/refresh')
  async reissuanceAccessToken(
    @RequestUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessCookieConfig =
      await this.authService.getAccessTokenCookieConfig(user);
    res.cookie(
      'access_token',
      accessCookieConfig.accessToken,
      accessCookieConfig.accessCookieOptions,
    );
    return {
      message: 'reissue access token',
      statusCode: HttpStatus.OK,
      user: user,
    };
  }
}
