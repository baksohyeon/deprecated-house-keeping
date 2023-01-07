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
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { UserInfoDto } from './dto/user-info.dto';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';
import { JwtAuthGaurd } from './guards/jwt-access.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      const accessTokenConfig =
        await this.authService.getAccessTokenCookieConfig(user);
      const refreshTokenConfig =
        await this.authService.getRefreshTokenCookieConfig(user);

      const { accessToken, ...accessCookieOptions } = accessTokenConfig;
      const { refreshToken, ...refreshCookieOptions } = refreshTokenConfig;
      this.authService.saveHashedRefreshToken(refreshToken, user.id);

      res.cookie('access_token', accessToken, accessCookieOptions);
      res.cookie('refresh_token', refreshToken, refreshCookieOptions);
      res.redirect('http://localhost:3000');
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
    return 'hello';
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, ...accessCookieOptions } =
      await this.authService.getAccessTokenCookieConfig(req.user as User);
    res.cookie('access_token', accessToken, accessCookieOptions);
    return {
      message: 'reissue access token',
      statusCode: HttpStatus.OK,
      user: req.user,
    };
  }
}
