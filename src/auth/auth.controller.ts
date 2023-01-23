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
import { ConfigType } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import tokenConfig from 'src/config/token.config';
import { RequestUser } from 'src/decorator/request-user.decorator';
import { User } from 'src/entities/user.entity';
import { RedisService } from 'src/auth/redis/redis.service';
import { ms } from 'src/util/convert-milliseconds.util';
import { AuthService } from './auth.service';
import { GoogleOauthGaurd } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(tokenConfig.KEY)
    private tokenOpts: ConfigType<typeof tokenConfig>,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  private logger: Logger = new Logger(AuthController.name);

  @UseGuards(GoogleOauthGaurd)
  @Get('google/login')
  handleLogin() {
    // Guard redirects
  }

  // @Get('test')
  // async test() {
  //   const result: any = await this.redisService.  private async getRefreshTokenInWhitelist(userId: string, jti: string) {
  //     (
  //     `f0c9ad9e-8e85-11ed-93a9-de361dafd48a`,
  //   );
  //   console.log(typeof result);
  //   console.log(result);
  //   console.log(result.tokenIds);
  //   result.tokenIds.push('test');
  //   console.log(result.tokenIds);
  //   return result;
  // }

  @UseGuards(GoogleOauthGaurd)
  @Get('google/redirect')
  async googleAuthCallback(
    @RequestUser() data: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('x-refresh-token', data.tokens.refreshToken.token, {
      path: 'api/auth/google/refresh',
      maxAge: this.tokenOpts.refresh.expiresIn,
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
    //TODO: refresh 토큰 확인하고 access 토큰 재발급
  }
}
